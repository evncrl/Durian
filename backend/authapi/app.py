from flask import Flask, request, jsonify
from flask_cors import CORS
from auth import signup_user, login_user, hash_password, signup_user_with_pfp
from db import users_collection, upload_user_pfp
from bson.objectid import ObjectId
import os
import datetime
import tempfile

app = Flask(__name__)

# Allow ALL origins for ngrok testing
CORS(app, resources={r"/*": {"origins": "*"}})

#test
# Add to app.py
@app.route("/debug/signup", methods=["POST"])
def debug_signup():
    """Debug endpoint to test signup"""
    print("=== DEBUG SIGNUP REQUEST ===")
    print("Headers:", dict(request.headers))
    print("Content-Type:", request.content_type)
    
    if request.is_json:
        print("JSON data:", request.json)
    else:
        print("Form data:", request.form.to_dict())
        print("Files:", request.files)
    
    return jsonify({
        "debug": True,
        "method": request.method,
        "content_type": request.content_type,
        "has_json": request.is_json,
        "has_files": bool(request.files),
        "form_data": request.form.to_dict() if request.form else {},
        "file_names": list(request.files.keys()) if request.files else []
    })

@app.route("/health", methods=["GET"])
def health():
    """Simple health check"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "endpoints": {
            "signup": "POST /signup",
            "signup_with_pfp": "POST /signup-with-pfp",
            "login": "POST /login"
        }
    })

# Handle CORS preflight requests
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,ngrok-skip-browser-warning')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route("/", methods=["GET", "OPTIONS"])
def home():
    if request.method == "OPTIONS":
        return '', 200
    return jsonify({
        "message": "Auth API is running!",
        "ngrok": "Ready",
        "endpoints": [
            "POST /signup-with-pfp", 
            "POST /login",
            "PUT /update-pfp",
            "GET /profile/<id>"
        ]
    })

# ---------------------------
# Signup with PFP (ngrok compatible)
# ---------------------------
@app.route("/signup-with-pfp", methods=["POST", "OPTIONS"])
def signup_with_pfp_route():
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        print("[ROUTE] /signup-with-pfp called")
        print(f"[ROUTE] Content-Type: {request.content_type}")
        print(f"[ROUTE] Form keys: {list(request.form.keys())}")
        print(f"[ROUTE] File keys: {list(request.files.keys())}")
        
        # Debug: print all files in request
        for key in request.files:
            file = request.files[key]
            print(f"[ROUTE] File '{key}': {file.filename}, size: {file.content_length}")
        
        # Get form data
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        print(f"[ROUTE] Form data - name: {name}, email: {email}")
        
        if not all([name, email, password, confirm_password]):
            print(f"[ROUTE] Missing required fields")
            return jsonify({"error": "Missing required fields"}), 400
        
        # Get photo file
        photo_file = request.files.get('photo')
        print(f"[ROUTE] Photo file: {photo_file}")
        if photo_file:
            print(f"[ROUTE] Photo filename: {photo_file.filename}")
        
        result = signup_user_with_pfp(
            name=name,
            email=email,
            password=password,
            confirm_password=confirm_password,
            photo_file=photo_file
        )
        
        print(f"[ROUTE] Signup result: {result}")
        status_code = 200 if "success" in result else 400
        return jsonify(result), status_code
        
    except Exception as e:
        import traceback
        print(f"[ROUTE] Signup error: {str(e)}")
        print(f"[ROUTE] Traceback: {traceback.format_exc()}")
        return jsonify({"error": "Registration failed"}), 500

# ---------------------------
# Update PFP (ngrok compatible)
# ---------------------------
@app.route("/update-pfp", methods=["PUT", "POST", "OPTIONS"])
def update_profile_picture():
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

# ---------------------------
# Other endpoints (add OPTIONS method to all)
# ---------------------------
@app.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return '', 200
        
    data = request.json
    if not data:
        return jsonify({"error": "No data"}), 400
        
    required_fields = ["name", "email", "password", "confirm_password"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing fields"}), 400
    
    result = signup_user(
        name=data["name"],
        email=data["email"],
        password=data["password"],
        confirm_password=data["confirm_password"]
    )
    status_code = 200 if "success" in result else 400
    return jsonify(result), status_code

@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return '', 200
        
    data = request.json
    required_fields = ["email", "password"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing fields"}), 400
    
    result = login_user(
        email=data["email"],
        password=data["password"]
    )
    status_code = 200 if "success" in result else 401
    return jsonify(result), status_code

# ---------------------------
# GET profile (updated for Cloudinary)
# ---------------------------
@app.route("/profile/<user_id>", methods=["GET"])
def get_profile(user_id):
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

# ---------------------------
# UPDATE profile (updated for Cloudinary)
# ---------------------------
@app.route("/profile/<user_id>", methods=["PUT"])
def update_profile(user_id):
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

# ---------------------------
# Home/Test endpoint
# ---------------------------
@app.route("/status", methods=["GET", "OPTIONS"])
def status():
    return jsonify({
        "message": "Auth API is running!",
        "endpoints": {
            "POST /signup": "Regular signup (JSON)",
            "POST /signup-with-pfp": "Signup with profile picture (multipart/form-data)",
            "POST /login": "Login",
            "PUT /update-pfp": "Update profile picture",
            "GET /profile/<user_id>": "Get user profile",
            "PUT /profile/<user_id>": "Update user profile"
        }
    })

# ---------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)

    # ---------------------------
# ADMIN ENDPOINTS
# ---------------------------

@app.route("/admin/users", methods=["GET", "OPTIONS"])
def get_all_users():
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        # Kunin lahat ng users pero huwag isama ang password field
        users = list(users_collection.find({}, {"password": 0}))
        
        # Gawing string ang ObjectId para mabasa ng JSON
        for user in users:
            user["_id"] = str(user["_id"])
            
        return jsonify({
            "success": True,
            "total_users": len(users),
            "users": users
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/admin/users", methods=["GET", "OPTIONS"])
def get_all_users():
    if request.method == "OPTIONS":
        return '', 200
    try:
        # Kunin lahat ng users pero huwag isama ang password
        users = list(users_collection.find({}, {"password": 0}))
        # Gawing string ang ObjectId para mabasa ng frontend
        for user in users:
            user["_id"] = str(user["_id"])
            
        return jsonify({
            "success": True,
            "users": users
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500