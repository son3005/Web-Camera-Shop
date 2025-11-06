from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.sanpham import DanhMuc, SanPham  # Thêm import SanPham
from ..schemas.sanpham import DanhMucCreate, DanhMucUpdate

class DanhMucService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[DanhMuc]:
        """Lấy tất cả danh mục với phân trang"""
        return self.db.query(DanhMuc).offset(skip).limit(limit).all()

    def get_by_id(self, danh_muc_id: int) -> Optional[DanhMuc]:
        """Lấy danh mục theo ID"""
        return self.db.query(DanhMuc).filter(DanhMuc.id == danh_muc_id).first()

    def get_by_ma_danh_muc(self, ma_danh_muc: str) -> Optional[DanhMuc]:
        """Lấy danh mục theo mã danh mục"""
        return self.db.query(DanhMuc).filter(DanhMuc.ma_danh_muc == ma_danh_muc).first()

    def create(self, danh_muc_data: DanhMucCreate) -> DanhMuc:
        """Tạo mới danh mục"""
        # Kiểm tra mã danh mục đã tồn tại
        existing = self.get_by_ma_danh_muc(danh_muc_data.ma_danh_muc)
        if existing:
            raise ValueError(f"Mã danh mục {danh_muc_data.ma_danh_muc} đã tồn tại")

        db_danh_muc = DanhMuc(
            ma_danh_muc=danh_muc_data.ma_danh_muc,
            ten_danh_muc=danh_muc_data.ten_danh_muc
        )
        
        self.db.add(db_danh_muc)
        self.db.commit()
        self.db.refresh(db_danh_muc)
        return db_danh_muc

    def update(self, danh_muc_id: int, danh_muc_data: DanhMucUpdate) -> Optional[DanhMuc]:
        """Cập nhật danh mục"""
        db_danh_muc = self.get_by_id(danh_muc_id)
        if not db_danh_muc:
            return None

        update_data = danh_muc_data.model_dump(exclude_unset=True)
        
        # Kiểm tra mã danh mục mới không trùng
        if 'ma_danh_muc' in update_data:
            existing = self.get_by_ma_danh_muc(update_data['ma_danh_muc'])
            if existing and existing.id != danh_muc_id:
                raise ValueError(f"Mã danh mục {update_data['ma_danh_muc']} đã tồn tại")

        for field, value in update_data.items():
            setattr(db_danh_muc, field, value)

        self.db.commit()
        self.db.refresh(db_danh_muc)
        return db_danh_muc

    def delete(self, danh_muc_id: int) -> bool:
        """
        Xóa danh mục - CHỈ CHO PHÉP XÓA NẾU KHÔNG CÓ SẢN PHẨM NÀO SỬ DỤNG
        """
        db_danh_muc = self.get_by_id(danh_muc_id)
        if not db_danh_muc:
            return False

        # 🔒 KIỂM TRA XEM CÓ SẢN PHẨM NÀO ĐANG SỬ DỤNG DANH MỤC NÀY KHÔNG
        san_pham_count = self.db.query(SanPham).filter(SanPham.danh_muc_id == danh_muc_id).count()
        if san_pham_count > 0:
            raise ValueError(
                f"Không thể xóa danh mục '{db_danh_muc.ten_danh_muc}' vì có {san_pham_count} sản phẩm đang sử dụng. "
                f"Hãy chuyển các sản phẩm sang danh mục khác trước khi xóa."
            )

        self.db.delete(db_danh_muc)
        self.db.commit()
        return True

    def count(self) -> int:
        """Đếm tổng số danh mục"""
        return self.db.query(DanhMuc).count()

    def kiem_tra_su_dung(self, danh_muc_id: int) -> dict:
        """
        Kiểm tra xem danh mục có đang được sử dụng bởi sản phẩm nào không
        Trả về thông tin chi tiết về việc sử dụng
        """
        db_danh_muc = self.get_by_id(danh_muc_id)
        if not db_danh_muc:
            return {"dang_su_dung": False, "so_luong": 0, "thong_tin": []}

        # Lấy danh sách sản phẩm đang sử dụng danh mục này
        san_phams = self.db.query(SanPham).filter(SanPham.danh_muc_id == danh_muc_id).all()
        
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