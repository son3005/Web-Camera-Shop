# /backend/app/services/redis_session_service.py
import json
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from decimal import Decimal

from ..extensions import redis

class RedisSessionService:
    @staticmethod
    def _serialize(data: Dict[str, Any]) -> str:
        """Chuyển đổi dữ liệu thành JSON string, xử lý Decimal"""
        def default_serializer(obj):
            if isinstance(obj, Decimal):
                return str(obj)
            elif isinstance(obj, datetime):
                return obj.isoformat()
            return obj
        
        return json.dumps(data, default=default_serializer)

    @staticmethod
    def _deserialize(data: str) -> Dict[str, Any]:
        """Chuyển đổi JSON string thành dict"""
        return json.loads(data) if data else {}

    @classmethod
    def create_cart_session(cls, user_id: Optional[int] = None, items: list = None) -> str:
        """Tạo session giỏ hàng"""
        session_id = f"user_{user_id}" if user_id else f"guest_{uuid.uuid4().hex}"
        key = f"cart_session:{session_id}"
        
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "items": items or [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        redis.setex(key, timedelta(hours=24), cls._serialize(session_data))
        return session_id

    @classmethod
    def create_checkout_session(cls, cart_session_id: str, checkout_data: Dict[str, Any]) -> str:
        """Tạo session checkout từ cart session"""
        checkout_id = f"checkout_{uuid.uuid4().hex}"
        key = f"checkout_session:{checkout_id}"
        
        session_data = {
            "checkout_id": checkout_id,
            "cart_session_id": cart_session_id,
            **checkout_data,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(minutes=45)).isoformat()
        }
        
        redis.setex(key, timedelta(minutes=45), cls._serialize(session_data))
        return checkout_id

    @classmethod
    def get_session(cls, session_type: str, session_id: str) -> Optional[Dict[str, Any]]:
        """Lấy session data"""
        key = f"{session_type}_session:{session_id}"
        data = redis.get(key)
        return cls._deserialize(data) if data else None

    @classmethod
    def update_session(cls, session_type: str, session_id: str, updates: Dict[str, Any]):
        """Cập nhật session data"""
        key = f"{session_type}_session:{session_id}"
        current_data = cls.get_session(session_type, session_id)
        
        if current_data:
            current_data.update(updates)
            current_data["updated_at"] = datetime.utcnow().isoformat()
            
            # Cập nhật TTL
            ttl = timedelta(hours=24) if session_type == "cart" else timedelta(minutes=45)
            redis.setex(key, ttl, cls._serialize(current_data))

    @classmethod
    def delete_session(cls, session_type: str, session_id: str):
        """Xóa session"""
        key = f"{session_type}_session:{session_id}"
        redis.delete(key)