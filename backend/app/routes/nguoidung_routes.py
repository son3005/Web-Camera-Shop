# /backend/app/routes/nguoidung_routes.py

from flask import jsonify, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_openapi3 import APIBlueprint
from pydantic import BaseModel, ConfigDict, Field

from ..schemas.nguoidung.NguoiDung import (
    NguoiDungResponse,
    NguoiDungUpdate,
    NguoiDungUpdateMatKhau
)
from ..services.nguoidung_service import NguoiDungService
import traceback

# -------------------------------------------------------
# Tạo APIBlueprint
# -------------------------------------------------------
nguoidung_api = APIBlueprint("nguoi_dung", __name__, url_prefix="/api/nguoi-dung")

# -------------------------------------------------------
# Pydantic schemas (request & response)
# -------------------------------------------------------
class XacNhanMatKhauRequest(BaseModel):
    mat_khau_hien_tai: str = Field(..., description="Mật khẩu hiện tại")

    model_config = ConfigDict(from_attributes=True)


class ThongBaoResponse(BaseModel):
    message: str = Field(..., description="Thông báo kết quả")

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------
# 1) LẤY THÔNG TIN CÁ NHÂN
# -------------------------------------------------------
@nguoidung_api.get("/thong-tin-ca-nhan", responses={"200": NguoiDungResponse})
@jwt_required()
def lay_thong_tin_ca_nhan():
    """
    Lấy thông tin cá nhân của người dùng hiện tại
    """
    try:
        current_user_id = get_jwt_identity()
        
        # DEBUG: In ra user_id để kiểm tra
        current_app.logger.info(f"DEBUG: Current User ID from JWT: {current_user_id}")
        current_app.logger.info(f"DEBUG: Type of User ID: {type(current_user_id)}")
        
        current_user = NguoiDungService.lay_nguoi_dung_theo_id(current_user_id)
        
        # DEBUG: In ra thông tin user
        current_app.logger.info(f"DEBUG: Current User from DB: {current_user}")
        current_app.logger.info(f"DEBUG: User ID: {current_user.id}, Email: {current_user.email}")
        
        thong_tin_nguoi_dung = NguoiDungService.lay_thong_tin_ca_nhan(current_user)
        response = NguoiDungResponse.model_validate(thong_tin_nguoi_dung)
        return jsonify(response.model_dump()), 200
    except Exception as e:
        current_app.logger.error(f"[nguoidung.lay_thong_tin_ca_nhan] {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


# -------------------------------------------------------
# 2) CẬP NHẬT THÔNG TIN CÁ NHÂN
# -------------------------------------------------------
@nguoidung_api.put("/cap-nhat-thong-tin", responses={"200": NguoiDungResponse})
@jwt_required()
def cap_nhat_thong_tin(body: NguoiDungUpdate):
    """
    Cập nhật thông tin cá nhân
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = NguoiDungService.lay_nguoi_dung_theo_id(current_user_id)
        nguoi_dung_da_cap_nhat = NguoiDungService.cap_nhat_thong_tin(current_user, body)
        response = NguoiDungResponse.model_validate(nguoi_dung_da_cap_nhat)
        return jsonify(response.model_dump()), 200
    except Exception as e:
        current_app.logger.error(f"[nguoidung.cap_nhat_thong_tin] {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 400


# -------------------------------------------------------
# 3) ĐỔI MẬT KHẨU
# -------------------------------------------------------
@nguoidung_api.put("/doi-mat-khau", responses={"200": ThongBaoResponse})
@jwt_required()
def doi_mat_khau(body: NguoiDungUpdateMatKhau):
    """
    Đổi mật khẩu người dùng
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = NguoiDungService.lay_nguoi_dung_theo_id(current_user_id)
        NguoiDungService.doi_mat_khau(current_user, body)
        return jsonify({"message": "Đổi mật khẩu thành công"}), 200
    except Exception as e:
        current_app.logger.error(f"[nguoidung.doi_mat_khau] {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 400


# -------------------------------------------------------
# 4) XÁC NHẬN MẬT KHẨU HIỆN TẠI
# -------------------------------------------------------
@nguoidung_api.post("/xac-nhan-mat-khau-hien-tai", responses={"200": ThongBaoResponse})
@jwt_required()
def xac_nhan_mat_khau_hien_tai(body: XacNhanMatKhauRequest):
    """
    Xác nhận mật khẩu hiện tại
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = NguoiDungService.lay_nguoi_dung_theo_id(current_user_id)
        mat_khau_hop_le = NguoiDungService.kiem_tra_mat_khau(current_user, body.mat_khau_hien_tai)
        
        if mat_khau_hop_le:
            return jsonify({"message": "Mật khẩu chính xác"}), 200
        else:
            return jsonify({"error": "Mật khẩu hiện tại không chính xác"}), 400
            
    except Exception as e:
        current_app.logger.error(f"[nguoidung.xac_nhan_mat_khau_hien_tai] {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 400