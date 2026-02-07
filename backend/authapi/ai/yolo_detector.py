# backend/authapi/ai/yolo_detector.py
"""
Local YOLO Detector using trained model
Uses the custom-trained YOLOv8 model for durian detection
"""

import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

# Get the base directory
BASE_DIR = Path(__file__).parent.parent.parent
MODELS_DIR = BASE_DIR / "models"

# Default model path - update this if you train a new model
DEFAULT_MODEL = "durian_detector_durian_detection_20260206_201634.pt"


class YOLODetector:
    """Local YOLO-based durian detector using trained model"""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize YOLO detector with local model
        
        Args:
            model_path: Path to .pt model file. If None, uses default model.
        """
        self.model = None
        self.available = False
        self.model_path = None
        
        # Determine model path
        if model_path:
            self.model_path = Path(model_path)
        else:
            self.model_path = MODELS_DIR / DEFAULT_MODEL
        
        # Check if model exists
        if not self.model_path.exists():
            print(f"❌ Model not found: {self.model_path}")
            print(f"   Available models in {MODELS_DIR}:")
            if MODELS_DIR.exists():
                for f in MODELS_DIR.glob("*.pt"):
                    print(f"   - {f.name}")
            return
        
        # Load the model
        try:
            from ultralytics import YOLO
            self.model = YOLO(str(self.model_path))
            self.available = True
            print(f"✅ YOLO Detector initialized")
            print(f"   Model: {self.model_path.name}")
        except ImportError:
            print("❌ ultralytics not installed. Run: pip install ultralytics")
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
    
    def predict(self, image_path: str, confidence: float = 0.25) -> Dict[str, Any]:
        """
        Run detection on an image
        
        Args:
            image_path: Path to image file
            confidence: Minimum confidence threshold (0-1)
        
        Returns:
            Dictionary with detection results
        """
        if not self.available:
            return {
                "success": False,
                "error": "Model not available",
                "message": "YOLO model is not loaded"
            }
        
        if not os.path.exists(image_path):
            return {
                "success": False,
                "error": "File not found",
                "message": f"Image not found: {image_path}"
            }
        
        try:
            # Run inference
            results = self.model.predict(
                source=image_path,
                conf=confidence,
                save=False,
                verbose=False
            )
            
            # Process results
            detections = []
            result = results[0]  # Get first result
            
            for box in result.boxes:
                detection = {
                    "class_id": int(box.cls[0]),
                    "class_name": result.names[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "bbox": {
                        "x1": float(box.xyxy[0][0]),
                        "y1": float(box.xyxy[0][1]),
                        "x2": float(box.xyxy[0][2]),
                        "y2": float(box.xyxy[0][3]),
                    },
                    "bbox_normalized": {
                        "x": float(box.xywhn[0][0]),
                        "y": float(box.xywhn[0][1]),
                        "width": float(box.xywhn[0][2]),
                        "height": float(box.xywhn[0][3]),
                    }
                }
                detections.append(detection)
            
            # Sort by confidence
            detections.sort(key=lambda x: x["confidence"], reverse=True)
            
            # Determine primary detection
            primary = None
            if detections:
                primary = detections[0]
            
            return {
                "success": True,
                "model": self.model_path.name,
                "image_path": image_path,
                "timestamp": datetime.utcnow().isoformat(),
                "detection": {
                    "count": len(detections),
                    "objects": detections,
                    "primary": primary
                },
                "analysis": self._analyze_detections(detections)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(type(e).__name__),
                "message": str(e)
            }
    
    def predict_from_bytes(self, image_bytes: bytes, confidence: float = 0.25) -> Dict[str, Any]:
        """
        Run detection on image bytes
        
        Args:
            image_bytes: Image data as bytes
            confidence: Minimum confidence threshold
        
        Returns:
            Dictionary with detection results
        """
        import tempfile
        
        # Save to temp file and process
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name
        
        try:
            result = self.predict(tmp_path, confidence)
        finally:
            os.unlink(tmp_path)
        
        return result
    
    def _analyze_detections(self, detections: List[Dict]) -> Dict[str, Any]:
        """
        Analyze detections and provide insights
        """
        if not detections:
            return {
                "found": False,
                "message": "No durians detected in image",
                "recommendation": "Try taking a clearer photo with better lighting"
            }
        
        # Count by class
        class_counts = {}
        for det in detections:
            cls = det["class_name"]
            class_counts[cls] = class_counts.get(cls, 0) + 1
        
        # Average confidence
        avg_confidence = sum(d["confidence"] for d in detections) / len(detections)
        
        # Primary detection info
        primary = detections[0]
        
        return {
            "found": True,
            "total_count": len(detections),
            "class_breakdown": class_counts,
            "average_confidence": round(avg_confidence, 3),
            "primary_class": primary["class_name"],
            "primary_confidence": round(primary["confidence"], 3),
            "quality_score": self._calculate_quality_score(primary),
            "recommendation": self._get_recommendation(primary)
        }
    
    def _calculate_quality_score(self, detection: Dict) -> float:
        """Calculate a quality score based on detection"""
        # Base score from confidence
        score = detection["confidence"] * 100
        
        # Adjust based on bbox size (larger = better scan)
        bbox = detection["bbox_normalized"]
        size_factor = (bbox["width"] * bbox["height"]) * 0.5
        score += size_factor * 20
        
        return min(round(score, 1), 100)
    
    def _get_recommendation(self, detection: Dict) -> str:
        """Get recommendation based on detection"""
        conf = detection["confidence"]
        class_name = detection["class_name"].lower()
        
        if conf > 0.8:
            return f"High confidence detection of {class_name}. Ready for analysis."
        elif conf > 0.5:
            return f"Detected {class_name}. Consider retaking for better accuracy."
        else:
            return "Low confidence. Try better lighting or closer shot."
    
    def test_connection(self) -> Dict[str, Any]:
        """Test if the model is loaded and ready"""
        return {
            "success": self.available,
            "model": str(self.model_path.name) if self.model_path else None,
            "message": "Model loaded and ready" if self.available else "Model not available"
        }


# Factory function
def create_yolo_detector(model_path: Optional[str] = None) -> YOLODetector:
    """Create a YOLO detector instance"""
    return YOLODetector(model_path)


# Global instance for common use
yolo_detector = None


def get_yolo_detector() -> YOLODetector:
    """Get or create the global YOLO detector instance"""
    global yolo_detector
    if yolo_detector is None:
        yolo_detector = create_yolo_detector()
    return yolo_detector


# Test function
if __name__ == "__main__":
    print("🧪 Testing YOLO Detector...")
    
    detector = create_yolo_detector()
    
    if detector.available:
        print(f"✅ Model loaded: {detector.model_path.name}")
        
        # Test on sample image if available
        test_images = ["test_durian.jpg", "sample.jpg", "durian.jpg"]
        for img in test_images:
            if os.path.exists(img):
                print(f"\n📷 Testing on: {img}")
                result = detector.predict(img)
                if result["success"]:
                    print(f"   ✅ Detected {result['detection']['count']} objects")
                    for obj in result['detection']['objects']:
                        print(f"      - {obj['class_name']}: {obj['confidence']:.2%}")
                else:
                    print(f"   ❌ Error: {result.get('error')}")
                break
        else:
            print("\n⚠️ No test image found. Place a test image in the current directory.")
    else:
        print("❌ Model not available")
