print("[DEBUG] shop_routes.py loaded")
from flask import Blueprint, request, jsonify
import cloudinary.uploader
import os
from db import get_db
from bson.objectid import ObjectId
from datetime import datetime

shop_bp = Blueprint('shop', __name__)

@shop_bp.route('/test', methods=['GET'])
def test_route():
    return jsonify({'success': True, 'message': 'Shop blueprint is working'})

@shop_bp.route('/upload-image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    try:
        upload_result = cloudinary.uploader.upload(file)
        url = upload_result.get('secure_url')
        if url:
            return jsonify({'url': url})
        else:
            return jsonify({'error': 'Upload failed'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_products_collection():
    db = get_db()
    return db['products']

@shop_bp.route('/products', methods=['GET'])
def get_products():
    try:
        products_col = get_products_collection()
        products = list(products_col.find())
        
        for p in products:
            p['_id'] = str(p['_id'])
            if 'image' in p:
                p['image_url'] = p.pop('image')

        return jsonify({
            "success": True, 
            "products": products
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@shop_bp.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    required = ['name', 'category', 'price', 'description', 'image_url']
    if not all(k in data for k in required):
        return jsonify({'success': False, 'error': 'Missing fields'}), 400
        
    products_col = get_products_collection()
    product = {
        'name': data['name'],
        'category': data['category'],
        'price': data['price'],
        'description': data['description'],
        'image': data['image_url'], 
        'isNew': data.get('isNew', False)
    }
    result = products_col.insert_one(product)
    return jsonify({'success': True, 'id': str(result.inserted_id)})

@shop_bp.route('/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    products_col = get_products_collection()
    update_fields = {k: v for k, v in data.items() if k in ['name', 'category', 'price', 'description', 'image', 'isNew']}
    result = products_col.update_one({'_id': ObjectId(product_id)}, {'$set': update_fields})
    return jsonify({'success': result.modified_count > 0})

@shop_bp.route('/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        products_col = get_products_collection()
        result = products_col.delete_one({'_id': ObjectId(product_id)})
        
        if result.deleted_count > 0:
            return jsonify({'success': True, 'message': 'Product deleted'}), 200
        else:
            return jsonify({'success': False, 'error': 'Product not found'}), 404
    except Exception as e:
        print(f"[ERROR] Delete failed: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
@shop_bp.route('/products/<product_id>/reviews', methods=['GET'])
def get_product_reviews(product_id):
    """Kukuha ng lahat ng reviews para sa isang specific na produkto"""
    try:
        db = get_db()
        
        product = db.products.find_one({"_id": ObjectId(product_id)})
        product_name = product.get('name') if product else None

        query = {
            "$or": [
                {"product_id": product_id},
                {"product_name": product_name}
            ]
        }
        
        reviews_cursor = db.reviews.find(query).sort("created_at", -1)
        reviews_list = list(reviews_cursor)
        
        for r in reviews_list:
            r['_id'] = str(r['_id'])
            if 'created_at' in r and isinstance(r['created_at'], datetime):
                r['created_at'] = r['created_at'].isoformat()
            r['username'] = r.get('user_name', 'Anonymous User')

        print(f"[DEBUG] Found {len(reviews_list)} reviews for {product_name or product_id}")
        return jsonify({"success": True, "reviews": reviews_list}), 200
    except Exception as e:
        print(f"[ERROR] Failed to fetch reviews: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@shop_bp.route('/reviews', methods=['POST'])
def add_product_review():
    """Submit a user review for a product"""
    try:
        data = request.json
        if not data: return jsonify({"success": False, "error": "No data"}), 400
            
        review_payload = {
            "user_id": data.get("user_id"),
            "user_name": data.get("user_name", "Anonymous"),
            "product_id": data.get("product_id"), 
            "product_name": data.get("product_name"),
            "rating": int(data.get("rating", 5)),
            "comment": data.get("comment", ""),
            "created_at": datetime.utcnow()
        }
        
        db = get_db()
        db.reviews.insert_one(review_payload)
        return jsonify({"success": True, "message": "Review submitted!"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500