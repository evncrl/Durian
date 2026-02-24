
print("[DEBUG] shop_routes.py loaded")
from flask import Blueprint, request, jsonify
import cloudinary.uploader
import os
from db import get_db
from bson.objectid import ObjectId

shop_bp = Blueprint('shop', __name__)

# Debug/test route to verify blueprint registration
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
    products_col = get_products_collection()
    result = products_col.delete_one({'_id': ObjectId(product_id)})
    return jsonify({'success': result.deleted_count > 0})
