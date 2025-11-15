from sqlalchemy.orm import Session
from sqlalchemy import and_
from decimal import Decimal
from typing import List, Optional
from ..models import GioHang, ChiTietGioHang, BienTheSanPham, NguoiDung
from ..schemas.giohang_dathang import GioHangPublic
from ..schemas.giohang_dathang import ChiTietGioHangResponse


class GioHangService:
    def __init__(self, db: Session):
        self.db = db

    def get_gio_hang_by_user_id(self, nguoi_dung_id: int) -> Optional[GioHang]:
        """Lấy giỏ hàng của người dùng"""
        return self.db.query(GioHang).filter(
            GioHang.nguoi_dung_id == nguoi_dung_id
        ).first()

    def create_gio_hang(self, nguoi_dung_id: int) -> GioHang:
        """Tạo giỏ hàng mới cho người dùng"""
        gio_hang = GioHang(nguoi_dung_id=nguoi_dung_id)
        self.db.add(gio_hang)
        self.db.commit()
        self.db.refresh(gio_hang)
        return gio_hang

    def get_or_create_gio_hang(self, nguoi_dung_id: int) -> GioHang:
        """Lấy hoặc tạo giỏ hàng nếu chưa có"""
        gio_hang = self.get_gio_hang_by_user_id(nguoi_dung_id)
        if not gio_hang:
            gio_hang = self.create_gio_hang(nguoi_dung_id)
        return gio_hang

    def get_chi_tiet_gio_hang(self, gio_hang_id: int, bien_the_san_pham_id: int) -> Optional[ChiTietGioHang]:
        """Lấy chi tiết giỏ hàng theo biến thể sản phẩm"""
        return self.db.query(ChiTietGioHang).filter(
            and_(
                ChiTietGioHang.gio_hang_id == gio_hang_id,
                ChiTietGioHang.bien_the_san_pham_id == bien_the_san_pham_id
            )
        ).first()

    def kiem_tra_so_luong_ton_kho(self, bien_the_san_pham_id: int, so_luong_muon_them: int, so_luong_hien_co_trong_gio: int = 0) -> bool:
        """Kiểm tra số lượng tồn kho có đủ không, tính cả số lượng hiện có trong giỏ"""
        bien_the = self.db.query(BienTheSanPham).filter(
            BienTheSanPham.id == bien_the_san_pham_id
        ).first()
        
        if not bien_the:
            print(f"❌ Biến thể {bien_the_san_pham_id} không tồn tại")
            return False
        
        # Tổng số lượng sẽ có trong giỏ sau khi thêm
        tong_so_luong_sau_khi_them = so_luong_hien_co_trong_gio + so_luong_muon_them
        
        print(f"🔍 Kiểm tra tồn kho:")
        print(f"   - Biến thể: {bien_the_san_pham_id}")
        print(f"   - Tồn kho hiện có: {bien_the.so_luong_nhap - bien_the.so_luong_ban}")
        print(f"   - Số lượng hiện có trong giỏ: {so_luong_hien_co_trong_gio}")
        print(f"   - Số lượng muốn thêm: {so_luong_muon_them}")
        print(f"   - Tổng số lượng sau khi thêm: {tong_so_luong_sau_khi_them}")
        print(f"   - Kết quả: {bien_the.so_luong_nhap - bien_the.so_luong_ban >= tong_so_luong_sau_khi_them}")
        
        return bien_the.so_luong_nhap - bien_the.so_luong_ban >= tong_so_luong_sau_khi_them

    def them_san_pham_vao_gio_hang(
        self, 
        nguoi_dung_id: int, 
        bien_the_san_pham_id: int, 
        so_luong: int
    ) -> ChiTietGioHang:
        """Thêm sản phẩm vào giỏ hàng (cộng dồn nếu đã tồn tại)"""
        
        # Lấy hoặc tạo giỏ hàng
        gio_hang = self.get_or_create_gio_hang(nguoi_dung_id)
        
        # Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        chi_tiet_gio_hang = self.get_chi_tiet_gio_hang(gio_hang.id, bien_the_san_pham_id)
        
        so_luong_hien_co_trong_gio = chi_tiet_gio_hang.so_luong if chi_tiet_gio_hang else 0
        
        # Kiểm tra số lượng tồn kho (tính cả số lượng hiện có trong giỏ)
        if not self.kiem_tra_so_luong_ton_kho(
            bien_the_san_pham_id, 
            so_luong, 
            so_luong_hien_co_trong_gio
        ):
            raise ValueError(f"Số lượng sản phẩm trong kho không đủ. Tồn kho hiện có: {self.get_ton_kho(bien_the_san_pham_id)}, số lượng trong giỏ: {so_luong_hien_co_trong_gio}, số lượng muốn thêm: {so_luong}")
        
        if chi_tiet_gio_hang:
            # Nếu đã có, cộng dồn số lượng
            so_luong_moi = chi_tiet_gio_hang.so_luong + so_luong
            chi_tiet_gio_hang.so_luong = so_luong_moi
        else:
            # Nếu chưa có, tạo mới
            chi_tiet_gio_hang = ChiTietGioHang(
                gio_hang_id=gio_hang.id,
                bien_the_san_pham_id=bien_the_san_pham_id,
                so_luong=so_luong
            )
            self.db.add(chi_tiet_gio_hang)
        
        self.db.commit()
        self.db.refresh(chi_tiet_gio_hang)
        return chi_tiet_gio_hang

    def cap_nhat_so_luong(
        self,
        chi_tiet_gio_hang_id: int,
        so_luong_moi: int,
        nguoi_dung_id: int
    ) -> ChiTietGioHang:
        """Cập nhật số lượng sản phẩm trong giỏ hàng - CHỈ cho phép cập nhật của chính mình"""
        print(f"🔐 Kiểm tra quyền cập nhật:")
        print(f"   - Người dùng ID: {nguoi_dung_id}")
        print(f"   - Chi tiết giỏ hàng ID: {chi_tiet_gio_hang_id}")

        if so_luong_moi < 1:
            raise ValueError("Số lượng phải lớn hơn hoặc bằng 1")

        chi_tiet_gio_hang = self.db.query(ChiTietGioHang).join(GioHang).filter(
            ChiTietGioHang.id == chi_tiet_gio_hang_id,
            GioHang.nguoi_dung_id == nguoi_dung_id
        ).first()

        if not chi_tiet_gio_hang:
            raise ValueError("Chi tiết giỏ hàng không tồn tại hoặc bạn không có quyền cập nhật")

        bien_the = self.db.query(BienTheSanPham).filter(
            BienTheSanPham.id == chi_tiet_gio_hang.bien_the_san_pham_id
        ).first()

        if not bien_the:
            raise ValueError("Biến thể sản phẩm không tồn tại")

        print(f"🔍 Kiểm tra cập nhật số lượng:")
        print(f"   - Chi tiết giỏ hàng ID: {chi_tiet_gio_hang_id}")
        print(f"   - Biến thể ID: {bien_the.id}")
        print(f"   - Tồn kho: {bien_the.so_luong_nhap - bien_the.so_luong_ban}")
        print(f"   - Số lượng hiện tại trong giỏ: {chi_tiet_gio_hang.so_luong}")
        print(f"   - Số lượng mới yêu cầu: {so_luong_moi}")

        if so_luong_moi > bien_the.so_luong_nhap - bien_the.so_luong_ban:
            raise ValueError(f"Số lượng yêu cầu ({so_luong_moi}) vượt quá tồn kho hiện có ({bien_the.so_luong_nhap - bien_the.so_luong_ban})")

        if chi_tiet_gio_hang.so_luong == so_luong_moi:
            print("⚠️  Số lượng không thay đổi")
            return chi_tiet_gio_hang

        old_so_luong = chi_tiet_gio_hang.so_luong
        chi_tiet_gio_hang.so_luong = so_luong_moi
        self.db.commit()
        self.db.refresh(chi_tiet_gio_hang)

        print(f"✅ Đã cập nhật số lượng từ {old_so_luong} thành {so_luong_moi}")

        return chi_tiet_gio_hang

    def xoa_san_pham_khoi_gio_hang(self, chi_tiet_gio_hang_id: int, nguoi_dung_id: int) -> bool:
        """Xóa sản phẩm khỏi giỏ hàng - CHỈ cho phép xóa của chính mình"""
        print(f"🔐 Kiểm tra quyền xóa:")
        print(f"   - Người dùng ID: {nguoi_dung_id}")
        print(f"   - Chi tiết giỏ hàng ID: {chi_tiet_gio_hang_id}")
        
        # Lấy chi tiết giỏ hàng và kiểm tra quyền sở hữu
        chi_tiet_gio_hang = self.db.query(ChiTietGioHang).join(GioHang).filter(
            ChiTietGioHang.id == chi_tiet_gio_hang_id,
            GioHang.nguoi_dung_id == nguoi_dung_id  # CHỈ cho phép xóa của chính mình
        ).first()
        
        if not chi_tiet_gio_hang:
            print(f"❌ Không tìm thấy chi tiết giỏ hàng hoặc không có quyền xóa")
            raise ValueError("Chi tiết giỏ hàng không tồn tại hoặc bạn không có quyền xóa")
        
        print(f"✅ Có quyền xóa - đang xóa chi tiết giỏ hàng ID: {chi_tiet_gio_hang_id}")
        
        self.db.delete(chi_tiet_gio_hang)
        self.db.commit()
        return True

    def get_ton_kho(self, bien_the_san_pham_id: int) -> int:
        """Lấy số lượng tồn kho của biến thể"""
        bien_the = self.db.query(BienTheSanPham).filter(
            BienTheSanPham.id == bien_the_san_pham_id
        ).first()
        return bien_the.so_luong if bien_the else 0

    def get_gio_hang_public(self, nguoi_dung_id: int) -> GioHangPublic:
        """Lấy thông tin giỏ hàng đầy đủ với tính toán tổng tiền"""
        gio_hang = self.get_or_create_gio_hang(nguoi_dung_id)
        
        # Lấy tất cả chi tiết giỏ hàng với thông tin biến thể sản phẩm
        chi_tiet_gio_hangs = self.db.query(ChiTietGioHang).filter(
            ChiTietGioHang.gio_hang_id == gio_hang.id
        ).all()
        
        items_response = []
        tong_so_luong = 0
        tong_gia_tri = Decimal('0')
        
        for chi_tiet in chi_tiet_gio_hangs:
            bien_the = chi_tiet.bien_the_san_pham
            
            # Tạo response với thông tin đầy đủ
            item_response = ChiTietGioHangResponse(
                id=chi_tiet.id,
                gio_hang_id=chi_tiet.gio_hang_id,
                bien_the_san_pham_id=chi_tiet.bien_the_san_pham_id,
                so_luong=chi_tiet.so_luong,
                ngay_them=chi_tiet.ngay_them,
                # Thêm thông tin từ biến thể sản phẩm
                ten_san_pham=bien_the.san_pham.ten_san_pham,
                ten_bien_the=bien_the.ten_bien_the,
                don_gia=bien_the.gia_ban,  # Giá hiện tại
                thanh_tien=chi_tiet.so_luong * bien_the.gia_ban,  # Tổng tiền = số lượng × đơn giá
                hinh_anh=bien_the.hinh_anhs[0].url if bien_the.hinh_anhs else None
            )
            
            items_response.append(item_response)
            tong_so_luong += chi_tiet.so_luong
            tong_gia_tri += item_response.thanh_tien
        
        return GioHangPublic(
            id=gio_hang.id,
            nguoi_dung_id=gio_hang.nguoi_dung_id,
            items=items_response,
            tong_so_luong=tong_so_luong,
            tong_gia_tri=tong_gia_tri
        )