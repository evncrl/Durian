# backend/authapi/routes/scanner_routes.py
from flask import Blueprint, request, jsonify
import tempfile
import os
from datetime import datetime
import uuid

# Use local YOLO model (your trained model)
from ai.yolo_detector import get_yolo_detector
from handlers.cloudinary_handler import CloudinaryScan
from db import (
    save_scan, get_user_scans, get_scan_by_id, delete_scan,
    get_user_scan_stats, get_weekly_scan_data, get_quality_distribution
)

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
        
        # Get optional user_id for saving scan
        user_id = request.form.get('user_id') or request.headers.get('X-User-Id')
        save_to_history = request.form.get('save_to_history', 'true').lower() == 'true'
        
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
        
        # If detection successful and user wants to save, upload to Cloudinary
        cloudinary_data = None
        scan_record = None
        
        if result.get("success") and user_id and save_to_history:
            try:
                # Generate unique scan ID
                scan_id = str(uuid.uuid4())[:8]
                
                # Upload to Cloudinary
                cloudinary_data = CloudinaryScan.upload_scan_image_sync(
                    image_path=temp_path,
                    user_id=user_id,
                    scan_id=scan_id
                )
                
                if cloudinary_data.get("success"):
                    # Save scan to database
                    scan_record = save_scan(
                        user_id=user_id,
                        image_url=cloudinary_data.get("image_url"),
                        thumbnail_url=cloudinary_data.get("thumbnail_url"),
                        cloudinary_public_id=cloudinary_data.get("public_id"),
                        detection_result=result.get("detection", {}),
                        analysis_result=result.get("analysis", {})
                    )
                    
                    if scan_record:
                        result["scan_saved"] = True
                        result["scan_id"] = str(scan_record.get("_id"))
                        result["cloudinary"] = {
                            "image_url": cloudinary_data.get("image_url"),
                            "thumbnail_url": cloudinary_data.get("thumbnail_url")
                        }
                        print(f"✅ Scan saved to history: {scan_record.get('_id')}")
                else:
                    print(f"⚠️ Cloudinary upload failed: {cloudinary_data.get('error')}")
                    result["scan_saved"] = False
                    result["cloudinary_error"] = cloudinary_data.get("error")
                    
            except Exception as e:
                print(f"⚠️ Error saving scan: {e}")
                result["scan_saved"] = False
                result["save_error"] = str(e)
        
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


# ===========================
# Scan History Routes
# ===========================

@scanner_bp.route("/history/<user_id>", methods=["GET"])
def get_scan_history(user_id):
    """Get user's scan history"""
    try:
        limit = int(request.args.get('limit', 50))
        skip = int(request.args.get('skip', 0))
        
        scans = get_user_scans(user_id, limit=limit, skip=skip)
        
        # Convert ObjectIds to strings for JSON
        for scan in scans:
            scan["_id"] = str(scan.get("_id"))
            scan["user_id"] = str(scan.get("user_id"))
            if scan.get("created_at"):
                scan["created_at"] = scan["created_at"].isoformat()
        
        return jsonify({
            "success": True,
            "scans": scans,
            "count": len(scans),
            "limit": limit,
            "skip": skip
        })
        
    except Exception as e:
        print(f"❌ Error getting scan history: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@scanner_bp.route("/scan/<scan_id>", methods=["GET"])
def get_single_scan(scan_id):
    """Get a single scan by ID"""
    try:
        scan = get_scan_by_id(scan_id)
        
        if not scan:
            return jsonify({
                "success": False,
                "error": "Scan not found"
            }), 404
        
        # Convert ObjectIds
        scan["_id"] = str(scan.get("_id"))
        scan["user_id"] = str(scan.get("user_id"))
        if scan.get("created_at"):
            scan["created_at"] = scan["created_at"].isoformat()
        
        return jsonify({
            "success": True,
            "scan": scan
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@scanner_bp.route("/scan/<scan_id>", methods=["DELETE"])
def delete_user_scan(scan_id):
    """Delete a scan"""
    try:
        user_id = request.headers.get('X-User-Id')
        
        if not user_id:
            return jsonify({
                "success": False,
                "error": "User ID required"
            }), 400
        
        # Get scan first to delete from Cloudinary
        scan = get_scan_by_id(scan_id)
        if scan and scan.get("cloudinary_public_id"):
            CloudinaryScan.delete_scan_image(scan["cloudinary_public_id"])
        
        success = delete_scan(scan_id, user_id)
        
        if success:
            return jsonify({
                "success": True,
                "message": "Scan deleted successfully"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Could not delete scan"
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ===========================
# Analytics Routes
# ===========================

@scanner_bp.route("/analytics/<user_id>", methods=["GET"])
def get_analytics(user_id):
    """Get comprehensive scan analytics for a user"""
    try:
        time_range = request.args.get('time_range', 'month')
        
        # Get all analytics data
        stats = get_user_scan_stats(user_id, time_range)
        weekly_data = get_weekly_scan_data(user_id)
        quality_dist = get_quality_distribution(user_id, time_range)
        
        # Get recent scans for the list
        recent_scans = get_user_scans(user_id, limit=10)
        
        # Format recent scans for frontend
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
        
        return jsonify({
            "success": True,
            "stats": stats,
            "weekly_data": weekly_data,
            "quality_distribution": quality_dist,
            "recent_scans": formatted_scans,
            "time_range": time_range
        })
        
    except Exception as e:
        print(f"❌ Error getting analytics: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@scanner_bp.route("/analytics/<user_id>/stats", methods=["GET"])
def get_stats_only(user_id):
    """Get just the stats summary"""
    try:
        time_range = request.args.get('time_range', 'month')
        stats = get_user_scan_stats(user_id, time_range)
        
        return jsonify({
            "success": True,
            "stats": stats
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500