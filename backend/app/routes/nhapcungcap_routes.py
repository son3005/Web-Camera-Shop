# /backend/app/routes/nhacungcap_routes.py
import traceback
import json
from flask import jsonify, current_app, request
from pydantic import BaseModel, Field
from flask_openapi3 import APIBlueprint
from werkzeug.exceptions import BadRequest, NotFound
from ..extensions import db
from ..services.nhacungcap_service import NhaCungCapService
from ..schemas.phieunhap import (
    NhaCungCapCreate, NhaCungCapUpdate, NhaCungCapResponse,
    ListNhaCungCapResponse, NhaCungCapDelete,NhaCungCapPath
)
from ..models.enums import TrangThaiNhaCungCapEnum
from ..models.phieunhap import NhaCungCap
from ..utils.decorators import admin_required
 
# ==============================================================
# Khởi tạo APIBlueprint
# ==============================================================
supplier_api = APIBlueprint('supplier_api', __name__, url_prefix='/api/nha-cung-cap')

# ==============================================================
# 1️ LẤY DANH SÁCH NHÀ CUNG CẤP
# ==============================================================
@supplier_api.get('', responses={"200": ListNhaCungCapResponse})
def get_all_nha_cung_cap():
    """Lấy danh sách nhà cung cấp với bộ lọc nâng cao"""
    try:
        # Lấy các tham số từ query string
        ten_nha_cung_cap = request.args.get('ten_nha_cung_cap', None, type=str)
        so_dien_thoai = request.args.get('so_dien_thoai', None, type=str)
        email = request.args.get('email', None, type=str)
        ma_nha_cung_cap = request.args.get('ma_nha_cung_cap', None, type=str)
        nguoi_dai_dien = request.args.get('nguoi_dai_dien', None, type=str)
        trang_thai = request.args.get('trang_thai', None, type=lambda x: x.lower() == 'true' if x else None)
        skip = request.args.get('skip', 0, type=int)
        limit = request.args.get('limit', 100, type=int)
        
        current_app.logger.info(f"Lấy danh sách nhà cung cấp với bộ lọc: ten={ten_nha_cung_cap}, sdt={so_dien_thoai}, email={email}")

        result = NhaCungCapService.lay_danh_sach_nha_cung_cap(
            ten_nha_cung_cap=ten_nha_cung_cap,
            so_dien_thoai=so_dien_thoai,
            email=email,
            ma_nha_cung_cap=ma_nha_cung_cap,
            nguoi_dai_dien=nguoi_dai_dien,
            trang_thai=trang_thai,
            skip=skip,
            limit=limit
        )
        return jsonify(result.model_dump()), 200
    except Exception:
        current_app.logger.error(f"Lỗi lấy danh sách nhà cung cấp: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi lấy danh sách nhà cung cấp."}), 500

# ==============================================================
# 2️ LẤY CHI TIẾT NHÀ CUNG CẤP
# ==============================================================
@supplier_api.get(
    '/<int:nha_cung_cap_id>',
    responses={"200": NhaCungCapResponse}
)
def get_nha_cung_cap(path: NhaCungCapPath):
    """
    Lấy thông tin chi tiết nhà cung cấp theo ID
    """
    try:
        current_app.logger.info(f"Lấy thông tin nhà cung cấp ID: {path.nha_cung_cap_id}")
        
        nha_cung_cap = NhaCungCapService.lay_nha_cung_cap_theo_id(path.nha_cung_cap_id)
        if not nha_cung_cap:
            return jsonify({"error": "Nhà cung cấp không tồn tại"}), 404
            
        response = NhaCungCapResponse.model_validate(nha_cung_cap)
        return jsonify(response.model_dump()), 200
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"Lỗi lấy nhà cung cấp {path.nha_cung_cap_id}: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi lấy nhà cung cấp."}), 500

# ==============================================================
# 3 TẠO NHÀ CUNG CẤP MỚI - ADMIN
# ==============================================================
@supplier_api.post('/', responses={"201": NhaCungCapResponse})
@admin_required
def create_nha_cung_cap():
    """
    Tạo mới nhà cung cấp
    """
    try:
        current_app.logger.info("Bắt đầu tạo nhà cung cấp mới")
        
        # Lấy dữ liệu từ request body
        data = request.get_json()
        if not data:
            return jsonify({"error": "Thiếu dữ liệu"}), 400
        
        # Validate dữ liệu cơ bản
        if not data.get('ten_nha_cung_cap'):
            return jsonify({"error": "Tên nhà cung cấp là bắt buộc"}), 400
        
        # Tạo mã tự động
        ma = NhaCungCapService.tao_ma_nha_cung_cap()
        data['ma_nha_cung_cap'] = ma
        
        # Chuyển đổi dữ liệu sang schema
        body = NhaCungCapCreate(**data)
        
        # Gọi service tạo nhà cung cấp
        new_nha_cung_cap = NhaCungCapService.tao_nha_cung_cap(body)
        db.session.commit()
        
        current_app.logger.info(f"Tạo nhà cung cấp thành công: {new_nha_cung_cap.ten_nha_cung_cap}")
        
        response = NhaCungCapResponse.model_validate(new_nha_cung_cap)
        return jsonify(response.model_dump()), 201
        
    except BadRequest as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi BadRequest: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi tạo nhà cung cấp: {traceback.format_exc()}")
        return jsonify({"error": f"Không thể tạo nhà cung cấp: {str(e)}"}), 500

