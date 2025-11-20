from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, or_, func, desc, asc
from decimal import Decimal
from datetime import datetime

from ..utils.decorators import admin_required

from ..models import DonHang, ChiTietDonHang, ThanhToan, NguoiDung
from ..schemas.giohang_dathang import (
    DonHangResponse, DonHangUpdate, DonHangFilter
)
from ..extensions import db, redis
from ..models.enums import TrangThaiDonHangEnum, TrangThaiThanhToanEnum
from ..services.email_service import send_email


chuyen_trang_thai_don_hang = {
    TrangThaiDonHangEnum.CHO_XAC_NHAN: [TrangThaiDonHangEnum.DA_XAC_NHAN, TrangThaiDonHangEnum.DA_HUY],
    TrangThaiDonHangEnum.DA_XAC_NHAN: [TrangThaiDonHangEnum.DANG_GIAO, TrangThaiDonHangEnum.DA_HUY],
    TrangThaiDonHangEnum.DANG_GIAO: [TrangThaiDonHangEnum.DA_GIAO],
    TrangThaiDonHangEnum.DA_GIAO: [TrangThaiDonHangEnum.YEU_CAU_DOI_TRA],
    TrangThaiDonHangEnum.DA_HUY: [],
    TrangThaiDonHangEnum.YEU_CAU_DOI_TRA: [TrangThaiDonHangEnum.CHAP_NHAN_DOI_TRA, TrangThaiDonHangEnum.TU_CHOI_DOI_TRA],
    TrangThaiDonHangEnum.CHAP_NHAN_DOI_TRA: [TrangThaiDonHangEnum.DA_HOAN_TIEN],
    TrangThaiDonHangEnum.TU_CHOI_DOI_TRA: [],
}

admin_don_hang_api = Blueprint('admin_don_hang', __name__, url_prefix='/api/admin/don-hang')

@admin_don_hang_api.route('', methods=['GET'])
@admin_required
def get_all_don_hang():
    """Lấy tất cả đơn hàng với filter và sắp xếp"""
    try:
        # Sửa lại cách parse filter để tránh lỗi
        filter_params = {}
        if request.args.get('trang_thai'):
            filter_params['trang_thai'] = request.args.get('trang_thai')
        if request.args.get('tu_ngay'):
            filter_params['tu_ngay'] = datetime.fromisoformat(request.args.get('tu_ngay'))
        if request.args.get('den_ngay'):
            filter_params['den_ngay'] = datetime.fromisoformat(request.args.get('den_ngay'))
        if request.args.get('phuong_thuc_thanh_toan'):
            filter_params['phuong_thuc_thanh_toan'] = request.args.get('phuong_thuc_thanh_toan')
        
        filters = DonHangFilter(**filter_params)
        query = DonHang.query
        
        # Áp dụng filter
        if filters.trang_thai:
            query = query.filter(DonHang.trang_thai == filters.trang_thai)
        
        if filters.tu_ngay:
            query = query.filter(DonHang.ngay_tao >= filters.tu_ngay)
        
        if filters.den_ngay:
            query = query.filter(DonHang.ngay_tao <= filters.den_ngay)
        
        if filters.phuong_thuc_thanh_toan:
            query = query.join(ThanhToan).filter(
                ThanhToan.phuong_thuc == filters.phuong_thuc_thanh_toan
            )
        
        # Sắp xếp
        order_column = DonHang.ngay_tao
        if hasattr(filters, 'sap_xep_theo') and filters.sap_xep_theo == "tong_tien":
            query = query.join(ChiTietDonHang).group_by(DonHang.id)
            order_column = func.sum(ChiTietDonHang.don_gia_luc_mua * ChiTietDonHang.so_luong)
        
        if hasattr(filters, 'thu_tu') and filters.thu_tu == "asc":
            query = query.order_by(asc(order_column))
        else:
            query = query.order_by(desc(order_column))
        
        don_hangs = query.all()
        
        return jsonify([
            DonHangResponse.from_orm(dh).dict() for dh in don_hangs
        ]), 200
    except Exception as e:
        print(f"Lỗi: {e}")
        return jsonify({"msg": "Lỗi server"}), 500

@admin_don_hang_api.route('/<int:don_hang_id>', methods=['GET'])
@admin_required
def get_don_hang_detail(don_hang_id):
    """Lấy chi tiết đơn hàng cho admin"""   
    try:
        don_hang = DonHang.query.get(don_hang_id)
        
        if not don_hang:
            return jsonify({"msg": "Đơn hàng không tồn tại"}), 404
            
        return jsonify(DonHangResponse.from_orm(don_hang).dict()), 200
    except Exception as e:
        return jsonify({"msg": "Lỗi server"}), 500


