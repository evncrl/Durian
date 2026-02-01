# backend/roboflow_detector.py

import os

import requests

import base64

import json

from typing import Dict, Any, List, Optional

from datetime import datetime

from dotenv import load_dotenv



load_dotenv()



class RoboflowDetector:

    def __init__(self, model_type: str = "detection"):

        """

        Initialize Roboflow detector

        

        Args:

            model_type: "detection", "disease", "ripeness", or "export"

        """

        self.api_key = os.getenv("ROBOFLOW_API_KEY")

        

        # Model mapping

        self.models = {

            "detection": "durian-detection/6"

           #"disease": "durian-disease-classification/1",

           #"ripeness": "durian-ripeness/1",

            #"export": "durian-exportability/1"

        }

        

        self.model_id = self.models.get(model_type, "durian-detection/1")

        self.base_url = "https://detect.roboflow.com"

        

        # Check API key

        if not self.api_key:

            print(f"⚠️ Warning: ROBOFLOW_API_KEY not found in .env")

            print("   Get it from: https://app.roboflow.com/account/api")

            self.available = False

        else:

            self.available = True

            print(f"✅ Roboflow Detector initialized for: {model_type}")

            print(f"   Model ID: {self.model_id}")

    

    def predict(self, image_path: str) -> Dict[str, Any]:

        """

        Make prediction on local image file

        

        Args:

            image_path: Path to image file

        

        Returns:

            Dictionary with prediction results

        """

        if not self.available:

            return {

                "success": False,

                "error": "Detector not available",

                "message": "Check ROBOFLOW_API_KEY configuration"

            }

        

        try:

            # Read and encode image

            with open(image_path, "rb") as image_file:

                image_bytes = image_file.read()

                image_b64 = base64.b64encode(image_bytes).decode('utf-8')

            

            # Prepare API request

            url = f"{self.base_url}/{self.model_id}"

            

            # For image classification/detection

            params = {

                "api_key": self.api_key

            }

            

            # Use appropriate content type

            headers = {

                "Content-Type": "application/x-www-form-urlencoded"

            }

            

            # Make request

            response = requests.post(

                url,

                params=params,

                data=image_b64,

                headers=headers,

                timeout=30  # 30 second timeout

            )

            

            # Check response

            if response.status_code == 200:

                result = response.json()

                return self._format_result(result, image_path)

            else:

                return {

                    "success": False,

                    "error": f"API Error: {response.status_code}",

                    "message": response.text[:200] if response.text else "No response text"

                }

                

        except FileNotFoundError:

            return {

                "success": False,

                "error": "File not found",

                "message": f"Image file does not exist: {image_path}"

            }

        except requests.exceptions.Timeout:

            return {

                "success": False,

                "error": "Request timeout",

                "message": "Service is taking too long to respond"

            }

        except requests.exceptions.ConnectionError:

            return {

                "success": False,

                "error": "Connection error",

                "message": "Cannot connect to Roboflow API"

            }

        except Exception as e:

            return {

                "success": False,

                "error": str(type(e).__name__),

                "message": str(e)

            }

    

    def predict_from_bytes(self, image_bytes: bytes) -> Dict[str, Any]:

        """

        Make prediction from image bytes

        

        Args:

            image_bytes: Image data as bytes

        

        Returns:

            Dictionary with prediction results

        """

        if not self.available:

            return {"success": False, "error": "Detector not available"}

        

        try:

            # Encode image

            image_b64 = base64.b64encode(image_bytes).decode('utf-8')

            

            # Prepare API request

            url = f"{self.base_url}/{self.model_id}"

            params = {"api_key": self.api_key}

            

            headers = {

                "Content-Type": "application/x-www-form-urlencoded"

            }

            

            # Make request

            response = requests.post(

                url,

                params=params,

                data=image_b64,

                headers=headers,

                timeout=30

            )

            

            if response.status_code == 200:

                result = response.json()

                return self._format_result(result, "uploaded_image")

            else:

                return {

                    "success": False,

                    "error": f"API Error: {response.status_code}",

                    "message": response.text[:200] if response.text else "No response text"

                }

                

        except Exception as e:

            return {

                "success": False,

                "error": str(type(e).__name__),

                "message": str(e)

            }

    

    def _format_result(self, roboflow_result: Dict, image_source: str) -> Dict[str, Any]:

        """

        Format Roboflow API response

        

        Args:

            roboflow_result: Raw response from Roboflow API

            image_source: Source of the image

        

        Returns:

            Formatted result dictionary

        """

        # Check if it's classification or detection

        predictions = roboflow_result.get("predictions", [])

        

        # Determine result type based on model

        model_type = self._get_model_type()

        

        if model_type == "classification":

            return self._format_classification_result(predictions, image_source)

        else:  # detection

            return self._format_detection_result(predictions, image_source)

    

    def _get_model_type(self) -> str:

        """Determine if model is classification or detection"""

        model_id = self.model_id.lower()

        if any(word in model_id for word in ["classification", "disease", "ripeness", "export"]):

            return "classification"

        return "detection"

    

    def _format_classification_result(self, predictions: List[Dict], image_source: str) -> Dict[str, Any]:

        """Format classification results"""

        if not predictions:

            return {

                "success": False,

                "error": "No predictions",

                "message": "Model could not classify the image"

            }

        

        # Get top prediction (single label)

        predictions_sorted = sorted(

            predictions, 

            key=lambda x: x.get("confidence", 0), 

            reverse=True

        )

        

        top_prediction = predictions_sorted[0]

        

        return {

            "success": True,

            "type": "classification",

            "prediction": {

                "class": top_prediction.get("class", "unknown"),

                "confidence": round(top_prediction.get("confidence", 0) * 100, 2),

                "top_n": [

                    {

                        "class": p.get("class", "unknown"),

                        "confidence": round(p.get("confidence", 0) * 100, 2)

                    }

                    for p in predictions_sorted[:3]  # Top 3 predictions

                ]

            },

            "metadata": {

                "image_source": image_source,

                "model_id": self.model_id,

                "timestamp": datetime.utcnow().isoformat(),

                "total_predictions": len(predictions)

            }

        }

    

    def _format_detection_result(self, predictions: List[Dict], image_source: str) -> Dict[str, Any]:

        """Format object detection results"""

        boxes = []

        total_confidence = 0

        

        for pred in predictions:

            box = {

                "class": pred.get("class", "object"),

                "confidence": round(pred.get("confidence", 0) * 100, 2),

                "bounding_box": {

                    "x": pred.get("x", 0),

                    "y": pred.get("y", 0),

                    "width": pred.get("width", 0),

                    "height": pred.get("height", 0)

                },

                "area": pred.get("width", 0) * pred.get("height", 0)

            }

            boxes.append(box)

            total_confidence += pred.get("confidence", 0)

        

        # Calculate statistics

        avg_confidence = round((total_confidence / len(predictions) * 100), 2) if predictions else 0

        

        # Group by class

        class_counts = {}

        for box in boxes:

            class_name = box["class"]

            class_counts[class_name] = class_counts.get(class_name, 0) + 1

        

        return {

            "success": True,

            "type": "detection",

            "detection": {

                "count": len(predictions),

                "average_confidence": avg_confidence,

                "boxes": boxes,

                "class_distribution": class_counts

            },

            "analysis": {

                "density": len(predictions),

                "dominant_class": max(class_counts, key=class_counts.get) if class_counts else "none"

            },

            "metadata": {

                "image_source": image_source,

                "model_id": self.model_id,

                "timestamp": datetime.utcnow().isoformat()

            }

        }

    

    def test_connection(self) -> Dict[str, Any]:

        """Test connection to Roboflow API"""

        if not self.available:

            return {

                "success": False,

                "error": "API key not configured"

            }

        

        try:

            # Simple test request

            test_url = f"{self.base_url}/{self.model_id}"

            params = {"api_key": self.api_key}

            

            response = requests.get(test_url, params=params, timeout=10)

            

            if response.status_code == 200:

                return {

                    "success": True,

                    "status": "connected",

                    "model": self.model_id,

                    "message": "Successfully connected to Roboflow API"

                }

            else:

                return {

                    "success": False,

                    "error": f"HTTP {response.status_code}",

                    "message": response.text[:200] if response.text else "No response"

                }

                

        except Exception as e:

            return {

                "success": False,

                "error": str(type(e).__name__),

                "message": str(e)

            }



