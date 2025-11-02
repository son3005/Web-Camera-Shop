# app/decorators.py
from functools import wraps
from flask import jsonify
# Thay đổi import: thêm get_jwt
from flask_jwt_extended import jwt_required, get_jwt
from ..models.enums import VaiTroNguoiDungEnum 

def admin_required(fn):
    """Decorator yêu cầu người dùng là Quản trị viên (Đã tối ưu)"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        # Lấy toàn bộ claims từ token đã giải mã
        claims = get_jwt()
        
        user_role = claims.get("vai_tro")

        # Kiểm tra vai trò từ claims
        if user_role != VaiTroNguoiDungEnum.QUAN_TRI_VIEN.value:
            return jsonify(msg="Yêu cầu quyền Quản trị viên!"), 403

        return fn(*args, **kwargs)
    return wrapper