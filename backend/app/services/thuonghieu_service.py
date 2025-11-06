from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.sanpham import ThuongHieu, SanPham  # Thêm import SanPham
from ..schemas.sanpham import ThuongHieuCreate, ThuongHieuUpdate
from .cloudinary_service import delete_image_task

class ThuongHieuService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ThuongHieu]:
        """Lấy tất cả thương hiệu với phân trang"""
        return self.db.query(ThuongHieu).offset(skip).limit(limit).all()

    def get_by_id(self, thuong_hieu_id: int) -> Optional[ThuongHieu]:
        """Lấy thương hiệu theo ID"""
        return self.db.query(ThuongHieu).filter(ThuongHieu.id == thuong_hieu_id).first()

    def get_by_ma_thuong_hieu(self, ma_thuong_hieu: str) -> Optional[ThuongHieu]:
        """Lấy thương hiệu theo mã thương hiệu"""
        return self.db.query(ThuongHieu).filter(ThuongHieu.ma_thuong_hieu == ma_thuong_hieu).first()

    def create(self, thuong_hieu_data: ThuongHieuCreate) -> ThuongHieu:
        """Tạo mới thương hiệu"""
        # Kiểm tra mã thương hiệu đã tồn tại
        existing = self.get_by_ma_thuong_hieu(thuong_hieu_data.ma_thuong_hieu)
        if existing:
            raise ValueError(f"Mã thương hiệu {thuong_hieu_data.ma_thuong_hieu} đã tồn tại")

        db_thuong_hieu = ThuongHieu(
            ma_thuong_hieu=thuong_hieu_data.ma_thuong_hieu,
            ten_thuong_hieu=thuong_hieu_data.ten_thuong_hieu,
            logo_url=thuong_hieu_data.logo_url,
            public_id=thuong_hieu_data.public_id
        )
        
        self.db.add(db_thuong_hieu)
        self.db.commit()
        self.db.refresh(db_thuong_hieu)
        return db_thuong_hieu

    def update(self, thuong_hieu_id: int, thuong_hieu_data: ThuongHieuUpdate) -> Optional[ThuongHieu]:
        """Cập nhật thương hiệu"""
        db_thuong_hieu = self.get_by_id(thuong_hieu_id)
        if not db_thuong_hieu:
            return None

        update_data = thuong_hieu_data.model_dump(exclude_unset=True)
        
        # Kiểm tra mã thương hiệu mới không trùng
        if 'ma_thuong_hieu' in update_data:
            existing = self.get_by_ma_thuong_hieu(update_data['ma_thuong_hieu'])
            if existing and existing.id != thuong_hieu_id:
                raise ValueError(f"Mã thương hiệu {update_data['ma_thuong_hieu']} đã tồn tại")

        for field, value in update_data.items():
            setattr(db_thuong_hieu, field, value)

        self.db.commit()
        self.db.refresh(db_thuong_hieu)
        return db_thuong_hieu

    def delete(self, thuong_hieu_id: int) -> bool:
        """
        Xóa thương hiệu và logo trên Cloudinary nếu có
        CHỈ CHO PHÉP XÓA NẾU KHÔNG CÓ SẢN PHẨM NÀO SỬ DỤNG
        """
        db_thuong_hieu = self.get_by_id(thuong_hieu_id)
        if not db_thuong_hieu:
            return False

        # 🔒 KIỂM TRA XEM CÓ SẢN PHẨM NÀO ĐANG SỬ DỤNG THƯƠNG HIỆU NÀY KHÔNG
        san_pham_count = self.db.query(SanPham).filter(SanPham.thuong_hieu_id == thuong_hieu_id).count()
        if san_pham_count > 0:
            raise ValueError(
                f"Không thể xóa thương hiệu '{db_thuong_hieu.ten_thuong_hieu}' vì có {san_pham_count} sản phẩm đang sử dụng. "
                f"Hãy chuyển các sản phẩm sang thương hiệu khác trước khi xóa."
            )

        # Xóa logo trên Cloudinary nếu có
        if db_thuong_hieu.public_id:
            delete_image_task.delay(db_thuong_hieu.public_id)

        self.db.delete(db_thuong_hieu)
        self.db.commit()
        return True

    def count(self) -> int:
        """Đếm tổng số thương hiệu"""
        return self.db.query(ThuongHieu).count()

    def kiem_tra_su_dung(self, thuong_hieu_id: int) -> dict:
        """
        Kiểm tra xem thương hiệu có đang được sử dụng bởi sản phẩm nào không
        Trả về thông tin chi tiết về việc sử dụng
        """
        db_thuong_hieu = self.get_by_id(thuong_hieu_id)
        if not db_thuong_hieu:
            return {"dang_su_dung": False, "so_luong": 0, "thong_tin": []}

        # Lấy danh sách sản phẩm đang sử dụng thương hiệu này
        san_phams = self.db.query(SanPham).filter(SanPham.thuong_hieu_id == thuong_hieu_id).all()
        
        thong_tin_san_pham = []
        for sp in san_phams:
            thong_tin_san_pham.append({
                "id": sp.id,
                "ma_san_pham": sp.ma_san_pham,
                "ten_san_pham": sp.ten_san_pham
            })

        return {
            "dang_su_dung": len(san_phams) > 0,
            "so_luong": len(san_phams),
            "thong_tin": thong_tin_san_pham
        }