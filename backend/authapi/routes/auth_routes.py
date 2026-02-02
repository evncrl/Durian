from flask import Blueprint, request, jsonify
from auth import signup_user, login_user, hash_password, signup_user_with_pfp
from db import users_collection, upload_user_pfp
from bson.objectid import ObjectId
import tempfile
import os
import traceback

# Create Blueprint
auth_bp = Blueprint('auth', __name__)

# ---------------------------
# Authentication Routes
# ---------------------------

@auth_bp.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    """User registration (JSON)"""
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

@auth_bp.route("/signup-with-pfp", methods=["POST", "OPTIONS"])
def signup_with_pfp():
    """User registration with profile picture (multipart/form-data)"""
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
        print(f"[ROUTE] Signup error: {str(e)}")
        print(f"[ROUTE] Traceback: {traceback.format_exc()}")
        return jsonify({"error": "Registration failed"}), 500

@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    """User login"""
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

@auth_bp.route("/debug/signup", methods=["POST"])
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
