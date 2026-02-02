from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from auth import hash_password
from db import users_collection, upload_user_pfp
import datetime
import tempfile
import os

# Create Blueprint
profile_bp = Blueprint('profile', __name__)

# ---------------------------
# Profile Routes
# ---------------------------

@profile_bp.route("/<user_id>", methods=["GET"])
def get_profile(user_id):
    """Get user profile"""
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "photoUri": user.get("photoProfile", "https://via.placeholder.com/120"),
            "photoProfile": user.get("photoProfile", "https://via.placeholder.com/120"),
            "photoThumbnail": user.get("photoThumbnail", user.get("photoProfile", "https://via.placeholder.com/120")),
            "photoPublicId": user.get("photoPublicId", ""),
            "createdAt": user.get("createdAt"),
            "updatedAt": user.get("updatedAt"),
            "isLoggedIn": user.get("isLoggedIn", False)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@profile_bp.route("/<user_id>", methods=["PUT"])
def update_profile(user_id):
    """Update user profile"""
    try:
        data = request.json
        
        # Build update data
        update_data = {
            "name": data.get("name"),
            "email": data.get("email"),
            "updatedAt": datetime.datetime.utcnow()
        }
        
        # Add Cloudinary fields if provided
        if data.get("photoProfile"):
            update_data["photoProfile"] = data.get("photoProfile")
        if data.get("photoPublicId"):
            update_data["photoPublicId"] = data.get("photoPublicId")
        
        # Handle password update
        if data.get("password"):
            update_data["password"] = hash_password(data["password"])

        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        # Update database
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return jsonify({"success": True, "message": "Profile updated"}), 200
        else:
            return jsonify({"success": False, "message": "No changes made"}), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@profile_bp.route("/update-pfp", methods=["PUT", "POST", "OPTIONS"])
def update_profile_picture():
    """Update profile picture"""
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        # Get user ID
        user_id = request.form.get('userId')
        if not user_id:
            return jsonify({"error": "User ID required"}), 400
        
        # Check user
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Check photo
        if 'photo' not in request.files:
            return jsonify({"error": "No photo provided"}), 400
        
        photo_file = request.files['photo']
        
        # Save temp file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
        photo_file.save(temp_file.name)
        temp_file.close()
        
        # Read file
        with open(temp_file.name, 'rb') as f:
            image_data = f.read()
        
        # Upload to Cloudinary
        upload_result = upload_user_pfp(
            image_data=image_data,
            user_id=user_id,
            username=user.get("name", "User")
        )
        
        # Clean up
        os.unlink(temp_file.name)
        
        if upload_result["success"]:
            # Update database
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {
                    "photoProfile": upload_result.get("url"),
                    "photoThumbnail": upload_result.get("thumbnail"),
                    "photoPublicId": upload_result.get("public_id")
                }}
            )
            
            return jsonify({
                "success": True,
                "message": "Profile picture updated",
                "photoProfile": upload_result.get("url"),
                "photoThumbnail": upload_result.get("thumbnail"),
                "photoPublicId": upload_result.get("public_id")
            }), 200
            
        return jsonify({"error": "Upload failed"}), 500
            
    except Exception as e:
        print(f"Update error: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500