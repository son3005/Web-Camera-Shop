# /backend/app/routes/payment_routes.py
from flask import request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_openapi3 import APIBlueprint, Tag

from ..extensions import db
from ..models import ThanhToan, DonHang
from ..services.payment_service import PaymentService
from ..schemas.payment import (
    PaymentCreationResponse, 
    PaymentWebhookRequest,
    PaymentUpdateRequest
)

# Tạo blueprint
payment_api = APIBlueprint('payment', __name__, url_prefix='/api/payment')
payment_tag = Tag(name="Thanh toán", description="Quản lý thanh toán qua PayOS")

@payment_api.post('/create-payment-link')
@jwt_required()
def create_payment_link(body: dict):
    """Tạo link thanh toán PayOS cho đơn hàng"""
    try:
        current_user_id = get_jwt_identity()
        
        # Lấy thông tin từ request
        thanh_toan_id = body.get('thanh_toan_id')
        cancel_url = body.get('cancel_url', f"{current_app.config['FRONTEND_URL']}/checkout/failed")
        return_url = body.get('return_url', f"{current_app.config['FRONTEND_URL']}/checkout/success")
        
        if not thanh_toan_id:
            return {'error': 'Thiếu thanh_toan_id'}, 400
        
        # Lấy thông tin thanh toán
        thanh_toan = db.session.query(ThanhToan).filter_by(id=thanh_toan_id).first()
        if not thanh_toan:
            return {'error': 'Không tìm thấy thông tin thanh toán'}, 404
        
        # Kiểm tra quyền: chỉ chủ đơn hàng hoặc admin mới được tạo link thanh toán
        if thanh_toan.don_hang.nguoi_dung_id != current_user_id:
            return {'error': 'Không có quyền truy cập'}, 403
        
        # Khởi tạo PayOS client từ app extension
        payos_client = current_app.extensions.get('payos')
        if not payos_client:
            return {'error': 'PayOS client chưa được cấu hình'}, 500
        
        payment_service = PaymentService(payos_client)
        
        # Tạo link thanh toán
        payment_link = payment_service.create_payment_link(thanh_toan, cancel_url, return_url)
        
        return {
            'message': 'Tạo link thanh toán thành công',
            'data': payment_link
        }, 200
        
    except Exception as e:
        return {'error': f'Lỗi khi tạo link thanh toán: {str(e)}'}, 500

@payment_api.post('/webhook')
def payment_webhook(body: PaymentWebhookRequest):
    """Webhook nhận kết quả thanh toán từ PayOS"""
    try:
        # Lấy raw body để xác thực chữ ký
        raw_body = request.get_data(as_text=True)
        
        # Khởi tạo PayOS client từ app extension
        payos_client = current_app.extensions.get('payos')
        if not payos_client:
            return {'error': 'PayOS client chưa được cấu hình'}, 500
        
        payment_service = PaymentService(payos_client)
        
        # Xác thực chữ ký
        if not payment_service.verify_webhook_signature(raw_body, body.signature):
            return {'error': 'Chữ ký không hợp lệ'}, 400
        
        # Xử lý webhook
        success = payment_service.handle_payment_webhook(body.data.dict())
        
        if success:
            return {'message': 'Xử lý webhook thành công'}, 200
        else:
            return {'error': 'Xử lý webhook thất bại'}, 400
        
    except Exception as e:
        return {'error': f'Lỗi khi xử lý webhook: {str(e)}'}, 500

@payment_api.get('/info/<int:order_code>')
@jwt_required()
def get_payment_info(order_code: int):
    """Lấy thông tin thanh toán từ PayOS"""
    try:
        current_user_id = get_jwt_identity()
        
        # Lấy thông tin thanh toán từ database
        thanh_toan = db.session.query(ThanhToan).filter_by(id=order_code).first()
        if not thanh_toan:
            return {'error': 'Không tìm thấy thông tin thanh toán'}, 404
        
        # Kiểm tra quyền
        if thanh_toan.don_hang.nguoi_dung_id != current_user_id:
            return {'error': 'Không có quyền truy cập'}, 403
        
        # Khởi tạo PayOS client
        payos_client = current_app.extensions.get('payos')
        if not payos_client:
            return {'error': 'PayOS client chưa được cấu hình'}, 500
        
        payment_service = PaymentService(payos_client)
        
        # Lấy thông tin từ PayOS
        payment_info = payment_service.get_payment_info(order_code)
        if not payment_info:
            return {'error': 'Không thể lấy thông tin thanh toán từ PayOS'}, 400
        
        return {
            'message': 'Lấy thông tin thanh toán thành công',
            'data': payment_info
        }, 200
        
    except Exception as e:
        return {'error': f'Lỗi khi lấy thông tin thanh toán: {str(e)}'}, 500

@payment_api.put('/cancel-payment-link')
@jwt_required()
def cancel_payment_link(body: dict):
    """Hủy link thanh toán trên PayOS"""
    try:
        current_user_id = get_jwt_identity()
        order_code = body.get('order_code')
        
        if not order_code:
            return {'error': 'Thiếu order_code'}, 400
        
        # Lấy thông tin thanh toán
        thanh_toan = db.session.query(ThanhToan).filter_by(id=order_code).first()
        if not thanh_toan:
            return {'error': 'Không tìm thấy thông tin thanh toán'}, 404
        
        # Kiểm tra quyền
        if thanh_toan.don_hang.nguoi_dung_id != current_user_id:
            return {'error': 'Không có quyền truy cập'}, 403
        
        # Khởi tạo PayOS client
        payos_client = current_app.extensions.get('payos')
        if not payos_client:
            return {'error': 'PayOS client chưa được cấu hình'}, 500
        
        payment_service = PaymentService(payos_client)
        
        # Hủy link thanh toán
        success = payment_service.cancel_payment_link(order_code)
        if success:
            return {'message': 'Hủy link thanh toán thành công'}, 200
        else:
            return {'error': 'Hủy link thanh toán thất bại'}, 400
        
    except Exception as e:
        return {'error': f'Lỗi khi hủy link thanh toán: {str(e)}'}, 500