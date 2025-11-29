from ..schemas.khac.AnhTrinhChieu import (
    AnhTrinhChieuCreate,
    AnhTrinhChieuUpdate,
    AnhTrinhChieuDelete,
    AnhTrinhChieuResponsePrivate,
    AnhTrinhChieuResponsePublic,
    DanhSachAnhTrinhChieuResponsePrivate,
    DanhSachAnhTrinhChieuResponsePublic
)
from ..models.khac.AnhTrinhChieu import AnhTrinhChieu
from ..extensions import db
from typing import List, Optional
from sqlalchemy.exc import SQLAlchemyError
from ..services.cloudinary_service import delete_image_task

class AnhTrinhChieuService:

    @staticmethod
    def get_anh_trinh_chieu_by_id(anh_trinh_chieu_id: int) -> Optional[AnhTrinhChieuResponsePrivate]:
        anh_trinh_chieu = AnhTrinhChieu.query.get(anh_trinh_chieu_id)
        if anh_trinh_chieu:
            return AnhTrinhChieuResponsePrivate.from_orm(anh_trinh_chieu)
        return None
    
    @staticmethod
    def get_all_anh_trinh_chieu_private() -> DanhSachAnhTrinhChieuResponsePrivate:
        anh_trinh_chieus = AnhTrinhChieu.query.all()
        response = DanhSachAnhTrinhChieuResponsePrivate(
            anh_trinh_chieus=[AnhTrinhChieuResponsePrivate.from_orm(atc) for atc in anh_trinh_chieus]
        )
        return response
    
    @staticmethod
    def get_all_anh_trinh_chieu_public() -> DanhSachAnhTrinhChieuResponsePublic:
        anh_trinh_chieus = AnhTrinhChieu.query.filter_by(trang_thai=True).all()
        response = DanhSachAnhTrinhChieuResponsePublic(
            anh_trinh_chieus=[AnhTrinhChieuResponsePublic.from_orm(atc) for atc in anh_trinh_chieus]
        )
        return response

    @staticmethod
    def create_anh_trinh_chieu(data: AnhTrinhChieuCreate) -> AnhTrinhChieuResponsePrivate:
        new_anh_trinh_chieu = AnhTrinhChieu(
            tieu_de=data.tieu_de,
            hinh_anh_url=data.hinh_anh_url,
            public_id=data.public_id,
            lien_ket=data.lien_ket,
            vi_tri=data.vi_tri,
            trang_thai=data.trang_thai
        )
        db.session.add(new_anh_trinh_chieu)
        db.session.commit()
        return AnhTrinhChieuResponsePrivate.from_orm(new_anh_trinh_chieu)
    
    @staticmethod
    def update_anh_trinh_chieu(anh_trinh_chieu_id: int, data: AnhTrinhChieuUpdate) -> Optional[AnhTrinhChieuResponsePrivate]:
        anh_trinh_chieu = AnhTrinhChieu.query.get(anh_trinh_chieu_id)
        if not anh_trinh_chieu:
            return None
        
        if data.tieu_de is not None:
            anh_trinh_chieu.tieu_de = data.tieu_de
        if data.lien_ket is not None:
            anh_trinh_chieu.lien_ket = data.lien_ket
        if data.vi_tri is not None:
            anh_trinh_chieu.vi_tri = data.vi_tri
        if data.trang_thai is not None:
            anh_trinh_chieu.trang_thai = data.trang_thai
        
        db.session.commit()
        return AnhTrinhChieuResponsePrivate.from_orm(anh_trinh_chieu)
    
    @staticmethod
    def delete_anh_trinh_chieu(data: AnhTrinhChieuDelete) -> bool:
        anh_trinh_chieu = AnhTrinhChieu.query.get(data.anh_trinh_chieu_id)
        if not anh_trinh_chieu:
            return False
        
        public_id = anh_trinh_chieu.public_id
        
        try:
            db.session.delete(anh_trinh_chieu)
            db.session.commit()
            # Xóa hình ảnh khỏi Cloudinary
            delete_image_task(public_id)
            
            return True
        except SQLAlchemyError:
            db.session.rollback()
            return False