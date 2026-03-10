from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from db import users_collection
from handlers.email_handler import send_deactivation_email, send_reactivation_email
from db import users_collection, get_global_analytics
from db import get_all_scans_data
import datetime
from handlers.report_handler import generate_analytics_pdf
from flask import send_file
from db import users_collection, get_global_analytics, get_all_scans_data, orders_collection, get_db
from handlers.email_handler import send_deactivation_email, send_reactivation_email, send_order_status_email
from db import db, posts_collection, comments_collection
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

@admin_bp.route("/analytics/overview", methods=["GET", "OPTIONS"])
def get_analytics_overview():
    """Get overall AI model and system analytics"""
    if request.method == "OPTIONS":
        return '', 200
    
    result = get_global_analytics()
    if result.get("success"):
        return jsonify(result), 200
    return jsonify(result), 500

@admin_bp.route("/scans/all", methods=["GET", "OPTIONS"])
def get_all_scans():
    """Fetch all scan records for admin management"""
    if request.method == "OPTIONS":
        return '', 200
    
    result = get_all_scans_data()
    if result["success"]:
        return jsonify(result), 200
    return jsonify(result), 500 

@admin_bp.route("/analytics/report", methods=["GET"])
def download_analytics_report():
    """Route remains clean by calling the external handler"""
    try:
        analytics_result = get_global_analytics() 
        if not analytics_result["success"]:
            return jsonify({"error": "Failed to fetch data"}), 500
        
        pdf_buffer = generate_analytics_pdf(analytics_result["stats"])
        
        return send_file(
            pdf_buffer, 
            as_attachment=True, 
            download_name=f"Durianostics_Report_{datetime.date.today()}.pdf", 
            mimetype='application/pdf'
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ---------------------------
# Order Management
# ---------------------------

@admin_bp.route("/orders", methods=["GET", "OPTIONS"])
def get_all_orders():
    if request.method == "OPTIONS": return '', 200
    try:
        orders = list(orders_collection.find().sort([("created_at", -1), ("createdAt", -1)]))
        orders_data = []
        for o in orders:
            orders_data.append({
                "id": str(o["_id"]),
                "email": o.get("email", ""),
                "items": o.get("items", []),
                "total": o.get("total", 0),
                "address": o.get("address", ""),
                "phone": o.get("phone", ""),
                "paymentMethod": o.get("paymentMethod", "COD"),
                "status": o.get("status", "Pending"),
                "createdAt": o.get("created_at") or o.get("createdAt") or ""
            })
        return jsonify({"success": True, "orders": orders_data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route("/orders/<order_id>/status", methods=["PUT", "OPTIONS"])
def update_order_status(order_id):
    if request.method == "OPTIONS": return '', 200
    try:
        data = request.json
        new_status = data.get("status")
        if not new_status:
            return jsonify({"success": False, "error": "Status required"}), 400

        order = orders_collection.find_one({"_id": ObjectId(order_id)})
        if not order:
            return jsonify({"success": False, "error": "Order not found"}), 404

        result = orders_collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": new_status, "updatedAt": datetime.datetime.utcnow().isoformat()}}
        )

        if result.modified_count > 0:
            send_order_status_email(
                user_email=order.get("email"), 
                status=new_status, 
                transaction_id=order.get("transaction_id", "N/A"),
                items=order.get("items", []), 
                total=order.get("total", 0)
            )
            return jsonify({"success": True, "message": f"Order marked as {new_status}"}), 200
        
        return jsonify({"success": False, "error": "Status was not changed"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
    
@admin_bp.route("/reviews", methods=["GET", "OPTIONS"])
def get_all_reviews():
    """Fetch all product reviews for admin management"""
    if request.method == "OPTIONS": 
        return '', 200
    try:
        db = get_db()
        reviews = list(db.reviews.find().sort("created_at", -1))
        
        reviews_data = []
        for r in reviews:
            reviews_data.append({
                "id": str(r["_id"]),
                "user_name": r.get("user_name", "Anonymous"),
                "product_name": r.get("product_name", "Unknown Product"),
                "rating": r.get("rating", 0),
                "comment": r.get("comment", ""),
                "createdAt": r.get("created_at").isoformat() if r.get("created_at") else ""
            })
            
        return jsonify({
            "success": True, 
            "reviews": reviews_data,
            "total": len(reviews_data)
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@admin_bp.route("/reviews/<review_id>", methods=["DELETE", "OPTIONS"])
def delete_review(review_id):
    """Admin can delete a specific product review"""
    if request.method == "OPTIONS": 
        return '', 200
    try:
        db = get_db()
        result = db.reviews.delete_one({"_id": ObjectId(review_id)})
        
        if result.deleted_count > 0:
            return jsonify({"success": True, "message": "Review deleted successfully"}), 200
        return jsonify({"success": False, "error": "Review not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
# ---------------------------
# Forum Management (Admin)
# ---------------------------
from db import posts_collection, get_all_posts_admin

@admin_bp.route("/forum/posts", methods=["GET", "OPTIONS"])
def admin_get_posts():
    """Admin view of all forum posts"""
    if request.method == "OPTIONS": return '', 200
    result = get_all_posts_admin()
    if result["success"]:
        return jsonify(result), 200
    return jsonify(result), 500

@admin_bp.route("/forum/post/<post_id>", methods=["DELETE", "OPTIONS"])
def admin_delete_post(post_id):
    if request.method == "OPTIONS": return '', 200
    try:
        print(f"[Admin] Searching for ID: {post_id}")
        
        target = posts_collection.find_one({"_id": ObjectId(post_id)}) or posts_collection.find_one({"_id": post_id})
        collection_name = "posts"

        if not target:
            target = comments_collection.find_one({"_id": ObjectId(post_id)}) or comments_collection.find_one({"_id": post_id})
            collection_name = "comments"

        if not target:
            print(f"[Admin] ID {post_id} not found anywhere.")
            return jsonify({"success": False, "error": "Post/Comment not found"}), 404

        user_id = target.get("user_id")
        user_email = None
        user_name = "User"
        
        if user_id:
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user_email = user.get("email")
                user_name = user.get("name") or user.get("username") or "User"

        if collection_name == "posts":
            result = posts_collection.delete_one({"_id": target["_id"]})
        else:
            result = comments_collection.delete_one({"_id": target["_id"]})

        if result.deleted_count > 0:
            print(f"[Admin] Successfully deleted from {collection_name}.")
            
            if user_email:
                try:
                    from handlers.email_handler import send_forum_delete_email
                    content_snippet = target.get("title") or target.get("content")[:30]
                    send_forum_delete_email(user_email, user_name, content_snippet)
                    print("[Admin] Email notification sent!")
                except Exception as mail_err:
                    print(f"[Admin] Mail Error: {mail_err}")

            return jsonify({"success": True, "message": f"Deleted from {collection_name}"}), 200

    except Exception as e:
        import traceback
        print(f"[Admin] ERROR: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500