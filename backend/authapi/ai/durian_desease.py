"""
Durian Disease Detector (YOLOv8)
Classes: mold, rot
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional

from ultralytics import YOLO

_disease_model = None

BASE_DIR = Path(__file__).parent.parent.parent
MODELS_DIR = BASE_DIR / "models"
DEFAULT_MODEL = MODELS_DIR / "durian_disease_v8_best.pt"


def load_disease_model(model_path: Optional[str] = None):
    global _disease_model

    if _disease_model is not None:
        return _disease_model

    if model_path is None:
        model_path = DEFAULT_MODEL

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Disease model not found: {model_path}")

    model = YOLO(str(model_path))
    _disease_model = model
    return _disease_model


def get_durian_disease(image_path: str, model_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Detect durian diseases using YOLOv8

    Classes:
        0 = mold
        1 = rot
        2 = healthy
    """

    try:
        model = load_disease_model(model_path)
        results = model(image_path, verbose=False)

        detections = []
        best_detection = None  # highest confidence detection

        for r in results:
            boxes = r.boxes
            names = r.names

            if boxes is None:
                continue

            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                bbox = box.xyxy[0].tolist()

                class_name = names[class_id]

                detection_data = {
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": round(confidence, 4),
                    "bbox": [float(x) for x in bbox]
                }

                detections.append(detection_data)

                # Track highest confidence detection
                if best_detection is None or confidence > best_detection["confidence"]:
                    best_detection = {
                        "class_name": class_name,
                        "confidence": confidence
                    }

        # Decide final disease label
        if best_detection:
            final_disease = best_detection["class_name"]
            final_confidence = round(best_detection["confidence"], 4)
        else:
            final_disease = "healthy"
            final_confidence = 0.0

        return {
            "success": True,
            "disease": final_disease,  # IMPORTANT for frontend
            "confidence": final_confidence,
            "total_detections": len(detections),
            "detections": detections
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(type(e).__name__),
            "message": str(e)
        }