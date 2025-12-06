import redis
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from decimal import Decimal
import json
from ..models.enums import TrangThaiSanPhamEnum 
class KhoService:
    def __init__(self, redis_client, db):
        self.redis = redis_client
        self.db = db
    
    def kiem_tra_va_lock_so_luong(self, items: List[Dict]) -> tuple[bool, List[Dict], str]:
        """Kiểm tra số lượng tồn kho và lock số lượng trong 7 phút"""
        try:
            from ..models.sanpham import BienTheSanPham, SanPham
            
            items_with_details = []
            variant_ids = [item['id_bien_the'] for item in items]
            
            # Lấy thông tin biến thể từ database
            variants = BienTheSanPham.query.filter(
                BienTheSanPham.id.in_(variant_ids)
            ).join(SanPham).all()
            
            variant_map = {variant.id: variant for variant in variants}
            
            # Kiểm tra số lượng và lock
            for item in items:
                variant_id = item['id_bien_the']
                so_luong_yc = item['so_luong']
                
                if variant_id not in variant_map:
                    return False, [], f"Biến thể {variant_id} không tồn tại"
                
                variant = variant_map[variant_id]
                so_luong_toi_da = variant.so_luong_nhap - variant.so_luong_ban
                # Kiểm tra số lượng tồn kho
                if so_luong_toi_da < so_luong_yc:
                    return False, [], f"Sản phẩm {variant.san_pham.ten_san_pham} - {variant.ten_bien_the} chỉ còn {so_luong_toi_da} sản phẩm"
                
                # Kiểm tra trạng thái biến thể sản phẩm
                if variant.trang_thai_kich_hoat != TrangThaiSanPhamEnum.DANG_BAN:
                    return False, [], f"Sản phẩm {variant.san_pham.ten_san_pham} - {variant.ten_bien_the} hiện không được bán"
                
                # Lock số lượng trong Redis (7 phút)
                lock_key = f"lock:bienthe:{variant_id}"
                current_lock = self.redis.get(lock_key)
                locked_quantity = int(current_lock) if current_lock else 0
                available_quantity = variant.so_luong_nhap - variant.so_luong_ban - locked_quantity
                
                if available_quantity < so_luong_yc:
                    return False, [], f"Sản phẩm {variant.san_pham.ten_san_pham} tạm thời hết hàng"
                
                # Tăng lock số lượng
                new_locked = locked_quantity + so_luong_yc
                self.redis.setex(lock_key, 420, new_locked)  # 7 phút = 420 giây
                
                # Thêm thông tin chi tiết (bao gồm đơn giá)
                items_with_details.append({
                    'id_bien_the': variant_id,
                    'so_luong': so_luong_yc,
                    'ten_san_pham': variant.san_pham.ten_san_pham,
                    'ten_bien_the': variant.ten_bien_the,
                    'don_gia': variant.gia_ban,  # QUAN TRỌNG: thêm đơn giá
                    'hinh_anh': variant.hinh_anhs[0].url if variant.hinh_anhs else None,
                    'san_pham_id': variant.san_pham.id
                })
            
            return True, items_with_details, ""
            
        except Exception as e:
            return False, [], f"Lỗi kiểm tra kho: {str(e)}"
    
    def giai_phong_lock(self, items: List[Dict]):
        """Giải phóng lock số lượng"""
        for item in items:
            variant_id = item['id_bien_the']
            so_luong = item['so_luong']
            
            lock_key = f"lock:bienthe:{variant_id}"
            current_lock = self.redis.get(lock_key)
            
            if current_lock:
                new_locked = max(0, int(current_lock) - so_luong)
                if new_locked > 0:
                    self.redis.setex(lock_key, 420, new_locked)
                else:
                    self.redis.delete(lock_key)
    
    def cap_nhat_so_luong_khi_thanh_cong(self, items: List[Dict]):
        """Cập nhật số lượng tồn kho khi thanh toán thành công - CẬP NHẬT SỐ LƯỢNG BÁN"""
        from ..models.sanpham import BienTheSanPham
        from sqlalchemy import update
        
        try:
            # Sử dụng atomic update để tránh race condition
            for item in items:
                variant_id = item['id_bien_the']
                so_luong = item['so_luong']
                
                # Atomic update: tăng số lượng bán
                stmt = update(BienTheSanPham).where(
                    BienTheSanPham.id == variant_id
                ).values(so_luong_ban=BienTheSanPham.so_luong_ban + so_luong)
                self.db.session.execute(stmt)
                
                # Xóa lock trong Redis
                lock_key = f"lock:bienthe:{variant_id}"
                self.redis.delete(lock_key)
            
            self.db.session.commit()
            
        except Exception as e:
            self.db.session.rollback()
            raise e

    def cap_nhat_so_luong_khi_that_bai(self, items: List[Dict]):
        """Cập nhật số lượng khi thanh toán thất bại - TRỪ LẠI SỐ LƯỢNG ĐÃ BÁN"""
        from ..models.sanpham import BienTheSanPham
        from sqlalchemy import update
        
        try:
            for item in items:
                variant_id = item['id_bien_the']
                so_luong = item['so_luong']
                
                # Atomic update: giảm số lượng bán (trừ lại)
                stmt = update(BienTheSanPham).where(
                    BienTheSanPham.id == variant_id
                ).values(
                    so_luong_ban=BienTheSanPham.so_luong_ban - so_luong
                )
                self.db.session.execute(stmt)
                
                # Đảm bảo số lượng bán không âm
                variant = BienTheSanPham.query.get(variant_id)
                if variant and variant.so_luong_ban < 0:
                    variant.so_luong_ban = 0
                    self.db.session.add(variant)
            
            self.db.session.commit()
            
        except Exception as e:
            self.db.session.rollback()
            raise e
        
        
    def cap_nhat_so_luong_khi_huy_don(self, items: List[Dict]):
        """Cập nhật số lượng khi hủy đơn hàng - GIẢM SỐ LƯỢNG BÁN"""
        from ..models.sanpham import BienTheSanPham
        from flask import current_app as app
        
        try:
            app.logger.info(f"Bắt đầu cập nhật số lượng khi hủy đơn cho {len(items)} items")
            
            for item in items:
                variant_id = item['id_bien_the']
                so_luong = item['so_luong']
                
                app.logger.debug(f"Xử lý biến thể {variant_id}, số lượng: {so_luong}")
                
                # Cập nhật trong database - GIẢM SỐ LƯỢNG BÁN
                variant = BienTheSanPham.query.get(variant_id)
                if variant:
                    so_luong_ban_cu = variant.so_luong_ban
                    variant.so_luong_ban -= so_luong
                    # Đảm bảo số lượng bán không âm
                    if variant.so_luong_ban < 0:
                        variant.so_luong_ban = 0
                    
                    app.logger.debug(f"Biến thể {variant_id}: {so_luong_ban_cu} -> {variant.so_luong_ban}")
                    self.db.session.add(variant)
                else:
                    app.logger.warning(f"Không tìm thấy biến thể {variant_id}")
            
            # Commit một lần sau khi cập nhật tất cả
            self.db.session.commit()
            app.logger.info("Cập nhật số lượng khi hủy đơn thành công")
            
        except Exception as e:
            app.logger.error(f"Lỗi cập nhật số lượng khi hủy đơn: {str(e)}")
            self.db.session.rollback()
            raise e

