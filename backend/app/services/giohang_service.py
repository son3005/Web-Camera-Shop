# /backend/./services/giohang_service.py
from ..extensions import db
from sqlalchemy.orm import joinedload, selectinload, load_only
from typing import Dict, Any, List

# Import Models
from ..models.giohang_dathang import GioHang, ChiTietGioHang
from ..models.sanpham import BienTheSanPham, SanPham
from ..models.nguoidung import NguoiDung

# Import Schemas
from ..schemas.giohang_dathang import ChiTietGioHangCreate, ChiTietGioHangUpdate

# --- Định nghĩa lỗi nghiệp vụ ---

class ServiceError(Exception):
    """Lỗi nghiệp vụ chung"""
    pass

class VariantNotFound(ServiceError):
    """Không tìm thấy biến thể sản phẩm"""
    pass

class OutOfStockError(ServiceError):
    """Sản phẩm không đủ số lượng tồn kho"""
    pass

class CartItemNotFoundError(ServiceError):
    """Không tìm thấy sản phẩm trong giỏ hàng"""
    pass

class GioHangService:
    """
    Lớp Service chứa toàn bộ logic nghiệp vụ cho việc quản lý Giỏ hàng.
    Service không bao giờ gọi db.session.commit().
    """

    @staticmethod
    def get_cart_by_user_id(user_id: int, create_if_not_exist: bool = True) -> GioHang:
        """
        Lấy giỏ hàng cho người dùng (tải sẵn thông tin chi tiết).
        Nếu create_if_not_exist=True, sẽ tạo giỏ hàng mới nếu chưa có.
        """
        # Tải giỏ hàng, bao gồm các 'items' (ChiTietGioHang)
        # và lồng vào đó là 'bien_the' (BienTheSanPham)
        # và lồng vào đó là 'san_pham' (SanPham)
        # và lồng vào đó là 'hinh_anhs' (HinhAnhSanPham)
        # Đây là một query tối ưu để lấy tất cả data cần thiết cho trang giỏ hàng
        cart = GioHang.query.options(
            selectinload(GioHang.items).options(
                joinedload(ChiTietGioHang.bien_the).options(
                    joinedload(BienTheSanPham.san_pham).load_only(SanPham.id, SanPham.ten_san_pham, SanPham.slug), # Chỉ lấy 1 số trường của SanPham
                    joinedload(BienTheSanPham.hinh_anhs) # Lấy ảnh của biến thể
                )
            )
        ).filter_by(nguoi_dung_id=user_id).first()

        if not cart and create_if_not_exist:
            # Nếu người dùng chưa có giỏ hàng, tạo mới
            cart = GioHang(nguoi_dung_id=user_id)
            db.session.add(cart)
            # Không cần flush/commit, route sẽ làm việc đó
        
        return cart

    @staticmethod
    def add_item_to_cart(user_id: int, data: ChiTietGioHangCreate) -> GioHang:
        """
        Thêm một sản phẩm (biến thể) vào giỏ hàng.
        """
        cart = GioHangService.get_cart_by_user_id(user_id, create_if_not_exist=True)
        
        # 1. Kiểm tra biến thể có tồn tại và đủ hàng không
        variant = db.session.get(BienTheSanPham, data.bien_the_san_pham_id)
        if not variant:
            raise VariantNotFound("Sản phẩm không tồn tại.")
        if variant.so_luong_ton < data.so_luong:
            raise OutOfStockError(f"Sản phẩm chỉ còn {variant.so_luong_ton} chiếc.")

        # 2. Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        existing_item = ChiTietGioHang.query.filter_by(
            gio_hang_id=cart.id,
            bien_the_san_pham_id=data.bien_the_san_pham_id
        ).first()

        if existing_item:
            # Nếu đã có, cập nhật số lượng
            new_quantity = existing_item.so_luong + data.so_luong
            if variant.so_luong_ton < new_quantity:
                 raise OutOfStockError(f"Số lượng tối đa có thể mua là {variant.so_luong_ton}.")
            existing_item.so_luong = new_quantity
        else:
            # Nếu chưa có, tạo mới
            new_item = ChiTietGioHang(
                gio_hang_id=cart.id,
                bien_the_san_pham_id=data.bien_the_san_pham_id,
                so_luong=data.so_luong
            )
            db.session.add(new_item)

        # Trả về giỏ hàng (route sẽ commit)
        return cart


    @staticmethod
    def update_cart_item(user_id: int, item_id: int, data: ChiTietGioHangUpdate) -> GioHang:
        """
        Cập nhật số lượng của một item trong giỏ hàng.
        """
        cart = GioHangService.get_cart_by_user_id(user_id, create_if_not_exist=False)
        
        if not cart:
             raise CartItemNotFoundError("Không tìm thấy giỏ hàng.")

        item_to_update = db.session.get(ChiTietGioHang, item_id)
        
        # 1. Kiểm tra bảo mật: item này có thuộc giỏ hàng của user không?
        if not item_to_update or item_to_update.gio_hang_id != cart.id:
            raise CartItemNotFoundError("Sản phẩm không tìm thấy trong giỏ hàng.")
        
        # 2. Kiểm tra tồn kho
        variant = db.session.get(BienTheSanPham, item_to_update.bien_the_san_pham_id)
        if not variant:
            # Sản phẩm đã bị xóa khỏi hệ thống
            db.session.delete(item_to_update) # Xóa luôn khỏi giỏ hàng
            raise VariantNotFound("Sản phẩm không còn tồn tại và đã được xóa khỏi giỏ hàng.")
            
        if variant.so_luong_ton < data.so_luong:
            raise OutOfStockError(f"Sản phẩm chỉ còn {variant.so_luong_ton} chiếc.")

        # 3. Cập nhật số lượng
        item_to_update.so_luong = data.so_luong
        return cart

    @staticmethod
    def remove_item_from_cart(user_id: int, item_id: int) -> GioHang:
        """
        Xóa một item khỏi giỏ hàng.
        """
        cart = GioHangService.get_cart_by_user_id(user_id, create_if_not_exist=False)
        
        if not cart:
             raise CartItemNotFoundError("Không tìm thấy giỏ hàng.")
             
        item_to_delete = db.session.get(ChiTietGioHang, item_id)
        
        # 1. Kiểm tra bảo mật
        if not item_to_delete or item_to_delete.gio_hang_id != cart.id:
            raise CartItemNotFoundError("Sản phẩm không tìm thấy trong giỏ hàng.")
        
        # 2. Xóa item
        db.session.delete(item_to_delete)
        return cart