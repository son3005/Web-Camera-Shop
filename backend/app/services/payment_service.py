# /backend/app/services/payment_service.py
from asyncio.log import logger
import hmac
import hashlib
import json
from typing import Optional, Dict, Any
from decimal import Decimal

from payos import PayOS
from ..extensions import db
from ..models import ThanhToan, DonHang, BienTheSanPham
from ..models.enums import TrangThaiThanhToanEnum, TrangThaiDonHangEnum

class PaymentService:
    def __init__(self, payos_client: PayOS):
        self.payos = payos_client

    def create_payment_link(self, thanh_toan: ThanhToan, cancel_url: str, return_url: str) -> Dict[str, Any]:
        """Tạo link thanh toán từ PayOS"""
        
        # Lấy thông tin đơn hàng
        don_hang = thanh_toan.don_hang
        
        # Tạo items từ chi tiết đơn hàng
        items = []
        for item in don_hang.items:
            items.append({
                "name": item.ten_san_pham_luc_mua,
                "quantity": item.so_luong,
                "price": int(float(item.don_gia_luc_mua) * 100)  # Chuyển sang VND (integer)
            })
        
        # Thêm phí vận chuyển nếu có
        if don_hang.phi_van_chuyen and float(don_hang.phi_van_chuyen) >= 0:
            items.append({
                "name": "Phí vận chuyển",
                "quantity": 1,
                "price": int(float(don_hang.phi_van_chuyen) * 100)
            })
        
        order_code = int(thanh_toan.id)  # Dùng ID thanh toán làm order code cho PayOS
        
        payment_data = {
            "orderCode": order_code,
            "amount": int(float(thanh_toan.so_tien) * 100),  # Chuyển sang VND (integer)
            "description": f"Thanh toán đơn hàng {don_hang.ma_don_hang}",
            "items": items,
            "cancelUrl": cancel_url,
            "returnUrl": return_url
        }
        
        # Gọi API PayOS để tạo link thanh toán
        response = self.payos.createPaymentLink(payment_data)
        
        # Lưu mã giao dịch (paymentLinkId) vào thanh toán
        thanh_toan.ma_giao_dich_ben_thu_3 = response.get('paymentLinkId')
        db.session.commit()
        
        return response

    def verify_webhook_signature(self, webhook_body: str, signature: str) -> bool:
        """Xác thực chữ ký webhook từ PayOS"""
        # Tính toán signature từ webhook_body và checksum key
        computed_signature = hmac.new(
            self.payos.checksum_key.encode(),
            webhook_body.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return computed_signature == signature

    def handle_payment_webhook(self, webhook_data: Dict[str, Any]) -> bool:
        """Xử lý webhook thanh toán từ PayOS"""
        order_code = webhook_data.get('orderCode')
        code = webhook_data.get('code')
        
        # Tìm thanh toán theo order_code
        thanh_toan = db.session.query(ThanhToan).get(order_code)
        if not thanh_toan:
            return False
        
        if code == '00':  # Thành công
            # XÁC NHẬN ĐƠN HÀNG - chỉ trừ tồn kho lúc này
            try:
                with db.session.begin():
                    thanh_toan.trang_thai = TrangThaiThanhToanEnum.DA_THANH_TOAN
                    thanh_toan.don_hang.trang_thai = TrangThaiDonHangEnum.DA_XAC_NHAN
                    thanh_toan.ma_giao_dich_ben_thu_3 = webhook_data.get('paymentLinkId')
                    
                    # Đảm bảo tồn kho chỉ bị trừ khi thanh toán thành công
                    for item in thanh_toan.don_hang.items:
                        if item.bien_the_san_pham:
                            item.bien_the_san_pham.so_luong -= item.so_luong
                            
                return True
                
            except Exception as e:
                logger.error(f"Lỗi xác nhận đơn hàng sau thanh toán: {str(e)}")
                return False
        else:
            # Thanh toán thất bại - KHÔNG trừ tồn kho
            thanh_toan.trang_thai = TrangThaiThanhToanEnum.THAT_BAI
            thanh_toan.don_hang.trang_thai = TrangThaiDonHangEnum.DA_HUY
            db.session.commit()
            return True