# backend/authapi/routes/scanner_routes.py
from flask import Blueprint, request, jsonify
import tempfile
import os
from datetime import datetime

# Use local YOLO model (your trained model)
from ai.yolo_detector import get_yolo_detector

scanner_bp = Blueprint('scanner', __name__)

@scanner_bp.route("/health", methods=["GET"])
def health_check():
    """Check detector health"""
    detector = get_yolo_detector()
    test_result = detector.test_connection()
    
    return jsonify({
        "service": "Durian Scanner API",
        "model": str(detector.model_path.name) if detector.model_path else "Not loaded",
        "model_type": "Local YOLO (custom trained)",
        "available": detector.available,
        "connection_test": test_result,
        "timestamp": datetime.utcnow().isoformat()
    })

@scanner_bp.route("/detect", methods=["POST", "OPTIONS"])
def detect_durians():
    """Detect durians in uploaded image"""
    if request.method == "OPTIONS":
        return '', 200
    
    try:
        # Check if image was uploaded
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "No image provided",
                "message": "Please upload an image file"
            }), 400
        
        image_file = request.files['image']
        
        # Validate file
        if image_file.filename == '':
            return jsonify({
                "success": False,
                "error": "No file selected"
            }), 400
        
        # Check file extension
        allowed_extensions = {'jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp'}
        if '.' not in image_file.filename:
            return jsonify({
                "success": False,
                "error": "Invalid file name",
                "message": "File must have an extension"
            }), 400
        
        file_ext = image_file.filename.rsplit('.', 1)[1].lower()
        
        if file_ext not in allowed_extensions:
            return jsonify({
                "success": False,
                "error": "Invalid file type",
                "message": f"Allowed types: {', '.join(allowed_extensions)}"
            }), 400
        
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        image_file.seek(0, 2)  # Seek to end
        file_size = image_file.tell()
        image_file.seek(0)  # Reset to beginning
        
        if file_size > max_size:
            return jsonify({
                "success": False,
                "error": "File too large",
                "message": f"Maximum file size is 10MB. Your file is {file_size/1024/1024:.1f}MB"
            }), 400
        
        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_ext}') as tmp:
            image_file.save(tmp.name)
            temp_path = tmp.name
        
        print(f"🔍 Processing image: {image_file.filename} ({file_size/1024:.1f} KB)")
        
        # Use local YOLO model for detection
        detector = get_yolo_detector()
        result = detector.predict(temp_path)
        
        # Clean up temp file
        os.unlink(temp_path)
        
        # Add request info
        if result.get("success"):
            result["request_info"] = {
                "filename": image_file.filename,
                "file_size": file_size,
                "file_type": file_ext,
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return jsonify(result), 200 if result.get("success") else 500
        
    except Exception as e:
        print(f"❌ Scanner error: {e}")
        return jsonify({
            "success": False,
            "error": str(type(e).__name__),
            "message": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500

@scanner_bp.route("/classify/disease", methods=["POST", "OPTIONS"])
def classify_disease():
    """Classify durian disease - TODO: Add disease model"""
    if request.method == "OPTIONS":
        return '', 200
    
    # Disease classification not yet implemented with local model
    return jsonify({
        "success": False,
        "error": "Not implemented",
        "message": "Disease classification coming soon. Train a disease model and add it here."
    }), 501

def _get_disease_treatment(disease: str) -> dict:
    """Get treatment advice for disease"""
    treatments = {
        "stem_end_rot": {
            "urgency": "high",
            "actions": ["Remove infected fruits", "Apply copper fungicide"],
            "schedule": "Treat every 7-10 days for 3 applications"
        },
        "fungal_spots": {
            "urgency": "medium",
            "actions": ["Apply systemic fungicide", "Improve air circulation"],
            "schedule": "Treat every 10-14 days"
        },
        "bacterial_black_spot": {
            "urgency": "high",
            "actions": ["Prune infected branches", "Use copper bactericide"],
            "schedule": "Treat every 5-7 days during outbreak"
        },
        "healthy": {
            "urgency": "none",
            "actions": ["Continue regular monitoring", "Maintain good practices"],
            "schedule": "Weekly inspection recommended"
        }
    }
    
    return treatments.get(disease, {
        "urgency": "unknown",
        "actions": ["Consult agricultural expert"],
        "schedule": "N/A"
    })

@scanner_bp.route("/test", methods=["GET"])
def test_endpoint():
    """Test endpoint with sample prediction"""
    try:
        # Test local YOLO model
        detector = get_yolo_detector()
        test_result = detector.test_connection()
        
        return jsonify({
            "success": True,
            "message": "Scanner API is working",
            "model_type": "Local YOLO (custom trained)",
            "model_file": str(detector.model_path.name) if detector.model_path else "Not loaded",
            "connection": test_result,
            "endpoints": {
                "detect": "POST /scanner/detect",
                "classify_disease": "POST /scanner/classify/disease",
                "health": "GET /scanner/health"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500