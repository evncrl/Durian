import cloudinary
import cloudinary.uploader
import cloudinary.utils
from io import BytesIO
import os
from datetime import datetime
from typing import Dict, Optional, Any

class CloudinaryPFP:
    """Profile Picture handler for Cloudinary"""
    
    @staticmethod
    async def upload_profile_picture(
        image_data: bytes,
        user_id: str,
        username: str,
        email: str
    ) -> Dict[str, Any]:
        """
        Upload profile picture to Cloudinary
        
        Args:
            image_data: Image bytes
            user_id: MongoDB user ID
            username: User's name
            email: User's email
        
        Returns:
            Dict with upload results
        """
        try:
            # Clean username for URL safety
            safe_username = "".join(c for c in username if c.isalnum() or c in (' ', '.', '_')).rstrip()
            
            # Generate public ID
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            public_id = f"users/{user_id}/pfp_{safe_username}_{timestamp}"
            
            # Upload to Cloudinary with optimizations
            upload_result = cloudinary.uploader.upload(
                BytesIO(image_data),
                public_id=public_id,
                folder=f"users/{user_id}",
                overwrite=True,
                transformation=[
                    {"width": 400, "height": 400, "crop": "fill", "gravity": "face"},
                    {"quality": "auto:good"},
                    {"fetch_format": "auto"}
                ],
                # Generate additional sizes
                eager=[
                    {"width": 150, "height": 150, "crop": "fill", "gravity": "face"},
                    {"width": 80, "height": 80, "crop": "fill", "gravity": "face"}
                ]
            )
            
            # Get URLs
            secure_url = upload_result.get("secure_url")
            public_id = upload_result.get("public_id")
            
            # Get thumbnail URL (150x150)
            thumbnail_url = None
            eager_transformations = upload_result.get("eager", [])
            for transformation in eager_transformations:
                if transformation.get("width") == 150:
                    thumbnail_url = transformation.get("secure_url")
                    break
            
            if not thumbnail_url:
                # Generate thumbnail URL if not in eager
                thumbnail_url = cloudinary.utils.cloudinary_url(
                    public_id,
                    width=150,
                    height=150,
                    crop="fill",
                    gravity="face",
                    quality="auto:good"
                )[0]
            
            return {
                "success": True,
                "photoProfile": secure_url,
                "photoThumbnail": thumbnail_url,
                "photoPublicId": public_id,
                "format": upload_result.get("format"),
                "size": upload_result.get("bytes")
            }
            
        except Exception as e:
            # Return error but don't raise - let signup continue
            print(f"Cloudinary upload error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "photoProfile": f"https://ui-avatars.com/api/?name={username[:2]}&background=random&color=fff&size=400",
                "photoThumbnail": f"https://ui-avatars.com/api/?name={username[:2]}&background=random&color=fff&size=150"
            }
    
    @staticmethod
    def update_user_pfp_in_db(user_id: str, pfp_data: Dict):
        """
        Update user's profile picture in MongoDB
        This function should be imported from your db.py
        """
        from db import users_collection
        
        update_data = {
            "photoProfile": pfp_data.get("photoProfile"),
            "photoThumbnail": pfp_data.get("photoThumbnail"),
            "photoPublicId": pfp_data.get("photoPublicId"),
            "photoUpdatedAt": datetime.utcnow()
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        users_collection.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
    
    @staticmethod
    def get_default_pfp(username: str) -> Dict:
        """
        Generate default profile picture URLs
        """
        initials = username[:2].upper() if len(username) >= 2 else "U"
        return {
            "photoProfile": f"https://ui-avatars.com/api/?name={initials}&background=random&color=fff&size=400&bold=true",
            "photoThumbnail": f"https://ui-avatars.com/api/?name={initials}&background=random&color=fff&size=150&bold=true"
        }


class CloudinaryScan:
    """Scan image handler for Cloudinary"""
    
    @staticmethod
    async def upload_scan_image(
        image_data: bytes,
        user_id: str,
        scan_id: str
    ) -> Dict[str, Any]:
        """
        Upload durian scan image to Cloudinary
        
        Args:
            image_data: Image bytes
            user_id: MongoDB user ID
            scan_id: Unique scan identifier
        
        Returns:
            Dict with upload results
        """
        try:
            # Generate public ID for scan image
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            public_id = f"scans/{user_id}/{scan_id}_{timestamp}"
            
            # Upload to Cloudinary with optimizations
            upload_result = cloudinary.uploader.upload(
                BytesIO(image_data),
                public_id=public_id,
                folder=f"scans/{user_id}",
                overwrite=True,
                transformation=[
                    {"width": 800, "height": 800, "crop": "limit"},
                    {"quality": "auto:good"},
                    {"fetch_format": "auto"}
                ],
                # Generate thumbnail
                eager=[
                    {"width": 200, "height": 200, "crop": "fill", "gravity": "center"}
                ]
            )
            
            # Get URLs
            secure_url = upload_result.get("secure_url")
            public_id = upload_result.get("public_id")
            
            # Get thumbnail URL
            thumbnail_url = None
            eager_transformations = upload_result.get("eager", [])
            for transformation in eager_transformations:
                if transformation.get("width") == 200:
                    thumbnail_url = transformation.get("secure_url")
                    break
            
            if not thumbnail_url:
                thumbnail_url = cloudinary.utils.cloudinary_url(
                    public_id,
                    width=200,
                    height=200,
                    crop="fill",
                    gravity="center",
                    quality="auto:good"
                )[0]
            
            return {
                "success": True,
                "image_url": secure_url,
                "thumbnail_url": thumbnail_url,
                "public_id": public_id,
                "format": upload_result.get("format"),
                "size": upload_result.get("bytes")
            }
            
        except Exception as e:
            print(f"Cloudinary scan upload error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "image_url": None,
                "thumbnail_url": None
            }
    
    @staticmethod
    def upload_scan_image_sync(
        image_path: str,
        user_id: str,
        scan_id: str
    ) -> Dict[str, Any]:
        """
        Synchronous version for uploading scan image from file path
        """
        try:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            public_id = f"scans/{user_id}/{scan_id}_{timestamp}"
            
            upload_result = cloudinary.uploader.upload(
                image_path,
                public_id=public_id,
                folder=f"scans/{user_id}",
                overwrite=True,
                transformation=[
                    {"width": 800, "height": 800, "crop": "limit"},
                    {"quality": "auto:good"},
                    {"fetch_format": "auto"}
                ],
                eager=[
                    {"width": 200, "height": 200, "crop": "fill", "gravity": "center"}
                ]
            )
            
            secure_url = upload_result.get("secure_url")
            public_id = upload_result.get("public_id")
            
            thumbnail_url = None
            eager_transformations = upload_result.get("eager", [])
            for transformation in eager_transformations:
                if transformation.get("width") == 200:
                    thumbnail_url = transformation.get("secure_url")
                    break
            
            if not thumbnail_url:
                thumbnail_url = cloudinary.utils.cloudinary_url(
                    public_id,
                    width=200,
                    height=200,
                    crop="fill",
                    gravity="center",
                    quality="auto:good"
                )[0]
            
            return {
                "success": True,
                "image_url": secure_url,
                "thumbnail_url": thumbnail_url,
                "public_id": public_id,
                "format": upload_result.get("format"),
                "size": upload_result.get("bytes")
            }
            
        except Exception as e:
            print(f"Cloudinary scan upload error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "image_url": None,
                "thumbnail_url": None
            }
    
    @staticmethod
    def delete_scan_image(public_id: str) -> bool:
        """Delete a scan image from Cloudinary"""
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        except Exception as e:
            print(f"Error deleting scan image: {e}")
            return False