# ==============================================================
# 4 CẬP NHẬT NHÀ CUNG CẤP - ADMIN
# ==============================================================
@supplier_api.put('/<int:nha_cung_cap_id>', responses={"200": NhaCungCapResponse})
@admin_required
def update_nha_cung_cap(path: NhaCungCapPath, body: NhaCungCapUpdate):
    """
    Cập nhật thông tin nhà cung cấp
    """
    try:
        current_app.logger.info(f"Bắt đầu cập nhật nhà cung cấp ID: {path.nha_cung_cap_id}")
        
        # Gọi service cập nhật nhà cung cấp
        updated_nha_cung_cap = NhaCungCapService.cap_nhat_nha_cung_cap(path.nha_cung_cap_id, body)
        if not updated_nha_cung_cap:
            return jsonify({"error": "Nhà cung cấp không tồn tại"}), 404
            
        db.session.commit()
        
        current_app.logger.info(f"Cập nhật nhà cung cấp thành công: {updated_nha_cung_cap.ten_nha_cung_cap}")
        
        response = NhaCungCapResponse.model_validate(updated_nha_cung_cap)
        return jsonify(response.model_dump()), 200
        
    except BadRequest as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi BadRequest: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi cập nhật nhà cung cấp: {traceback.format_exc()}")
        return jsonify({"error": f"Không thể cập nhật nhà cung cấp: {str(e)}"}), 500

# ==============================================================
# 5️ XÓA NHÀ CUNG CẤP - ADMIN
# ==============================================================
@supplier_api.delete('/<int:nha_cung_cap_id>', responses={"200": NhaCungCapDelete})
@admin_required
def delete_nha_cung_cap(path: NhaCungCapPath):
    """Xóa nhà cung cấp"""
    try:
        current_app.logger.info(f"Bắt đầu xóa nhà cung cấp ID: {path.nha_cung_cap_id}")
        
        # Gọi service xóa nhà cung cấp
        success = NhaCungCapService.xoa_nha_cung_cap(path.nha_cung_cap_id)
        if not success:
            return jsonify({"error": "Không thể xóa nhà cung cấp. Có thể nhà cung cấp không tồn tại hoặc đang có phiếu nhập liên quan."}), 400
            
        current_app.logger.info(f"Xóa nhà cung cấp thành công: {path.nha_cung_cap_id}")
        
        return jsonify({"message": success[1]}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi xóa nhà cung cấp {path.nha_cung_cap_id}: {traceback.format_exc()}")
        return jsonify({"error": "Không thể xóa nhà cung cấp."}), 500


# ==============================================================
# 8️ LẤY DANH SÁCH NHÀ CUNG CẤP CƠ BẢN
# ==============================================================
@supplier_api.get('/danh-sach-co-ban', responses={"200": ListNhaCungCapResponse})
def get_all_nha_cung_cap_basic():
    """
    Lấy danh sách tất cả nhà cung cấp chỉ bao gồm ID, mã và tên
    Sử dụng cho dropdown, autocomplete, etc.
    """
    try:
        current_app.logger.info("Lấy danh sách nhà cung cấp cơ bản")
        
        # Sử dụng service với limit lớn để lấy tất cả
        result = NhaCungCapService.lay_danh_sach_nha_cung_cap(
            skip=0,
            limit=1000  # Giới hạn hợp lý
        )
        
        return jsonify(result.model_dump()), 200
        
    except Exception:
        current_app.logger.error(f"Lỗi lấy danh sách nhà cung cấp cơ bản: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi lấy danh sách nhà cung cấp cơ bản."}), 500



# ==============================================================
# 10️ THAY ĐỔI TRẠNG THÁI NHÀ CUNG CẤP - KÍCH HOẠT
# ==============================================================
@supplier_api.patch('/<int:nha_cung_cap_id>/kich-hoat', responses={"200": NhaCungCapResponse})
@admin_required
def kich_hoat(path: NhaCungCapPath):
    """
    Thay đổi trạng thái nhà cung cấp (kích hoạt/ngừng hoạt động)
    """
    try:
        current_app.logger.info(f"Thay đổi trạng thái nhà cung cấp ID: {path.nha_cung_cap_id}")
        
        nha_cung_cap = NhaCungCapService.thay_doi_trang_thai_nha_cung_cap(path.nha_cung_cap_id, TrangThaiNhaCungCapEnum.KICH_HOAT)
        if not nha_cung_cap:
            return jsonify({"error": "Nhà cung cấp không tồn tại"}), 404
        
        response = NhaCungCapResponse.model_validate(nha_cung_cap)
        return jsonify(response.model_dump()), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi thay đổi trạng thái nhà cung cấp {path.nha_cung_cap_id}: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi thay đổi trạng thái nhà cung cấp."}), 500
    
# ==============================================================
# 11 THAY ĐỔI TRẠNG THÁI NHÀ CUNG CẤP - NGỪNG HOẠT ĐỘNG
# ==============================================================
@supplier_api.patch('/<int:nha_cung_cap_id>/ngung-hoat-dong', responses={"200": NhaCungCapResponse})
@admin_required
def ngung_hoat_dong(path: NhaCungCapPath):
    """
    Thay đổi trạng thái nhà cung cấp (kích hoạt/ngừng hoạt động)
    """
    try:
        current_app.logger.info(f"Thay đổi trạng thái nhà cung cấp ID: {path.nha_cung_cap_id}")
        
        nha_cung_cap = NhaCungCapService.thay_doi_trang_thai_nha_cung_cap(path.nha_cung_cap_id, TrangThaiNhaCungCapEnum.NGUNG_HOAT_DONG)
        if not nha_cung_cap:
            return jsonify({"error": "Nhà cung cấp không tồn tại"}), 404
        
        response = NhaCungCapResponse.model_validate(nha_cung_cap)
        return jsonify(response.model_dump()), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi thay đổi trạng thái nhà cung cấp {path.nha_cung_cap_id}: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi thay đổi trạng thái nhà cung cấp."}), 500