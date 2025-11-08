# /backend/app/routes/admin_don_hang_routes.py
from datetime import datetime
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_openapi3 import APIBlueprint, Tag
from datetime import datetime

from ..extensions import db
from ..services.donhang_service import DonHangService
from ..schemas.giohang_dathang.DonHang import DonHangResponse
from ..schemas.giohang_dathang import DonHangStatusUpdate, OrderCancelRequest
from ..models import NguoiDung, DonHang, ThanhToan
from ..models.enums import TrangThaiDonHangEnum, TrangThaiThanhToanEnum
from ..models.enums import VaiTroNguoiDungEnum
from ..utils.decorators import admin_required
# Tạo blueprint
admin_don_hang_api = APIBlueprint('admin_don_hang', __name__, url_prefix='/api/admin/orders')
admin_tag = Tag(name="Admin Đơn hàng", description="Quản lý đơn hàng cho admin")


@admin_don_hang_api.get('/')
@admin_required
def get_all_orders():
    """Lấy tất cả đơn hàng (cho admin) với phân trang và filter"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', type=str)
        search = request.args.get('search', type=str)
        
        # Convert string status to enum
        status_enum = None
        if status:
            try:
                status_enum = TrangThaiDonHangEnum(status)
            except ValueError:
                return {'error': 'Trạng thái không hợp lệ'}, 400
        
        orders, total = DonHangService.get_all_orders(page, per_page, status_enum, search)
        
        orders_data = [DonHangResponse.from_orm(order).dict() for order in orders]
        
        return {
            'data': orders_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

@admin_don_hang_api.get('/<int:order_id>')
@admin_required
def get_order_detail_admin(order_id: int):
    """Lấy chi tiết đơn hàng (admin)"""
    try:
        order = DonHangService.get_order_detail(order_id, is_admin=True)
        if not order:
            return {'error': 'Đơn hàng không tồn tại'}, 404
        
        return DonHangResponse.from_orm(order).dict(), 200
        
    except Exception as e:
        return {'error': str(e)}, 500

@admin_don_hang_api.put('/<int:order_id>/status')
@admin_required
def update_order_status(order_id: int, body: DonHangStatusUpdate):
    """Admin cập nhật trạng thái đơn hàng"""
    try:
        order = DonHangService.update_order_status(
            order_id, 
            body.trang_thai,
            is_admin=True
        )
        
        # Gửi thông báo cập nhật trạng thái
        from ..tasks.notification_task import send_order_status_update_notification
        send_order_status_update_notification.delay(order.id, body.trang_thai.value, body.ly_do)
        
        return {
            'message': 'Cập nhật trạng thái thành công',
            'don_hang': DonHangResponse.from_orm(order).dict()
        }, 200
        
    except ValueError as e:
        return {'error': str(e)}, 400
    except Exception as e:
        db.session.rollback()
        return {'error': f'Lỗi khi cập nhật trạng thái: {str(e)}'}, 500

@admin_don_hang_api.put('/<int:order_id>/cancel')
@admin_required
def admin_cancel_order(order_id: int, body: OrderCancelRequest):
    """Admin hủy đơn hàng"""
    try:
        order = DonHangService.update_order_status(
            order_id, 
            TrangThaiDonHangEnum.DA_HUY,
            is_admin=True
        )
        
        # Gửi thông báo hủy đơn hàng
        from ..tasks.notification_task import send_order_cancellation_notification
        send_order_cancellation_notification.delay(order.id, body.ly_do, is_admin=True)
        
        return {
            'message': 'Đã hủy đơn hàng thành công',
            'don_hang': DonHangResponse.from_orm(order).dict()
        }, 200
        
    except ValueError as e:
        return {'error': str(e)}, 400
    except Exception as e:
        db.session.rollback()
        return {'error': f'Lỗi khi hủy đơn hàng: {str(e)}'}, 500

@admin_don_hang_api.get('/statistics')
@admin_required
def get_order_statistics():
    """Lấy thống kê đơn hàng cho dashboard admin"""
    try:
        # Thống kê theo trạng thái
        status_stats = db.session.execute(
            db.select(
                DonHang.trang_thai,
                db.func.count(DonHang.id)
            ).group_by(DonHang.trang_thai)
        ).all()
        
        # Tổng doanh thu (các đơn đã hoàn thành)
        total_revenue = db.session.execute(
            db.select(db.func.sum(ThanhToan.so_tien)).where(
                ThanhToan.trang_thai == TrangThaiThanhToanEnum.DA_THANH_TOAN
            )
        ).scalar() or 0
        
        # Số đơn hàng trong ngày
        today = datetime.utcnow().date()
        orders_today = db.session.execute(
            db.select(db.func.count(DonHang.id)).where(
                db.func.date(DonHang.ngay_tao) == today
            )
        ).scalar() or 0
        
        return {
            'status_statistics': {
                status.value: count for status, count in status_stats
            },
            'total_revenue': float(total_revenue),
            'orders_today': orders_today,
            'total_orders': sum(count for _, count in status_stats)
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500