from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from db import users_collection
from handlers.email_handler import send_deactivation_email, send_reactivation_email
import datetime

# Create Blueprint
admin_bp = Blueprint('admin', __name__)

# ---------------------------
# Admin User Management
# ---------------------------

@admin_bp.route("/users", methods=["GET", "OPTIONS"])
def get_all_users():
    """Get all users (admin)"""
    if request.method == "OPTIONS":
        return '', 200
    
    try:
        users = list(users_collection.find({}, {"password": 0}))  # Exclude passwords
        users_data = []
        
        for user in users:
            users_data.append({
                "id": str(user["_id"]),
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "role": user.get("role", "user"),
                "profile_picture": user.get("profile_picture", ""),
                "createdAt": user.get("createdAt", ""),
                "updatedAt": user.get("updatedAt", ""),
                "isActive": user.get("isActive", True)
            })
        
        return jsonify({
            "success": True,
            "users": users_data,
            "total": len(users_data)
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route("/users/<user_id>/role", methods=["PUT", "OPTIONS"])
def update_user_role(user_id):
    """Update user role (admin)"""
    if request.method == "OPTIONS":
        return '', 200
    
    try:
        data = request.json
        if not data or "role" not in data:
            return jsonify({"success": False, "error": "Missing role"}), 400
        
        valid_roles = ["user", "admin"]
        if data["role"] not in valid_roles:
            return jsonify({"success": False, "error": "Invalid role"}), 400
        
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": data["role"], "updatedAt": datetime.datetime.utcnow().isoformat()}}
        )
        
        if result.modified_count > 0:
            return jsonify({"success": True, "message": "Role updated"}), 200
        else:
            return jsonify({"success": False, "error": "User not found"}), 404
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route("/users/<user_id>/deactivate", methods=["PUT", "OPTIONS"])
def deactivate_user(user_id):
    """Deactivate user (admin) with reason and email notification"""
    if request.method == "OPTIONS":
        return '', 200
    
    try:
        # Get reason from request body
        data = request.json or {}
        reason = data.get("reason", "No reason provided")
        
        # First, get the user info for email
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        # Update user status
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "isActive": False,
                    "deactivationReason": reason,
                    "deactivatedAt": datetime.datetime.utcnow().isoformat(),
                    "updatedAt": datetime.datetime.utcnow().isoformat()
                }
            }
        )
        
        if result.modified_count > 0:
            # Send deactivation email
            user_email = user.get("email", "")
            user_name = user.get("name", "User")
            
            email_sent = False
            if user_email:
                email_sent = send_deactivation_email(user_email, user_name, reason)
            
            return jsonify({
                "success": True,
                "message": "User deactivated",
                "emailSent": email_sent
            }), 200
        else:
            return jsonify({"success": False, "error": "User not found or already deactivated"}), 404
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route("/users/<user_id>/activate", methods=["PUT", "OPTIONS"])
def activate_user(user_id):
    """Reactivate user (admin) with email notification"""
    if request.method == "OPTIONS":
        return '', 200
    
    try:
        # First, get the user info for email
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "isActive": True,
                    "updatedAt": datetime.datetime.utcnow().isoformat()
                },
                "$unset": {
                    "deactivationReason": "",
                    "deactivatedAt": ""
                }
            }
        )
        
        if result.modified_count > 0:
            # Send reactivation email
            user_email = user.get("email", "")
            user_name = user.get("name", "User")
            
            email_sent = False
            if user_email:
                email_sent = send_reactivation_email(user_email, user_name)
            
            return jsonify({
                "success": True,
                "message": "User reactivated",
                "emailSent": email_sent
            }), 200
        else:
            return jsonify({"success": False, "error": "User not found or already active"}), 404
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route("/users/<user_id>", methods=["DELETE", "OPTIONS"])
def delete_user(user_id):
    """Soft delete user (admin) - marks user as inactive"""
    if request.method == "OPTIONS":
        return '', 200
    
    try:
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"isActive": False, "updatedAt": datetime.datetime.utcnow().isoformat()}}
        )
        
        if result.modified_count > 0:
            return jsonify({"success": True, "message": "User deleted"}), 200
        else:
            return jsonify({"success": False, "error": "User not found"}), 404
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route("/stats", methods=["GET", "OPTIONS"])
def get_admin_stats():
    """Get admin dashboard stats"""
    if request.method == "OPTIONS":
        return '', 200
    
    try:
        total_users = users_collection.count_documents({})
        active_users = users_collection.count_documents({"isActive": True})
        admin_users = users_collection.count_documents({"role": "admin"})
        
        return jsonify({
            "success": True,
            "stats": {
                "total_users": total_users,
                "active_users": active_users,
                "admin_users": admin_users,
                "inactive_users": total_users - active_users
            }
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
