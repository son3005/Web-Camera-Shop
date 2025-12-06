# /backend/app/routes/admin_danh_gia_routes.py
import traceback
from flask import current_app, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_openapi3 import APIBlueprint
from datetime import datetime
from ..services.danhgia_service import DanhGiaService
from ..schemas.extras import DanhGiaUpdate, DanhGiaResponse
from ..models.enums import TrangThaiDanhGiaEnum, VaiTroNguoiDungEnum
from ..utils.decorators import admin_required
from pydantic import BaseModel
# Khởi tạo blueprint
admin_danh_gia_api = APIBlueprint('admin_danh_gia', __name__, url_prefix='/api/admin/danh-gia')

class DanhGiaPath(BaseModel):
    danh_gia_id: int


@admin_danh_gia_api.get('')
@admin_required
def get_all_danh_gia():
    """
    Lấy tất cả đánh giá với bộ lọc (admin)
    """
    try:
        current_app.logger.info("Bắt đầu lấy danh sách đánh giá admin")
        
        # Xử lý các tham số phân trang
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Xử lý các tham số lọc
        diem_danh_gia = request.args.get('diem_danh_gia', type=int)
        san_pham_id = request.args.get('san_pham_id', type=int)
        nguoi_dung_id = request.args.get('nguoi_dung_id', type=int)
        
        # Xử lý trạng thái
        trang_thai_str = request.args.get('trang_thai')
        trang_thai = None
        if trang_thai_str:
            try:
                trang_thai = TrangThaiDanhGiaEnum(trang_thai_str)
            except ValueError:
                return jsonify({'error': 'Trạng thái không hợp lệ. Các giá trị hợp lệ: da_duyet, bi_tu_choi'}), 400
        
        # Xử lý thời gian
        tu_ngay_str = request.args.get('tu_ngay')
        den_ngay_str = request.args.get('den_ngay')
        
        tu_ngay = None
        den_ngay = None
        
        if tu_ngay_str:
            try:
                tu_ngay = datetime.strptime(tu_ngay_str, '%Y-%m-%d')
            except ValueError:
                return jsonify({'error': 'Định dạng tu_ngay không hợp lệ. Sử dụng YYYY-MM-DD'}), 400
        
        if den_ngay_str:
            try:
                den_ngay = datetime.strptime(den_ngay_str, '%Y-%m-%d')
            except ValueError:
                return jsonify({'error': 'Định dạng den_ngay không hợp lệ. Sử dụng YYYY-MM-DD'}), 400
        
        # Xử lý co_binh_luan
        co_binh_luan_str = request.args.get('co_binh_luan')
        co_binh_luan = None
        if co_binh_luan_str:
            if co_binh_luan_str.lower() in ['true', '1', 'yes']:
                co_binh_luan = True
            elif co_binh_luan_str.lower() in ['false', '0', 'no']:
                co_binh_luan = False
            else:
                return jsonify({'error': 'co_binh_luan phải là true hoặc false'}), 400
        
        current_app.logger.info(f"Tham số: page={page}, per_page={per_page}, diem_danh_gia={diem_danh_gia}")
        
        # Gọi service 
        danh_gias, pagination = DanhGiaService.get_all_danh_gia_admin(
            page=page,
            per_page=per_page,
            diem_danh_gia=diem_danh_gia,
            trang_thai=trang_thai,
            san_pham_id=san_pham_id,
            nguoi_dung_id=nguoi_dung_id,
            tu_ngay=tu_ngay,
            den_ngay=den_ngay,
            co_binh_luan=co_binh_luan
        )
        
        current_app.logger.info(f"Lấy được {len(danh_gias)} đánh giá")
        
        # Xử lý chuyển đổi dữ liệu với exception handling
        data = []
        for dg in danh_gias:
            try:
                data.append(DanhGiaResponse.from_orm(dg).dict())
            except Exception as e:
                current_app.logger.error(f"Lỗi chuyển đổi đánh giá {dg.id}: {str(e)}")
                # Bỏ qua đánh giá lỗi, tiếp tục với các đánh giá khác
                continue
        
        return jsonify({
            'data': data,
            'pagination': pagination
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Lỗi trong get_all_danh_gia: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({'error': 'Lỗi server khi lấy danh sách đánh giá'}), 500
    
@admin_danh_gia_api.get('/thong-ke')
@admin_required
def get_thong_ke_tong_quan():
    """
    Lấy thống kê tổng quan đánh giá (admin)
    """
    try:
        thong_ke = DanhGiaService.get_thong_ke_danh_gia()
        return jsonify(thong_ke), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    

@admin_danh_gia_api.put('/<int:danh_gia_id>/mo-khoa')
@admin_required
def mo_khoa_danh_gia(path: DanhGiaPath):
    """
    Admin mở khóa đánh giá (đổi trạng thái thành DA_DUYET)
    """
    try:
        danh_gia = DanhGiaService.admin_update_trang_thai(
            danh_gia_id=int(path.danh_gia_id),
            trang_thai=TrangThaiDanhGiaEnum.DA_DUYET
        )
        
        if not danh_gia:
            return jsonify({'error': 'Đánh giá không tồn tại'}), 404
            
        return jsonify({
            'message': 'Đã mở khóa đánh giá thành công',
            'data': DanhGiaResponse.from_orm(danh_gia).dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@admin_danh_gia_api.put('/<int:danh_gia_id>/khoa')
@admin_required
def khoa_danh_gia(path: DanhGiaPath):
    """
    Admin khóa đánh giá (đổi trạng thái thành BI_TU_CHOI)
    """
    try:
        danh_gia = DanhGiaService.admin_update_trang_thai(
            danh_gia_id=int(path.danh_gia_id),
            trang_thai=TrangThaiDanhGiaEnum.BI_TU_CHOI
        )
        
        if not danh_gia:
            return jsonify({'error': 'Đánh giá không tồn tại'}), 404
            
        return jsonify({
            'message': 'Đã khóa đánh giá thành công',
            'data': DanhGiaResponse.from_orm(danh_gia).dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500