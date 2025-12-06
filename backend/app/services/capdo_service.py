from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.sanpham import CapDo, SanPham  # Thêm import SanPham
from ..schemas.sanpham import CapDoCreate, CapDoUpdate

class CapDoService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[CapDo]:
        """
        Lấy tất cả cấp độ với phân trang
        """
        return self.db.query(CapDo).offset(skip).limit(limit).all()

    def get_by_id(self, cap_do_id: int) -> Optional[CapDo]:
        """
        Lấy cấp độ theo ID
        """
        return self.db.query(CapDo).filter(CapDo.id == cap_do_id).first()

    def get_by_ma_cap_do(self, ma_cap_do: str) -> Optional[CapDo]:
        """
        Lấy cấp độ theo mã cấp độ
        """
        return self.db.query(CapDo).filter(CapDo.ma_cap_do == ma_cap_do).first()

    def create(self, cap_do_data: CapDoCreate) -> CapDo:
        """
        Tạo mới cấp độ
        """
        # Kiểm tra mã cấp độ đã tồn tại chưa
        existing = self.get_by_ma_cap_do(cap_do_data.ma_cap_do)
        if existing:
            raise ValueError(f"Mã cấp độ {cap_do_data.ma_cap_do} đã tồn tại")

        db_cap_do = CapDo(
            ma_cap_do=cap_do_data.ma_cap_do,
            ten_cap_do=cap_do_data.ten_cap_do
        )
        
        self.db.add(db_cap_do)
        self.db.commit()
        self.db.refresh(db_cap_do)
        return db_cap_do

    def update(self, cap_do_id: int, cap_do_data: CapDoUpdate) -> Optional[CapDo]:
        """
        Cập nhật cấp độ
        """
        db_cap_do = self.get_by_id(cap_do_id)
        if not db_cap_do:
            return None

        update_data = cap_do_data.model_dump(exclude_unset=True)
        
        # Kiểm tra mã cấp độ mới không trùng với các bản ghi khác
        if 'ma_cap_do' in update_data:
            existing = self.get_by_ma_cap_do(update_data['ma_cap_do'])
            if existing and existing.id != cap_do_id:
                raise ValueError(f"Mã cấp độ {update_data['ma_cap_do']} đã tồn tại")

        for field, value in update_data.items():
            setattr(db_cap_do, field, value)

        self.db.commit()
        self.db.refresh(db_cap_do)
        return db_cap_do

    def delete(self, cap_do_id: int) -> bool:
        """
        Xóa cấp độ - CHỈ CHO PHÉP XÓA NẾU KHÔNG CÓ SẢN PHẨM NÀO SỬ DỤNG
        """
        db_cap_do = self.get_by_id(cap_do_id)
        if not db_cap_do:
            return False

        # 🔒 KIỂM TRA XEM CÓ SẢN PHẨM NÀO ĐANG SỬ DỤNG CẤP ĐỘ NÀY KHÔNG
        san_pham_count = self.db.query(SanPham).filter(SanPham.cap_do_id == cap_do_id).count()
        if san_pham_count > 0:
            raise ValueError(
                f"Không thể xóa cấp độ '{db_cap_do.ten_cap_do}' vì có {san_pham_count} sản phẩm đang sử dụng. "
                f"Hãy chuyển các sản phẩm sang cấp độ khác trước khi xóa."
            )

        self.db.delete(db_cap_do)
        self.db.commit()
        return True

    def count(self) -> int:
        """
        Đếm tổng số cấp độ
        """
        return self.db.query(CapDo).count()

    def kiem_tra_su_dung(self, cap_do_id: int) -> dict:
        """
        Kiểm tra xem cấp độ có đang được sử dụng bởi sản phẩm nào không
        Trả về thông tin chi tiết về việc sử dụng
        """
        db_cap_do = self.get_by_id(cap_do_id)
        if not db_cap_do:
            return {"dang_su_dung": False, "so_luong": 0, "thong_tin": []}

        # Lấy danh sách sản phẩm đang sử dụng cấp độ này
        san_phams = self.db.query(SanPham).filter(SanPham.cap_do_id == cap_do_id).all()
        
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