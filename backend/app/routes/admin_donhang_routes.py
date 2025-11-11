# backend/app/routes/admin_donhang_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..models.giohang_dathang.ThanhToan import ThanhToan
from ..models.giohang_dathang.DonHang import DonHang
from ..models.nguoidung.NguoiDung import NguoiDung
from ..schemas.giohang_dathang import DonHangResponse, DonHangStatusUpdate, ChiTietDonHangResponse
from ..extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func, extract

# QUAN TRỌNG: ĐẢM BẢO TÊN NÀY KHỚP VỚI IMPORT
admin_donhang_api = Blueprint('admin_donhang_api', __name__)

@admin_donhang_api.route('/orders', methods=['GET'])
@jwt_required()
def get_all_orders():
    """Admin: Lấy tất cả đơn hàng với filter"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check admin role
        user = NguoiDung.query.get(current_user_id)
        if user.vai_tro != 'quan_tri_vien':
            return jsonify({"error": "Không có quyền truy cập"}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        trang_thai = request.args.get('trang_thai')
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        
        # Build query
        query = DonHang.query
        
        if trang_thai:
            query = query.filter(DonHang.trang_thai == trang_thai)
        
        if from_date:
            query = query.filter(DonHang.ngay_tao >= from_date)
        if to_date:
            query = query.filter(DonHang.ngay_tao <= to_date)
        
        total_orders = query.count()
        orders = query.order_by(DonHang.ngay_tao.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        orders_data = []
        for order in orders.items:
            order_dict = DonHangResponse.from_orm(order).dict()
            orders_data.append(order_dict)
        
        return jsonify({
            "success": True,
            "data": orders_data,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total_orders,
                "pages": (total_orders + per_page - 1) // per_page
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@admin_donhang_api.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    """Admin: Cập nhật trạng thái đơn hàng"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check admin role
        user = NguoiDung.query.get(current_user_id)
        if user.vai_tro != 'quan_tri_vien':
            return jsonify({"error": "Không có quyền truy cập"}), 403
        
        order = DonHang.query.get(order_id)
        if not order:
            return jsonify({"error": "Đơn hàng không tồn tại"}), 404
        
        data = request.get_json()
        status_update = DonHangStatusUpdate(**data)
        
        # Cập nhật trạng thái
        old_status = order.trang_thai
        order.trang_thai = status_update.trang_thai
        order.ly_do = status_update.ly_do
        order.ngay_cap_nhat = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Cập nhật trạng thái thành công"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@admin_donhang_api.route('/orders/statistics', methods=['GET'])
@jwt_required()
def get_order_statistics():
    """Admin: Thống kê đơn hàng"""
    try:
        current_user_id = get_jwt_identity()
        
        # Check admin role
        user = NguoiDung.query.get(current_user_id)
        if user.vai_tro != 'quan_tri_vien':
            return jsonify({"error": "Không có quyền truy cập"}), 403
        
        # Thống kê theo trạng thái
        status_stats = db.session.query(
            DonHang.trang_thai,
            func.count(DonHang.id)
        ).group_by(DonHang.trang_thai).all()
        
        # Thống kê theo tháng
        current_year = datetime.now().year
        monthly_stats = db.session.query(
            extract('month', DonHang.ngay_tao).label('month'),
            func.count(DonHang.id),
            func.sum(ThanhToan.so_tien)
        ).join(ThanhToan).filter(
            extract('year', DonHang.ngay_tao) == current_year
        ).group_by('month').all()
        
        # Tổng doanh thu
        total_revenue = db.session.query(
            func.sum(ThanhToan.so_tien)
        ).filter(ThanhToan.trang_thai == 'da_thanh_toan').scalar() or 0
        
        statistics = {
            "status_distribution": {
                status: count for status, count in status_stats
            },
            "monthly_stats": [
                {
                    "month": month,
                    "order_count": count,
                    "revenue": float(revenue) if revenue else 0
                } for month, count, revenue in monthly_stats
            ],
            "total_revenue": float(total_revenue),
            "total_orders": DonHang.query.count()
        }
        
        return jsonify({
            "success": True,
            "data": statistics
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500