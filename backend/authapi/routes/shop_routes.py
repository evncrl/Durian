from flask import Blueprint, request, jsonify
from db import products_collection, upload_image
from bson.objectid import ObjectId

shop_bp = Blueprint('shop', __name__)

# 1. Kunin ang lahat ng products
@shop_bp.route("/products", methods=["GET"])
def get_products():
    try:
        category = request.args.get('category')
        query = {}
        if category and category != "All":
            query = {"category": category}
            
        products = list(products_collection.find(query))
        for p in products:
            p['_id'] = str(p['_id'])
            
        return jsonify({"success": True, "products": products}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# 2. Mag-add ng bagong product
@shop_bp.route("/products", methods=["POST"])
def add_product():
    try:
        data = request.json
        required = ["name", "category", "price", "image_url", "description", "stock"]
        
        if not all(k in data for k in required):
            return jsonify({"success": False, "error": "Missing fields"}), 400
            
        result = products_collection.insert_one(data)
        return jsonify({"success": True, "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# 3. Unique Upload Function (Pinagsama ang logic at debug)
@shop_bp.route("/upload-image", methods=["POST", "OPTIONS"])
def upload_product_image():
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        # Debug Logs para sa Terminal
        print(f"--- UPLOAD DEBUG ---")
        if 'photo' not in request.files:
            return jsonify({"success": False, "error": "No photo field"}), 400

        file = request.files['photo']
        image_data = file.read()
        
        # I-upload sa Cloudinary via db.py function
        result = upload_image(image_data, folder="products")
        
        if result.get("success"):
            return jsonify({"success": True, "image_url": result["url"]}), 200
        else:
            return jsonify({"success": False, "error": result.get("error")}), 500

    except Exception as e:
        print(f"Upload Route Crash: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500