# backend/authapi/routes/scanner_routes.py
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import tempfile
import os
from datetime import datetime
import uuid

# Use local YOLO model (your trained model)
from ai.yolo_detector import get_yolo_detector
from ai.durian_color import get_durian_color
from ai.durian_desease import get_durian_disease
from ai.durian_size import get_durian_size
from handlers.cloudinary_handler import CloudinaryScan
from db import (
    save_scan, get_user_scans, get_scan_by_id, delete_scan,
    get_user_scan_stats, get_weekly_scan_data, get_quality_distribution
)

scanner_bp = Blueprint('scanner', __name__)

# ---------------------------
# Health / Test Routes
# ---------------------------

@scanner_bp.route("/health", methods=["GET"])
@cross_origin()  # Allow CORS for GET
def health_check():
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


@scanner_bp.route("/test", methods=["GET"])
@cross_origin()  # Allow CORS for GET
def test_endpoint():
    try:
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
                "health": "GET /scanner/health",
                "history": "GET /scanner/history/<user_id>",
                "analytics": "GET /scanner/analytics/<user_id>"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ---------------------------
# Detection Routes
# ---------------------------

@scanner_bp.route("/detect", methods=["POST", "OPTIONS"])
@cross_origin(origin="*", headers=["Content-Type", "Authorization", "X-Requested-With", "ngrok-skip-browser-warning", "X-User-Id"])
def detect_durians():
    if request.method == "OPTIONS":
        return '', 200
    try:
        # -- Image validation and temp save --
        if 'image' not in request.files:
            return jsonify({"success": False, "error": "No image provided", "message": "Please upload an image file"}), 400
        
        image_file = request.files['image']
        user_id = request.form.get('user_id') or request.headers.get('X-User-Id')
        save_to_history = request.form.get('save_to_history', 'true').lower() == 'true'
        
        if image_file.filename == '':
            return jsonify({"success": False, "error": "No file selected"}), 400
        
        allowed_extensions = {'jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp'}
        file_ext = image_file.filename.rsplit('.', 1)[1].lower() if '.' in image_file.filename else ''
        if file_ext not in allowed_extensions:
            return jsonify({"success": False, "error": "Invalid file type", "message": f"Allowed types: {', '.join(allowed_extensions)}"}), 400
        
        max_size = 10 * 1024 * 1024
        image_file.seek(0, 2)
        file_size = image_file.tell()
        image_file.seek(0)
        if file_size > max_size:
            return jsonify({"success": False, "error": "File too large", "message": f"Maximum file size is 10MB. Your file is {file_size/1024/1024:.1f}MB"}), 400
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_ext}') as tmp:
            image_file.save(tmp.name)
            temp_path = tmp.name
        
        print(f"🔍 Processing image: {image_file.filename} ({file_size/1024:.1f} KB)")
        
        # -- YOLO Detection --
        detector = get_yolo_detector()
        result = detector.predict(temp_path)
        
        # -- Durian Color --
        print("[DEBUG] Calling get_durian_color with:", temp_path)
        result["color"] = get_durian_color(temp_path)
        
        
        # -- Durian Size --
        result["size"] = get_durian_size(temp_path)
        
        # -- Cloudinary Save if needed --
        if result.get("success") and user_id and save_to_history:
            try:
                scan_id = str(uuid.uuid4())[:8]
                cloudinary_data = CloudinaryScan.upload_scan_image_sync(temp_path, user_id, scan_id)
                if cloudinary_data.get("success"):
                    scan_record = save_scan(
                        user_id=user_id,
                        image_url=cloudinary_data.get("image_url"),
                        thumbnail_url=cloudinary_data.get("thumbnail_url"),
                        cloudinary_public_id=cloudinary_data.get("public_id"),
                        detection_result=result.get("detection", {}),
                        analysis_result=result.get("analysis", {})
                    )
                    if scan_record:
                        result.update({
                            "scan_saved": True,
                            "scan_id": str(scan_record.get("_id")),
                            "cloudinary": {
                                "image_url": cloudinary_data.get("image_url"),
                                "thumbnail_url": cloudinary_data.get("thumbnail_url")
                            }
                        })
                else:
                    result.update({"scan_saved": False, "cloudinary_error": cloudinary_data.get("error")})
            except Exception as e:
                result.update({"scan_saved": False, "save_error": str(e)})
        
        os.unlink(temp_path)
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
        return jsonify({"success": False, "error": str(type(e).__name__), "message": str(e), "timestamp": datetime.utcnow().isoformat()}), 500

# ---------------------------
# Disease Routes
# ---------------------------

