"""
Durian Shape Classifier using EfficientNetB3
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional

import torch
import timm
import numpy as np
from torchvision import transforms
from PIL import Image

# 🔥 IMPORTANT:
# Must match training folder order (alphabetical order of folders inside train/)
# Example:
# ['elongated', 'oval', 'round']
SHAPE_CLASSES = ['Elongated', 'Irregular', 'Round']  

_shape_model = None

BASE_DIR = Path(__file__).parent.parent.parent
MODELS_DIR = BASE_DIR / "models"
DEFAULT_MODEL = MODELS_DIR / "durian_shape_best.pth"


def load_shape_model(model_path: Optional[str] = None):
    global _shape_model

    if _shape_model is not None:
        return _shape_model

    if model_path is None:
        model_path = DEFAULT_MODEL

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Shape model not found: {model_path}")

    # Must match training architecture (EfficientNet-B3)
    model = timm.create_model("efficientnet_b3", pretrained=False)
    model.classifier = torch.nn.Linear(
        model.classifier.in_features,
        len(SHAPE_CLASSES)
    )

    model.load_state_dict(
        torch.load(model_path, map_location=torch.device("cpu"))
    )

    model.eval()
    _shape_model = model
    return _shape_model


def preprocess_image(img_path: str, target_size=(300, 300)):
    img = Image.open(img_path).convert("RGB")

    transform = transforms.Compose([
        transforms.Resize(target_size),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])

    x = transform(img).unsqueeze(0)
    return x


def get_durian_shape(
    image_path: str,
    model_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Predict durian shape class from image using EfficientNetB3 (PyTorch)

    Args:
        image_path: Path to image file
        model_path: Optional path to .pth model

    Returns:
        Dict with prediction result
    """
    try:
        model = load_shape_model(model_path)
        img = preprocess_image(image_path)

        with torch.no_grad():
            outputs = model(img)
            probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]

        class_idx = int(np.argmax(probs))
        confidence = float(np.max(probs))

        shape_class = (
            SHAPE_CLASSES[class_idx]
            if class_idx < len(SHAPE_CLASSES)
            else str(class_idx)
        )

        return {
            "success": True,
            "shape_class": shape_class,
            "confidence": round(confidence, 4),
            "class_index": class_idx,
            "raw": [float(x) for x in probs.tolist()]
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(type(e).__name__),
            "message": str(e)
        }