@admin_don_hang_api.route('/<int:don_hang_id>/thanh-toan', methods=['PUT'])
@admin_required
def cap_nhat_trang_thai_thanh_toan(don_hang_id):
    """Cập nhật trạng thái thanh toán (cho COD)"""
    data = request.get_json()
    if not data or not data.get('trang_thai_thanh_toan'):
        return jsonify({"msg": "Thiếu thông tin"}), 400
    
    try:
        don_hang = DonHang.query.get(don_hang_id)
        if not don_hang:
            return jsonify({"msg": "Đơn hàng không tồn tại"}), 404
        
        if not don_hang.thanh_toan:
            return jsonify({"msg": "Đơn hàng chưa có thông tin thanh toán"}), 400
        if not don_hang.thanh_toan.phuong_thuc == 'COD':
            return jsonify({"msg": "Chỉ có thể cập nhật trạng thái thanh toán cho phương thức COD"}), 400
        new_payment_status = TrangThaiThanhToanEnum(data['trang_thai_thanh_toan'])
        if new_payment_status not in [TrangThaiThanhToanEnum.DA_THANH_TOAN, TrangThaiThanhToanEnum.THAT_BAI]:
            return jsonify({"msg": "Trạng thái thanh toán không hợp lệ"}), 400
        if new_payment_status == TrangThaiDonHangEnum.DA_THANH_TOAN and don_hang.thanh_toan.trang_thai == TrangThaiThanhToanEnum.DA_THANH_TOAN:
            return jsonify({"msg": "Đơn hàng đã được thanh toán"}), 400
        if new_payment_status == TrangThaiDonHangEnum.THAT_BAI and don_hang.thanh_toan.trang_thai == TrangThaiThanhToanEnum.THAT_BAI:
            return jsonify({"msg": "Thanh toán đơn hàng đã bị từ chối"}), 400
        if new_payment_status == TrangThaiThanhToanEnum.DA_THANH_TOAN:
            if don_hang.trang_thai != TrangThaiDonHangEnum.DA_XAC_NHAN:
                return jsonify({"msg": "Chỉ có thể đánh dấu đã thanh toán cho đơn hàng đã xác nhận"}), 400
            don_hang.trang_thai = TrangThaiDonHangEnum.DA_GIAO
        don_hang.thanh_toan.trang_thai = new_payment_status
        
        db.session.commit()
        
        return jsonify({"msg": "Cập nhật trạng thái thanh toán thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Lỗi server"}), 500

@admin_don_hang_api.route('/<int:don_hang_id>/trang-thai', methods=['PUT'])
@admin_required
def cap_nhat_trang_thai(don_hang_id):
    """Cập nhật trạng thái đơn hàng"""    
    data = request.get_json()

    if not data or not data.get('trang_thai'):
        return jsonify({"msg": "Thiếu thông tin"}), 400
    try:
        don_hang = DonHang.query.get(don_hang_id)
        if not don_hang:
            return jsonify({"msg": "Đơn hàng không tồn tại"}), 404
        
        new_status = TrangThaiDonHangEnum(data['trang_thai'])
        allowed_transitions = chuyen_trang_thai_don_hang.get(don_hang.trang_thai, [])
        if new_status not in allowed_transitions:
            return jsonify({"msg": "Không thể chuyển trạng thái đơn hàng này"}), 400
        
        # Logic chuyển trạng thái
        if new_status == TrangThaiDonHangEnum.DA_HUY:
            if not data.get('ly_do'):
                return jsonify({"msg": "Vui lòng nhập lý do huỷ"}), 400
            don_hang.ly_do = data['ly_do']
            
            # THÊM: Cập nhật số lượng kho khi hủy đơn
            from ..services.kho_service import KhoService
            kho_service = KhoService(redis, db)
            
            # Lấy thông tin items từ chi tiết đơn hàng
            items_for_kho = []
            for chi_tiet in don_hang.items:
                items_for_kho.append({
                    'id_bien_the': chi_tiet.bien_the_san_pham_id,
                    'so_luong': chi_tiet.so_luong
                })
            
            # Cập nhật số lượng bán (giảm)
            kho_service.cap_nhat_so_luong_khi_huy_don(items_for_kho)
            
            # Gửi email thông báo huỷ đơn
            if don_hang.nguoi_dung:
                send_email(
                    to_email=don_hang.nguoi_dung.email,
                    subject="Thông báo huỷ đơn hàng",
                    template="email/huy_don_hang.html",
                    data={
                        "ma_don_hang": don_hang.ma_don_hang,
                        "ly_do": data['ly_do']
                    }
                )
        
        elif new_status == TrangThaiDonHangEnum.CHAP_NHAN_DOI_TRA:
            if not data.get('ly_do'):
                return jsonify({"msg": "Vui lòng nhập lý do chấp nhận đổi trả"}), 400
            don_hang.ly_do = data['ly_do']
        
        elif new_status == TrangThaiDonHangEnum.TU_CHOI_DOI_TRA:
            if not data.get('ly_do'):
                return jsonify({"msg": "Vui lòng nhập lý do từ chối đổi trả"}), 400
            don_hang.ly_do = data['ly_do']
        
        don_hang.trang_thai = new_status
        db.session.commit()
        
        return jsonify({"msg": "Cập nhật trạng thái thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Lỗi server"}), 500