@scanner_bp.route("/classify/disease", methods=["POST", "OPTIONS"])
@cross_origin(origin="*", headers=["Content-Type", "Authorization", "X-Requested-With", "ngrok-skip-browser-warning", "X-User-Id"])
def classify_disease():
    if request.method == "OPTIONS":
        return '', 200

    try:
        if 'image' not in request.files:
            return jsonify({"success": False, "error": "No image provided"}), 400

        image_file = request.files['image']

        if image_file.filename == '':
            return jsonify({"success": False, "error": "No file selected"}), 400

        allowed_extensions = {'jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp'}
        file_ext = image_file.filename.rsplit('.', 1)[1].lower() if '.' in image_file.filename else ''

        if file_ext not in allowed_extensions:
            return jsonify({"success": False, "error": "Invalid file type"}), 400

        max_size = 10 * 1024 * 1024
        image_file.seek(0, 2)
        file_size = image_file.tell()
        image_file.seek(0)

        if file_size > max_size:
            return jsonify({"success": False, "error": "File too large"}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_ext}') as tmp:
            image_file.save(tmp.name)
            temp_path = tmp.name

        # Run your disease model
        result = get_durian_disease(temp_path)

        os.unlink(temp_path)

        if not result.get("success"):
            return jsonify(result), 500

        detections = result.get("detections", [])

        # ✅ If model detects nothing → assume healthy
        if len(detections) == 0:
            predicted_disease = "healthy"
            confidence = 0.0
        else:
            # ✅ Get highest confidence detection
            best_detection = max(detections, key=lambda x: x.get("confidence", 0))
            predicted_disease = best_detection.get("class_name", "unknown")
            confidence = best_detection.get("confidence", 0)

        return jsonify({
            "success": True,
            "disease": predicted_disease,
            "confidence": confidence,
            "detections": detections,
            "total_detections": len(detections),
            "request_info": {
                "filename": image_file.filename,
                "file_size": file_size,
                "file_type": file_ext,
                "timestamp": datetime.utcnow().isoformat()
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(type(e).__name__),
            "message": str(e)
        }), 500
# ---------------------------
# History / Scan / Analytics Routes
# ---------------------------

@scanner_bp.route("/history/<user_id>", methods=["GET"])
@cross_origin()
def get_scan_history(user_id):
    limit = int(request.args.get('limit', 50))
    skip = int(request.args.get('skip', 0))
    scans = get_user_scans(user_id, limit=limit, skip=skip)
    for scan in scans:
        scan["_id"] = str(scan.get("_id"))
        scan["user_id"] = str(scan.get("user_id"))
        if scan.get("created_at"):
            scan["created_at"] = scan["created_at"].isoformat()
    return jsonify({"success": True, "scans": scans, "count": len(scans), "limit": limit, "skip": skip})

@scanner_bp.route("/scan/<scan_id>", methods=["GET"])
@cross_origin()
def get_single_scan(scan_id):
    scan = get_scan_by_id(scan_id)
    if not scan:
        return jsonify({"success": False, "error": "Scan not found"}), 404
    scan["_id"] = str(scan.get("_id"))
    scan["user_id"] = str(scan.get("user_id"))
    if scan.get("created_at"):
        scan["created_at"] = scan["created_at"].isoformat()
    return jsonify({"success": True, "scan": scan})

@scanner_bp.route("/scan/<scan_id>", methods=["DELETE"])
@cross_origin(origin="*", headers=["X-User-Id"])
def delete_user_scan(scan_id):
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return jsonify({"success": False, "error": "User ID required"}), 400
    scan = get_scan_by_id(scan_id)
    if scan and scan.get("cloudinary_public_id"):
        CloudinaryScan.delete_scan_image(scan["cloudinary_public_id"])
    success = delete_scan(scan_id, user_id)
    return jsonify({"success": success, "message": "Scan deleted successfully" if success else "Could not delete scan"})

@scanner_bp.route("/analytics/<user_id>", methods=["GET"])
@cross_origin()
def get_analytics(user_id):
    time_range = request.args.get('time_range', 'month')
    stats = get_user_scan_stats(user_id, time_range)
    weekly_data = get_weekly_scan_data(user_id)
    quality_dist = get_quality_distribution(user_id, time_range)
    recent_scans = get_user_scans(user_id, limit=10)
    formatted_scans = []
    for scan in recent_scans:
        created_at = scan.get("created_at")
        if created_at:
            time_diff = datetime.utcnow() - created_at
            if time_diff.days > 0:
                time_ago = f"{time_diff.days} days ago"
            elif time_diff.seconds > 3600:
                time_ago = f"{time_diff.seconds // 3600} hrs ago"
            elif time_diff.seconds > 60:
                time_ago = f"{time_diff.seconds // 60} min ago"
            else:
                time_ago = "Just now"
        else:
            time_ago = "Unknown"
        formatted_scans.append({
            "id": str(scan.get("_id")),
            "variety": scan.get("variety", "Unknown"),
            "quality": scan.get("quality_score", 0),
            "status": scan.get("status", "Unknown"),
            "time": time_ago,
            "image_url": scan.get("image_url"),
            "thumbnail_url": scan.get("thumbnail_url"),
            "created_at": scan.get("created_at").isoformat() if scan.get("created_at") else None,
            "durian_count": scan.get("durian_count", 0),
            "confidence": scan.get("confidence", 0)
        })
    return jsonify({"success": True, "stats": stats, "weekly_data": weekly_data, "quality_distribution": quality_dist, "recent_scans": formatted_scans, "time_range": time_range})

@scanner_bp.route("/analytics/<user_id>/stats", methods=["GET"])
@cross_origin()
def get_stats_only(user_id):
    time_range = request.args.get('time_range', 'month')
    stats = get_user_scan_stats(user_id, time_range)
    return jsonify({"success": True, "stats": stats})