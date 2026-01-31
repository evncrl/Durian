from dotenv import load_dotenv
import os
from pymongo import MongoClient
from datetime import datetime
import cloudinary
import cloudinary.uploader
import cloudinary.api
from io import BytesIO
import uuid
from typing import Optional, Dict, Any

# Load .env
load_dotenv()

# ---------------------------
# MongoDB setup
# ---------------------------
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client["durianapp"]
users_collection = db["users"]

# ---------------------------
# Cloudinary setup
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


# Idagdag mo ito pansamantala sa dulo ng db.py tapos i-run ang file
def initialize_roles():
    result = users_collection.update_many(
        {"role": {"$exists": False}}, # Hanapin lahat ng walang 'role' field
        {"$set": {"role": "user"}}    # Gawin silang 'user'
    )
    print(f"Updated {result.modified_count} users with default role.")

# initialize_roles() # I-uncomment mo ito para tumakbo