class GiamSatDonHangService:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    def kiem_tra_hanh_vi_bat_thuong(self, user_id: int) -> tuple[bool, str]:
        """
        Kiểm tra nếu người dùng tạo quá 5 đơn hàng không thanh toán trong ngày
        
        Returns:
            tuple: (is_abnormal, message)
        """
        today = datetime.now().strftime("%Y-%m-%d")
        key = f"donhang_khong_thanhtoan:{user_id}:{today}"
        
        # Lấy số lần đã tạo đơn không thanh toán hôm nay
        count = self.redis.get(key)
        count_int = int(count) if count else 0
        
        if count_int >= 5:
            # Khóa tài khoản 1 ngày
            lock_key = f"lock_taikhoan:{user_id}"
            self.redis.setex(lock_key, 86400, "locked")  # 24 giờ
            return True, "Tài khoản tạm thời bị khóa do tạo quá nhiều đơn hàng không thanh toán"
        
        return False, ""
    
    def tang_dem_don_hang_khong_thanh_toan(self, user_id: int):
        """Tăng đếm số đơn hàng không thanh toán"""
        today = datetime.now().strftime("%Y-%m-%d")
        key = f"donhang_khong_thanhtoan:{user_id}:{today}"
        
        # Tăng counter, expire vào cuối ngày
        if not self.redis.exists(key):
            # Tính thời gian đến cuối ngày
            now = datetime.now()
            end_of_day = datetime(now.year, now.month, now.day, 23, 59, 59)
            ttl = int((end_of_day - now).total_seconds())
            self.redis.setex(key, ttl, 1)
        else:
            self.redis.incr(key)
    
    def kiem_tra_tai_khoan_bi_khoa(self, user_id: int) -> bool:
        """Kiểm tra xem tài khoản có bị khóa không"""
        lock_key = f"lock_taikhoan:{user_id}"
        return self.redis.exists(lock_key) > 0