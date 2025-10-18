# app/utils/decorators.py (tạo file mới)
from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.nguoidung import NguoiDung, VaiTroNguoiDung

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required() # Đảm bảo người dùng đã đăng nhập
        def decorator(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = NguoiDung.query.get(current_user_id)
            
            # Kiểm tra xem người dùng có tồn tại và có phải là Quản trị viên không
            if not user or user.vai_tro != VaiTroNguoiDung.QUAN_TRI_VIEN:
                return jsonify(msg="Yêu cầu quyền Quản trị viên!"), 403 # Forbidden
            
            # Nếu đúng, thực thi hàm gốc
            return fn(*args, **kwargs)
        return decorator
    return wrapper