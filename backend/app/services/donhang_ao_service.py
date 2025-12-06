import random  # Sửa import này
import uuid
import time  # Thêm import
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from decimal import Decimal

from flask import json
from payos import PayOS, APIError
from payos.types import CreatePaymentLinkRequest  
from ..models.sanpham import SanPham, BienTheSanPham
from ..models.redis_models import DonHangAoResponse
from ..models.nguoidung.DiaChi import DiaChi
from ..services.kho_service import GiamSatDonHangService, KhoService


class DonHangAoService:
    def __init__(self, redis_client, payos_client: PayOS, db):
        self.redis = redis_client
        self.payos = payos_client
        self.db = db
        self.kho_service = KhoService(redis_client, db)
        self.giam_sat_service = GiamSatDonHangService(redis_client)
    
    def tao_don_hang_ao(self, don_hang_data: Dict[str, Any]) -> DonHangAoResponse:
        """Tạo đơn hàng ảo với đầy đủ validation"""
        try:
            user_id = don_hang_data.get('id_nguoi_dung')
            
            # Kiểm tra tài khoản có bị khóa không
            if user_id and self.giam_sat_service.kiem_tra_tai_khoan_bi_khoa(user_id):
                raise Exception("Tài khoản của bạn tạm thời bị khóa do tạo quá nhiều đơn hàng không thanh toán")
            
            # Kiểm tra hành vi bất thường
            if user_id:
                is_abnormal, message = self.giam_sat_service.kiem_tra_hanh_vi_bat_thuong(user_id)
                if is_abnormal:
                    raise Exception(message)
            
            # Kiểm tra địa chỉ có thuộc user không
            if don_hang_data.get('id_dia_chi') is not None and user_id:  
                try:
                    # Sử dụng self.db.session.query thay vì self.db.query
                    dia_chi = self.db.session.query(DiaChi).filter(
                        DiaChi.id == don_hang_data.get('id_dia_chi'),
                        DiaChi.nguoi_dung_id == user_id
                    ).first()
                    
                    if not dia_chi:
                        raise Exception("Địa chỉ giao hàng không thuộc về người dùng này")
                        
                except Exception as e:
                    raise Exception(f"Lỗi truy vấn địa chỉ: {str(e)}")
                

            # Kiểm tra và lock số lượng kho
            success, items_enriched, error_msg = self.kho_service.kiem_tra_va_lock_so_luong(
                don_hang_data['items']
            )
            
            if not success:
                raise Exception(error_msg)
            
            
            # Tạo ID đơn hàng ảo
            don_hang_ao_id = str(uuid.uuid4())
            thoi_gian_tao = datetime.now()
            thoi_gian_het_han = thoi_gian_tao + timedelta(minutes=7)
            url_success = don_hang_data.get("url_success","https://www.youtube.com/watch?v=NSU2hJ5wT08")
            url_cancel = don_hang_data.get("url_cancel","https://www.youtube.com/shorts/kVulfyOfx1g")

            # Tính tổng tiền từ items_enriched (đã có đơn giá)
            tong_tien = Decimal('0.0')
            for item in items_enriched:
                don_gia_item = Decimal(item['don_gia'])
                tong_tien += don_gia_item * item['so_luong']

            tong_tien += Decimal(str(don_hang_data.get('phi_van_chuyen', 2000)))
            
            # Tạo đối tượng đơn hàng ảo
            response_data = {
                "id": don_hang_ao_id,
                "thoi_gian_tao": thoi_gian_tao,
                "thoi_gian_het_han": thoi_gian_het_han,
                "tong_tien": tong_tien,
                "items_enriched": items_enriched,
                "id_nguoi_dung": user_id,
                "id_dia_chi": don_hang_data.get('id_dia_chi'),
                "ten_nguoi_nhan": don_hang_data['ten_nguoi_nhan'],
                "so_dien_thoai_nguoi_nhan": don_hang_data['so_dien_thoai_nguoi_nhan'],
                "dia_chi_giao": don_hang_data['dia_chi_giao'],
                "phuong_thuc_thanh_toan": don_hang_data['phuong_thuc_thanh_toan'],
                "phi_van_chuyen": Decimal(str(don_hang_data.get('phi_van_chuyen', 2000))),
                "ghi_chu": don_hang_data.get('ghi_chu'),
                "items": don_hang_data['items'],
                "gio_hang_id": don_hang_data.get('gio_hang_id', None)
            }
            
            don_hang_ao = DonHangAoResponse(**response_data)
            
            # Lưu vào Redis (7 phút)
            redis_key = f"donhang_ao:{don_hang_ao_id}"
            self.redis.setex(
                redis_key, 
                420,  # 7 phút
                don_hang_ao.model_dump_json()
            )
            
            # Xử lý thanh toán online nếu cần
            if don_hang_ao.phuong_thuc_thanh_toan != 'cod':
                payment_result = self.tao_payment_link(url_success,url_cancel,don_hang_ao)
                don_hang_ao.payment_url = payment_result.get('payment_url')
                don_hang_ao.ma_giao_dich_payos = str(payment_result.get('order_code'))
                
                # Cập nhật lại Redis với payment info
                self.redis.setex(
                    redis_key, 
                    420,
                    don_hang_ao.model_dump_json()
                )
            
            return don_hang_ao
            
        except Exception as e:
            # Giải phóng lock nếu có lỗi
            if 'items_enriched' in locals():
                self.kho_service.giai_phong_lock(items_enriched)
            raise e
    
    def lay_don_hang_ao(self, don_hang_ao_id: str) -> Optional[DonHangAoResponse]:
        """Lấy đơn hàng ảo từ Redis"""
        try:
            redis_key = f"donhang_ao:{don_hang_ao_id}"
            data_str = self.redis.get(redis_key)
            if data_str:
                data = json.loads(data_str)
                return DonHangAoResponse(**data)
            return None
        except Exception as e:
            print(f"Lỗi lấy đơn hàng ảo: {str(e)}")
            return None

    def xoa_don_hang_ao(self, don_hang_ao_id: str):
        """Xóa đơn hàng ảo khỏi Redis"""
        redis_key = f"donhang_ao:{don_hang_ao_id}"
        self.redis.delete(redis_key)
        
    def tao_order_code(self) -> int:
        """Tạo order code duy nhất cho PayOS"""
        timestamp = int(time.time())
        random_part = random.randint(1000, 9999)
        return timestamp * 10000 + random_part
    
    def tao_payment_link(self,url_success : str, url_cancel:str, don_hang_ao: DonHangAoResponse) -> Dict[str, Any]:

        """Tạo payment link từ PayOS với SDK mới"""
        try:
            # Tạo order code duy nhất
            order_code = self.tao_order_code()
            description = f"DH{order_code}" 
            # Chuẩn bị dữ liệu thanh toán theo đúng format SDK 
            payment_data = CreatePaymentLinkRequest(
                order_code=order_code,
                amount=int(don_hang_ao.tong_tien),
                description=description,
                cancel_url= str(url_cancel),
                return_url=str(url_success),
            )
            
            # Gọi API PayOS để tạo payment link
            response = self.payos.payment_requests.create(payment_data=payment_data)
            
            return {
                "payment_url": response.checkout_url,
                "order_code": order_code,
                "transaction_code": getattr(response, 'transaction_code', None)
            }
            
        except APIError as e:
            raise Exception(f"Lỗi PayOS: {e.error_desc} (Code: {e.error_code})")
        except Exception as e:
            raise Exception(f"Lỗi tạo payment link: {str(e)}")
        
    def xu_ly_thanh_toan_that_bai(self, don_hang_ao_id: str):
        """Xử lý khi thanh toán thất bại - CHỈ GIẢI PHÓNG LOCK (vì chưa cộng số lượng bán)"""
        don_hang_ao = self.lay_don_hang_ao(don_hang_ao_id)
        if don_hang_ao:
            try:
                # 🔴 QUAN TRỌNG: Đơn hàng ảo CHƯA cập nhật số lượng bán 
                # nên chỉ cần giải phóng lock, KHÔNG trừ số lượng
                self.kho_service.giai_phong_lock(don_hang_ao.items_enriched)
                
                # Tăng đếm đơn hàng không thanh toán
                if don_hang_ao.id_nguoi_dung:
                    self.giam_sat_service.tang_dem_don_hang_khong_thanh_toan(don_hang_ao.id_nguoi_dung)
                
                # Xóa khỏi Redis
                self.xoa_don_hang_ao(don_hang_ao_id)
                
            except Exception as e:
                print(f"Lỗi xử lý thanh toán thất bại: {str(e)}")
                # Vẫn phải giải phóng lock dù có lỗi
                self.kho_service.giai_phong_lock(don_hang_ao.items_enriched)