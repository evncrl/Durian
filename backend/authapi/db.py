from dotenv import load_dotenv
import os
from pymongo import MongoClient
from datetime import datetime
import cloudinary
import cloudinary.uploader
import cloudinary.api
from io import BytesIO
import uuid
from typing import Optional, Dict, Any, List
from bson import ObjectId

# Load .env
load_dotenv()

# ---------------------------
# MongoDB setup
# ---------------------------
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client["durianapp"]
users_collection = db["users"]
comments_collection = db["comments"]

# ---------------------------
# Cloudinary setup
# ---------------------------
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

print(f"[DB] Cloudinary configured: cloud_name={os.getenv('CLOUDINARY_CLOUD_NAME')}")

# ---------------------------
# JWT config
# ---------------------------
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", 24))

# ---------------------------
# Helper functions
# ---------------------------

def set_logged_in(user_id: str, is_logged_in: bool):
    """Update the user's login status."""
    users_collection.update_one(
        {"_id": user_id},
        {"$set": {"isLoggedIn": is_logged_in, "lastLogin": datetime.utcnow()}},
        upsert=False
    )

def update_photo_profile(user_id: str, photo_url: str, photo_public_id: Optional[str] = None):
    """Update the user's profile photo."""
    update_data = {"photoProfile": photo_url}
    if photo_public_id:
        update_data["photoPublicId"] = photo_public_id
    
    users_collection.update_one(
        {"_id": user_id},
        {"$set": update_data},
        upsert=False
    )

#comments

# Posts collection
posts_collection = db["posts"]

