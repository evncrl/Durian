# backend/authapi/auth.py

from db import users_collection, upload_user_pfp

from passlib.context import CryptContext

from jose import jwt

import datetime

from bson.objectid import ObjectId

import os



# Password hashing

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")



# JWT config

JWT_SECRET = "8282fcd97e60e2e51005e284bd45f8b692d4ab4cd7916fe9e9ace2e375a5c8d8" 

JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_HOURS = 24



# ---------------------------

# Helper functions

# ---------------------------

def hash_password(password: str) -> str:

    return pwd_context.hash(password)



def verify_password(password: str, hashed: str) -> bool:

    try:

        return pwd_context.verify(password, hashed)

    except:

        return password == hashed



# OLD SIGNUP FUNCTION (without photo)

def signup_user(name: str, email: str, password: str, confirm_password: str):

    if password != confirm_password:

        return {"error": "Passwords do not match"}



    if users_collection.find_one({"email": email}):

        return {"error": "User already exists"}



    hashed = hash_password(password)

    users_collection.insert_one({

        "name": name,

        "email": email,

        "password": hashed,

        "isLoggedIn": False,

        "photoProfile": "https://via.placeholder.com/120",

        "createdAt": datetime.datetime.utcnow()

    })

    return {"success": True, "message": "User registered successfully"}



def login_user(email: str, password: str):

    user = users_collection.find_one({"email": email})

    if not user or not verify_password(password, user["password"]):

        return {"error": "Invalid credentials"}



    # Set isLoggedIn True

    users_collection.update_one(

        {"_id": user["_id"]},

        {"$set": {"isLoggedIn": True, "lastLogin": datetime.datetime.utcnow()}}

    )



    # JWT payload

    payload = {

        "sub": str(user["_id"]),

        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)



    return {

        "success": True,

        "token": token,

        "user": {

            "id": str(user["_id"]),

            "name": user["name"],

            "email": user["email"],

            "photoProfile": user.get("photoProfile", "https://via.placeholder.com/120")

        }

    }



# NEW: Cloudinary signup function

def signup_user_with_pfp(name, email, password, confirm_password, photo_file=None):

    """Signup user with profile picture upload to Cloudinary"""

    if password != confirm_password:

        return {"error": "Passwords do not match"}



    if users_collection.find_one({"email": email}):

        return {"error": "User already exists"}



    hashed = hash_password(password)

    

    # Create user document first

    user_doc = {

        "name": name,

        "email": email,

        "password": hashed,

        "isLoggedIn": True,

        "createdAt": datetime.datetime.utcnow(),

        "lastLogin": datetime.datetime.utcnow()

    }


    
    # Insert user

    result = users_collection.insert_one(user_doc)

    user_id_obj = result.inserted_id
    user_id = str(result.inserted_id)

    

    # Handle profile picture

    photo_data = None

    

    if photo_file:

        try:
            print(f"[SIGNUP] Photo file received: {photo_file.filename}")
            print(f"[SIGNUP] Photo file size: {photo_file.content_length}")
            
            # Read file directly into bytes without temp file
            photo_file.seek(0)  # Make sure we're at the start
            image_data = photo_file.read()
            print(f"[SIGNUP] Image data read: {len(image_data)} bytes")
            
            # Upload to Cloudinary

            print(f"[SIGNUP] Uploading to Cloudinary with user_id: {user_id}")
            upload_result = upload_user_pfp(

                image_data=image_data,

                user_id=user_id,  

                username=name,

                delete_old=False

            )

            print(f"[SIGNUP] Upload result: {upload_result}")
            

            if upload_result.get("success"):

                photo_data = {

                    "photoProfile": upload_result.get("photoProfile") or upload_result.get("url"),

                    "photoThumbnail": upload_result.get("photoThumbnail") or upload_result.get("thumbnail"),

                    "photoPublicId": upload_result.get("photoPublicId") or upload_result.get("public_id")

                }

            else:

                # Use default avatar

                default_url = f"https://ui-avatars.com/api/?name={name[:2]}&background=random&color=fff&size=400"

                photo_data = {

                    "photoProfile": default_url,

                    "photoThumbnail": default_url

                }

            

        except Exception as e:

            import traceback
            print(f"[SIGNUP] PFP upload error: {str(e)}")
            print(f"[SIGNUP] Error traceback: {traceback.format_exc()}")

            # Use default avatar

            default_url = f"https://ui-avatars.com/api/?name={name[:2]}&background=random&color=fff&size=400"

            photo_data = {

                "photoProfile": default_url,

                "photoThumbnail": default_url

            }

    else:
        print(f"[SIGNUP] No photo file provided")

        # No photo provided, use default

        default_url = f"https://ui-avatars.com/api/?name={name[:2]}&background=random&color=fff&size=400"

        photo_data = {

            "photoProfile": default_url,

            "photoThumbnail": default_url

        }
    # Update user with photo data

    if photo_data:

        users_collection.update_one(

            {"_id": result.inserted_id},

            {"$set": photo_data}

        )
    # Get updated user

    user = users_collection.find_one({"_id": result.inserted_id})
    # Generate JWT token for auto-login

    payload = {

        "sub": str(user["_id"]),

        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

    }

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {

        "success": True,

        "message": "User registered successfully",

        "token": token,  
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "photoProfile": user.get("photoProfile"),
            "photoThumbnail": user.get("photoThumbnail"),
            "photoPublicId": user.get("photoPublicId"),
            "createdAt": user["createdAt"]
        }
    }