# Factory function to create detectors

def create_detector(model_type: str = "detection") -> RoboflowDetector:

    """Create detector for specific model type"""

    return RoboflowDetector(model_type)



# Create global instances for common use cases

durian_detector = create_detector("detection")

disease_classifier = create_detector("disease")



# Test function

def test_all_models():

    """Test all available models"""

    print("🧪 Testing Roboflow API connection...")

    

    # Test detection model

    print("\n1. Testing Durian Detection Model:")

    detector = create_detector("detection")

    test_result = detector.test_connection()

    print(f"   Status: {'✅' if test_result['success'] else '❌'} {test_result.get('message', '')}")

    

    # Test disease model

    print("\n2. Testing Disease Classification Model:")

    classifier = create_detector("disease")

    test_result = classifier.test_connection()

    print(f"   Status: {'✅' if test_result['success'] else '❌'} {test_result.get('message', '')}")

    

    # Test with sample image if available

    test_image = "test_durian.jpg"

    if os.path.exists(test_image):

        print(f"\n3. Testing prediction on: {test_image}")

        result = detector.predict(test_image)

        if result["success"]:

            print(f"   ✅ Success! Detected {result.get('detection', {}).get('count', 0)} objects")

        else:

            print(f"   ❌ Failed: {result.get('error', 'Unknown error')}")

    else:

        print(f"\n3. ⚠️ Test image not found: {test_image}")



if __name__ == "__main__":

    test_all_models()