def create_comment(user_id: str, post_id: str, content: str) -> Optional[Dict[str, Any]]:
    """
    Create a new comment for a forum post (stores ObjectIds)
    """
    try:
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
        post_oid = ObjectId(post_id) if not isinstance(post_id, ObjectId) else post_id

        user = users_collection.find_one({"_id": user_oid})
        if not user:
            return None

        post = posts_collection.find_one({"_id": post_oid})
        if not post:
            return None

        comment_data = {
            "user_id": user_oid,
            "username": user.get("name", "Anonymous"),
            "user_avatar": user.get("photoProfile", ""),
            "post_id": post_oid,
            "content": content,
            "likes": 0,
            "liked_by": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = comments_collection.insert_one(comment_data)

        # Increment post replies count
        posts_collection.update_one({"_id": post_oid}, {"$inc": {"replies": 1}})

        if result.inserted_id:
            return comments_collection.find_one({"_id": result.inserted_id})
        return None

    except Exception as e:
        print(f"[DB] Error creating comment: {e}")
        return None


def get_comments_by_post(post_id: str, limit: int = 50, skip: int = 0) -> List[Dict[str, Any]]:
    """
    Get all comments for a specific post (post_id as string)
    """
    try:
        post_oid = ObjectId(post_id) if not isinstance(post_id, ObjectId) else post_id
        comments = comments_collection.find({"post_id": post_oid}).sort("created_at", 1).skip(skip).limit(limit)
        return list(comments)
    except Exception as e:
        print(f"[DB] Error getting comments: {e}")
        return []


def get_comment_count(post_id: str) -> int:
    try:
        post_oid = ObjectId(post_id) if not isinstance(post_id, ObjectId) else post_id
        return comments_collection.count_documents({"post_id": post_oid})
    except Exception as e:
        print(f"[DB] Error counting comments: {e}")
        return 0


def like_comment(comment_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """Toggle like/unlike for a comment"""
    try:
        comment_oid = ObjectId(comment_id) if not isinstance(comment_id, ObjectId) else comment_id
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id

        comment = comments_collection.find_one({"_id": comment_oid})
        if not comment:
            return None

        liked_by = comment.get("liked_by", [])

        if user_oid in liked_by:
            comments_collection.update_one(
                {"_id": comment_oid},
                {"$pull": {"liked_by": user_oid}, "$inc": {"likes": -1}, "$set": {"updated_at": datetime.utcnow()}}
            )
            liked = False
        else:
            comments_collection.update_one(
                {"_id": comment_oid},
                {"$addToSet": {"liked_by": user_oid}, "$inc": {"likes": 1}, "$set": {"updated_at": datetime.utcnow()}}
            )
            liked = True

        return comments_collection.find_one({"_id": comment_oid})
    except Exception as e:
        print(f"[DB] Error liking comment: {e}")
        return None


def update_comment(comment_id: str, user_id: str, new_content: str) -> Optional[Dict[str, Any]]:
    try:
        comment_oid = ObjectId(comment_id) if not isinstance(comment_id, ObjectId) else comment_id
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id

        comment = comments_collection.find_one({"_id": comment_oid, "user_id": user_oid})
        if not comment:
            return None

        comments_collection.update_one({"_id": comment_oid}, {"$set": {"content": new_content, "updated_at": datetime.utcnow()}})
        return comments_collection.find_one({"_id": comment_oid})
    except Exception as e:
        print(f"[DB] Error updating comment: {e}")
        return None


def delete_comment(comment_id: str, user_id: str) -> bool:
    try:
        comment_oid = ObjectId(comment_id) if not isinstance(comment_id, ObjectId) else comment_id
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id

        # Fetch comment so we can access post_id for decrementing replies
        comment = comments_collection.find_one({"_id": comment_oid, "user_id": user_oid})
        if not comment:
            return False

        result = comments_collection.delete_one({"_id": comment_oid, "user_id": user_oid})
        if result.deleted_count > 0:
            # Decrement replies on post
            try:
                posts_collection.update_one({"_id": comment.get("post_id")}, {"$inc": {"replies": -1}})
            except:
                pass
            return True
        return False
    except Exception as e:
        print(f"[DB] Error deleting comment: {e}")
        return False


def get_user_comments(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    try:
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
        comments = comments_collection.find({"user_id": user_oid}).sort("created_at", -1).limit(limit)
        return list(comments)
    except Exception as e:
        print(f"[DB] Error getting user comments: {e}")
        return []


def has_user_liked_comment(comment_id: str, user_id: str) -> bool:
    try:
        comment_oid = ObjectId(comment_id) if not isinstance(comment_id, ObjectId) else comment_id
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
        comment = comments_collection.find_one({"_id": comment_oid, "liked_by": user_oid})
        return comment is not None
    except Exception as e:
        print(f"[DB] Error checking like status: {e}")
        return False


# ---------------------------
# Posts Functions
# ---------------------------

def create_post(user_id: str, title: str, content: str, category: str) -> Optional[Dict[str, Any]]:
    try:
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
        user = users_collection.find_one({"_id": user_oid})
        if not user:
            return None

        post_data = {
            "user_id": user_oid,
            "username": user.get("name", "Anonymous"),
            "user_avatar": user.get("photoProfile", ""),
            "title": title,
            "content": content,
            "category": category,
            "replies": 0,
            "views": 0,
            "likes": 0,
            "liked_by": [],
            "is_pinned": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = posts_collection.insert_one(post_data)
        if result.inserted_id:
            return posts_collection.find_one({"_id": result.inserted_id})
        return None
    except Exception as e:
        print(f"[DB] Error creating post: {e}")
        return None


def get_post(post_id: str, increment_views: bool = True) -> Optional[Dict[str, Any]]:
    try:
        post_oid = ObjectId(post_id) if not isinstance(post_id, ObjectId) else post_id
        post = posts_collection.find_one({"_id": post_oid})
        if not post:
            return None
        if increment_views:
            posts_collection.update_one({"_id": post_oid}, {"$inc": {"views": 1}})
        return posts_collection.find_one({"_id": post_oid})
    except Exception as e:
        print(f"[DB] Error getting post: {e}")
        return None


def get_posts(category: str = "All", limit: int = 50, skip: int = 0, search: str = "") -> Dict[str, Any]:
    try:
        query = {}
        if category and category != "All":
            query["category"] = category
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"content": {"$regex": search, "$options": "i"}},
                {"username": {"$regex": search, "$options": "i"}}
            ]

        posts = list(posts_collection.find(query).sort("created_at", -1).skip(skip).limit(limit))
        total = posts_collection.count_documents(query)
        return {"posts": posts, "total": total}
    except Exception as e:
        print(f"[DB] Error getting posts: {e}")
        return {"posts": [], "total": 0}


def like_post(post_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    try:
        post_oid = ObjectId(post_id) if not isinstance(post_id, ObjectId) else post_id
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id

        post = posts_collection.find_one({"_id": post_oid})
        if not post:
            return None

        liked_by = post.get("liked_by", [])
        if user_oid in liked_by:
            posts_collection.update_one(
                {"_id": post_oid},
                {"$pull": {"liked_by": user_oid}, "$inc": {"likes": -1}, "$set": {"updated_at": datetime.utcnow()}}
            )
            liked = False
        else:
            posts_collection.update_one(
                {"_id": post_oid},
                {"$addToSet": {"liked_by": user_oid}, "$inc": {"likes": 1}, "$set": {"updated_at": datetime.utcnow()}}
            )
            liked = True

        return posts_collection.find_one({"_id": post_oid})
    except Exception as e:
        print(f"[DB] Error liking post: {e}")
        return None


def get_forum_stats() -> Dict[str, int]:
    try:
        total_posts = posts_collection.count_documents({})
        total_comments = comments_collection.count_documents({})
        total_users = users_collection.count_documents({})
        return {"total_posts": total_posts, "total_comments": total_comments, "total_users": total_users}
    except Exception as e:
        print(f"[DB] Error getting stats: {e}")
        return {"total_posts": 0, "total_comments": 0, "total_users": 0}

# ---------------------------
# Cloudinary PFP Functions
# ---------------------------

def upload_user_pfp(
    image_data: bytes,
    user_id: str,
    username: str,
    delete_old: bool = True
) -> Dict[str, Any]:
    """
    Upload user profile picture to Cloudinary and update MongoDB
    
    Args:
        image_data: Image bytes
        user_id: MongoDB user ID
        username: Username for naming
        delete_old: Delete old PFP from Cloudinary
    
    Returns:
        Dictionary with upload result
    """
    try:
        # Convert user_id to ObjectId if it's a string
        if isinstance(user_id, str):
            from bson.objectid import ObjectId
            user_id = ObjectId(user_id)
        
        # Get user to check for existing PFP
        user = users_collection.find_one({"_id": user_id})
        
        # Delete old PFP if exists and delete_old is True
        if delete_old and user and "photoPublicId" in user:
            try:
                cloudinary.uploader.destroy(user["photoPublicId"])
            except:
                pass  # Ignore deletion errors
        
        # Generate unique public ID
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        public_id = f"users/{user_id}/pfp_{username}_{timestamp}"
        
        # Upload to Cloudinary with face detection and auto-crop
        print(f"[DB] Uploading image to Cloudinary: {len(image_data)} bytes")
        print(f"[DB] Public ID: {public_id}")
        
        upload_result = cloudinary.uploader.upload(
            BytesIO(image_data),
            public_id=public_id,
            folder=f"users/{user_id}",
            overwrite=True,
            transformation=[
                {"width": 500, "height": 500, "crop": "fill", "gravity": "face"},
                {"quality": "auto:good"},
                {"fetch_format": "auto"}
            ]
        )
        
        print(f"[DB] Cloudinary response: {upload_result}")
        
        # Extract URLs (original and thumbnail)
        secure_url = upload_result.get("secure_url")
        public_id = upload_result.get("public_id")
        
        print(f"[DB] Secure URL: {secure_url}")
        print(f"[DB] Public ID from response: {public_id}")
        
        # Create thumbnail URL
        thumbnail_url = cloudinary.utils.cloudinary_url(
            public_id,
            width=150,
            height=150,
            crop="fill",
            gravity="face",
            quality="auto:good",
            fetch_format="auto"
        )[0]
        
        print(f"[DB] Thumbnail URL: {thumbnail_url}")
        
        # Update MongoDB with both URLs
        users_collection.update_one(
            {"_id": user_id},
            {"$set": {
                "photoProfile": secure_url,
                "photoThumbnail": thumbnail_url,
                "photoPublicId": public_id,
                "photoUpdatedAt": datetime.utcnow()
            }},
            upsert=False
        )
        
        print(f"[DB] MongoDB updated successfully")
        
        return {
            "success": True,
            "photoProfile": secure_url,
            "photoThumbnail": thumbnail_url,
            "photoPublicId": public_id,
            "url": secure_url,
            "thumbnail": thumbnail_url,
            "public_id": public_id,
            "format": upload_result.get("format"),
            "size": upload_result.get("bytes")
        }
        
    except Exception as e:
        import traceback
        print(f"[DB] Cloudinary upload failed: {str(e)}")
        print(f"[DB] Traceback: {traceback.format_exc()}")
        raise Exception(f"Cloudinary upload failed: {str(e)}")

def delete_user_pfp(user_id: str) -> bool:
    """
    Delete user's profile picture from Cloudinary and MongoDB
    """
    try:
        user = users_collection.find_one({"_id": user_id})
        
        if not user or "photoPublicId" not in user:
            return False
        
        # Delete from Cloudinary
        result = cloudinary.uploader.destroy(user["photoPublicId"])
        
        if result.get("result") == "ok":
            # Remove PFP data from MongoDB
            users_collection.update_one(
                {"_id": user_id},
                {"$unset": {
                    "photoProfile": "",
                    "photoThumbnail": "",
                    "photoPublicId": "",
                    "photoUpdatedAt": ""
                }},
                upsert=False
            )
            return True
        return False
        
    except:
        return False

def get_pfp_url(user_id: str, size: str = "original") -> Optional[str]:
    """
    Get user's profile picture URL with optional size
    """
    user = users_collection.find_one({"_id": user_id})
    
    if not user:
        return None
    
    if size == "thumbnail" and "photoThumbnail" in user:
        return user["photoThumbnail"]
    elif "photoProfile" in user:
        return user["photoProfile"]
    
    return None

def generate_default_pfp_url(username: str) -> str:
    """
    Generate a default profile picture URL using UI Avatars
    or similar service
    """
    # Using UI Avatars API
    initials = username[:2].upper() if len(username) >= 2 else "U"
    return f"https://ui-avatars.com/api/?name={initials}&background=random&color=fff&size=150&bold=true"