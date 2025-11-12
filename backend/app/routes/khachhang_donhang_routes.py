from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, or_
from ..models import DonHang, ChiTietDonHang, ThanhToan, NguoiDung
from ..schemas.giohang_dathang import DonHangResponse, DonHangUpdate
from ..extensions import db
from ..models.enums import TrangThaiDonHangEnum

khachhang_donhang_api = Blueprint('khach_hang_don_hang', __name__, url_prefix='/api/khach-hang/don-hang')

@khachhang_donhang_api.route('', methods=['GET'])
@jwt_required()
def get_don_hang():
    """Lấy danh sách đơn hàng của khách hàng"""
    current_user_id = get_jwt_identity()
    
    try:
        don_hangs = DonHang.query.filter_by(nguoi_dung_id=current_user_id)\
            .order_by(DonHang.ngay_tao.desc()).all()
        
        return jsonify([
            DonHangResponse.from_orm(dh).dict() for dh in don_hangs
        ]), 200
    except Exception as e:
        return jsonify({"msg": "Lỗi server"}), 500

@khachhang_donhang_api.route('/<int:don_hang_id>', methods=['GET'])
@jwt_required()
def get_don_hang_detail(don_hang_id):
    """Lấy chi tiết đơn hàng"""
    current_user_id = get_jwt_identity()
    
    try:
        don_hang = DonHang.query.filter_by(
            id=don_hang_id, 
            nguoi_dung_id=current_user_id
        ).first()
        
        if not don_hang:
            return jsonify({"msg": "Đơn hàng không tồn tại"}), 404
            
        return jsonify(DonHangResponse.from_orm(don_hang).dict()), 200
    except Exception as e:
        return jsonify({"msg": "Lỗi server"}), 500

@khachhang_donhang_api.route('/<int:don_hang_id>/huy', methods=['POST'])
@jwt_required()
def huy_don_hang(don_hang_id):
    """Khách hàng huỷ đơn hàng (chỉ khi chưa giao)"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('ly_do'):
        return jsonify({"msg": "Vui lòng nhập lý do"}), 400
    
    try:
        don_hang = DonHang.query.filter_by(
            id=don_hang_id, 
            nguoi_dung_id=current_user_id
        ).first()
        
        if not don_hang:
            return jsonify({"msg": "Đơn hàng không tồn tại"}), 404
        
        # Chỉ cho phép huỷ khi đơn hàng chưa chuyển sang trạng thái đang giao
        if don_hang.trang_thai in [TrangThaiDonHangEnum.DANG_GIAO, TrangThaiDonHangEnum.DA_GIAO]:
            return jsonify({"msg": "Không thể huỷ đơn hàng đã giao"}), 400
        
        don_hang.trang_thai = TrangThaiDonHangEnum.DA_HUY
        don_hang.ly_do = data['ly_do']
        
        db.session.commit()
        
        return jsonify({"msg": "Huỷ đơn hàng thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Lỗi server"}), 500

@khachhang_donhang_api.route('/<int:don_hang_id>/yeu-cau-doi-tra', methods=['POST'])
@jwt_required()
def yeu_cau_doi_tra(don_hang_id):
    """Yêu cầu đổi trả hàng cho đơn hàng đã giao"""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('ly_do'):
        return jsonify({"msg": "Vui lòng nhập lý do"}), 400
    
    try:
        don_hang = DonHang.query.filter_by(
            id=don_hang_id, 
            nguoi_dung_id=current_user_id
        ).first()
        
        if not don_hang:
            return jsonify({"msg": "Đơn hàng không tồn tại"}), 404
        
        # Chỉ cho phép yêu cầu đổi trả với đơn hàng đã giao
        if don_hang.trang_thai != TrangThaiDonHangEnum.DA_GIAO:
            return jsonify({"msg": "Chỉ có thể yêu cầu đổi trả với đơn hàng đã giao"}), 400
        
        don_hang.trang_thai = TrangThaiDonHangEnum.YEU_CAU_DOI_TRA
        don_hang.ly_do = data['ly_do']
        
        db.session.commit()
        
        return jsonify({"msg": "Gửi yêu cầu đổi trả thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Lỗi server"}), 500 