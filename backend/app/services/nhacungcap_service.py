from decimal import Decimal
from typing import List, Optional
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, extract, or_
from ..extensions import db
from ..models.phieunhap import NhaCungCap
from ..schemas.phieunhap import NhaCungCapCreate, NhaCungCapUpdate, NhaCungCapResponse, ListNhaCungCapResponse
from ..models.enums import TrangThaiNhaCungCapEnum
import uuid
import re
 
class NhaCungCapService:
    @staticmethod
    def remove_accents(input_str):
        """Chuyển chuỗi tiếng Việt có dấu thành không dấu - IMPROVED VERSION"""
        if not input_str:
            return ""
        
        # Mapping chi tiết các ký tự tiếng Việt
        vietnamese_map = {
            'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
            'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
            'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
            'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
            'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
            'đ': 'd',
            'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
            'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
            'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
            'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
            'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
            'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
            'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
            'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
            'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
            'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
            'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
            'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
            'Đ': 'D'
        }
        
        result = []
        for char in input_str:
            result.append(vietnamese_map.get(char, char))
        
        return ''.join(result)

    @staticmethod
    def normalize_search_term(term: str) -> str:
        """Chuẩn hóa từ khóa tìm kiếm: bỏ dấu và chuyển thành chữ thường"""
        if not term:
            return ""
        # Loại bỏ dấu và chuyển thành chữ thường
        normalized = NhaCungCapService.remove_accents(term).lower()
        # Loại bỏ các ký tự đặc biệt, chỉ giữ lại chữ cái, số và khoảng trắng
        normalized = re.sub(r'[^a-z0-9\s]', '', normalized)
        return normalized.strip()

    @staticmethod
    def tao_ma_nha_cung_cap(prefix: str = "NCC") -> str:
        """Tạo mã nhà cung cấp mới theo định dạng NCCxxxx"""
        unique_id = str(uuid.uuid4()).split('-')[0].upper()
        return f"{prefix}{unique_id}"[:12]
    
    @staticmethod
    def tao_nha_cung_cap(nha_cung_cap_data: NhaCungCapCreate) -> NhaCungCapResponse:
        """Tạo mới một nhà cung cấp"""
        ma_nha_cung_cap = NhaCungCapService.tao_ma_nha_cung_cap()
        new_nha_cung_cap = NhaCungCap(
            ma_nha_cung_cap=ma_nha_cung_cap,
            ten_nha_cung_cap=nha_cung_cap_data.ten_nha_cung_cap,
            dia_chi=nha_cung_cap_data.dia_chi,
            so_dien_thoai=nha_cung_cap_data.so_dien_thoai,
            email=nha_cung_cap_data.email,
            nguoi_dai_dien=nha_cung_cap_data.nguoi_dai_dien,
            tai_khoan_ngan_hang=nha_cung_cap_data.tai_khoan_ngan_hang,
            ten_ngan_hang=nha_cung_cap_data.ten_ngan_hang,
            trang_thai=nha_cung_cap_data.trang_thai,
            ghi_chu=nha_cung_cap_data.ghi_chu
        )
        db.session.add(new_nha_cung_cap)
        db.session.commit()
        db.session.refresh(new_nha_cung_cap)
        return NhaCungCapResponse.from_orm(new_nha_cung_cap)
    
    @staticmethod
    def cap_nhat_nha_cung_cap(id: int, nha_cung_cap_data: NhaCungCapUpdate) -> Optional[NhaCungCapResponse]:
        """Cập nhật thông tin nhà cung cấp"""
        nha_cung_cap = db.session.query(NhaCungCap).filter(NhaCungCap.id == id).first()
        if not nha_cung_cap:
            return None
        
        for field, value in nha_cung_cap_data.dict(exclude_unset=True).items():
            setattr(nha_cung_cap, field, value)
        
        db.session.commit()
        db.session.refresh(nha_cung_cap)
        return NhaCungCapResponse.from_orm(nha_cung_cap)
    
    @staticmethod
    def xoa_nha_cung_cap(id: int) -> tuple[bool, str]:
        """Xóa nhà cung cấp theo ID, trả về (thành_công, thông_báo)"""
        try:
            nha_cung_cap = db.session.query(NhaCungCap).filter(NhaCungCap.id == id).first()
            if not nha_cung_cap:
                return False, "Không tìm thấy nhà cung cấp"
            
            # Kiểm tra xem có phiếu nhập nào không
            from ..models.phieunhap import PhieuNhap
            count = db.session.query(PhieuNhap).filter(PhieuNhap.nha_cung_cap_id == id).count()
            
            if count > 0:
                # Có phiếu nhập, không thể xóa
                return False, "Không thể xóa nhà cung cấp vì có phiếu nhập liên quan"
            
            db.session.delete(nha_cung_cap)
            db.session.commit()
            return True, f"Xóa nhà cung cấp thành công - ID: {id} - Tên: {nha_cung_cap.ten_nha_cung_cap} - {count}"
        except Exception as e:
            db.session.rollback()
            error_msg = f"Lỗi khi xóa nhà cung cấp: {e}"
            print(error_msg)
            return False, error_msg
    
    @staticmethod
    def lay_danh_sach_nha_cung_cap(
        ten_nha_cung_cap: Optional[str] = None,
        so_dien_thoai: Optional[str] = None,
        email: Optional[str] = None,
        ma_nha_cung_cap: Optional[str] = None,
        nguoi_dai_dien: Optional[str] = None,
        trang_thai: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> ListNhaCungCapResponse:
        """
        Lấy danh sách nhà cung cấp với bộ lọc nâng cao
        """
        try:
            query = db.session.query(NhaCungCap)
            
            # Áp dụng các bộ lọc với hỗ trợ tìm kiếm không dấu
            if ten_nha_cung_cap:
                if ten_nha_cung_cap:
                    try:
                        query = query.filter(
                            db.text("MATCH(ten_nha_cung_cap) AGAINST (:term IN NATURAL LANGUAGE MODE)")
                        ).params(term=ten_nha_cung_cap)
                    except:
                        # Fallback to ilike search with normalization for Vietnamese
                        normalized_ten = NhaCungCapService.normalize_search_term(ten_nha_cung_cap)
                        query = query.filter(
                            or_(
                                NhaCungCap.ten_nha_cung_cap.ilike(f"%{ten_nha_cung_cap}%"),
                                NhaCungCap.ten_nha_cung_cap.ilike(f"%{normalized_ten}%")  # Tìm kiếm không dấu
                            )
                        )
            
            if so_dien_thoai:
                try:
                    query = query.filter(
                        db.text("MATCH(so_dien_thoai) AGAINST (:term IN NATURAL LANGUAGE MODE)")
                    ).params(term=so_dien_thoai)
                except:
                    query = query.filter(
                        NhaCungCap.so_dien_thoai.ilike(f"%{so_dien_thoai}%")
                    )
            
            if email:
                try:
                    query = query.filter(
                        db.text("MATCH(email) AGAINST (:term IN NATURAL LANGUAGE MODE)")
                    ).params(term=email)
                except:
                    normalized_email = NhaCungCapService.normalize_search_term(email)
                    query = query.filter(
                        or_(
                            NhaCungCap.email.ilike(f"%{email}%"),
                            NhaCungCap.email.ilike(f"%{normalized_email}%")  # Tìm kiếm không dấu
                        )
                    )
            
            if ma_nha_cung_cap:
                try:
                    query = query.filter(
                        db.text("MATCH(ma_nha_cung_cap) AGAINST (:term IN NATURAL LANGUAGE MODE)")
                    ).params(term=ma_nha_cung_cap)
                except:
                    normalized_ma = NhaCungCapService.normalize_search_term(ma_nha_cung_cap)
                    query = query.filter(
                        or_(
                            NhaCungCap.ma_nha_cung_cap.ilike(f"%{ma_nha_cung_cap}%"),
                            NhaCungCap.ma_nha_cung_cap.ilike(f"%{normalized_ma}%")  # Tìm kiếm không dấu
                        )
                    )
            
            if nguoi_dai_dien:
                try:
                    query = query.filter(
                        db.text("MATCH(nguoi_dai_dien) AGAINST (:term IN NATURAL LANGUAGE MODE)")
                    ).params(term=nguoi_dai_dien)
                except:
                    normalized_nguoi_dai_dien = NhaCungCapService.normalize_search_term(nguoi_dai_dien)
                    query = query.filter(
                        or_(
                            NhaCungCap.nguoi_dai_dien.ilike(f"%{nguoi_dai_dien}%"),
                            NhaCungCap.nguoi_dai_dien.ilike(f"%{normalized_nguoi_dai_dien}%")  # Tìm kiếm không dấu
                        )
                    )
            
            if trang_thai is not None:
                trang_thai_enum = TrangThaiNhaCungCapEnum.KICH_HOAT if trang_thai else TrangThaiNhaCungCapEnum.NGUNG_HOAT_DONG
                query = query.filter(NhaCungCap.trang_thai == trang_thai_enum)
            
            # Thực thi truy vấn với phân trang
            nha_cung_caps = query.order_by(NhaCungCap.ngay_tao.desc()).offset(skip).limit(limit).all()
            
            return ListNhaCungCapResponse(
                nha_cung_caps=[NhaCungCapResponse.from_orm(ncc) for ncc in nha_cung_caps]
            )
        except Exception as e:
            # Fallback: Lấy tất cả và lọc bằng Python nếu query thất bại
            print(f"Lỗi query database: {e}. Fallback sang lọc bằng Python.")
            return NhaCungCapService.tim_kiem_khong_dau(
                keyword=ten_nha_cung_cap or ma_nha_cung_cap or nguoi_dai_dien or email or "",
                trang_thai=trang_thai,
                skip=skip,
                limit=limit
            )
     
    @staticmethod
    def lay_nha_cung_cap_theo_id(id: int) -> Optional[NhaCungCapResponse]:
        """Lấy thông tin nhà cung cấp theo ID"""
        nha_cung_cap = db.session.query(NhaCungCap).filter(NhaCungCap.id == id).first()
        if not nha_cung_cap:
            return None
        return NhaCungCapResponse.from_orm(nha_cung_cap)
    
    @staticmethod
    def tim_kiem_nang_cao(
        keyword: Optional[str] = None,
        trang_thai: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> ListNhaCungCapResponse:
        """
        Tìm kiếm nâng cao nhà cung cấp sử dụng FULLTEXT search và hỗ trợ không dấu
        """
        query = db.session.query(NhaCungCap)
        
        # Tìm kiếm theo từ khóa sử dụng FULLTEXT index
        if keyword:
            normalized_keyword = NhaCungCapService.normalize_search_term(keyword)
            
            # Sử dụng FULLTEXT search nếu có
            try:
                query = query.filter(
                    db.text("MATCH(ten_nha_cung_cap, ma_nha_cung_cap, nguoi_dai_dien, email, dia_chi, so_dien_thoai) AGAINST (:keyword IN NATURAL LANGUAGE MODE)")
                ).params(keyword=keyword)
            except:
                # Fallback: tìm kiếm thông thường nếu FULLTEXT không khả dụng
                search_filter = or_(
                    NhaCungCap.ten_nha_cung_cap.ilike(f"%{keyword}%"),
                    NhaCungCap.ma_nha_cung_cap.ilike(f"%{keyword}%"),
                    NhaCungCap.nguoi_dai_dien.ilike(f"%{keyword}%"),
                    NhaCungCap.email.ilike(f"%{keyword}%"),
                    NhaCungCap.dia_chi.ilike(f"%{keyword}%"),
                    NhaCungCap.so_dien_thoai.ilike(f"%{keyword}%"),
                    # Tìm kiếm không dấu
                    db.func.lower(db.func.unaccent(NhaCungCap.ten_nha_cung_cap)).ilike(f"%{normalized_keyword}%"),
                    db.func.lower(db.func.unaccent(NhaCungCap.ma_nha_cung_cap)).ilike(f"%{normalized_keyword}%"),
                    db.func.lower(db.func.unaccent(NhaCungCap.nguoi_dai_dien)).ilike(f"%{normalized_keyword}%"),
                    db.func.lower(db.func.unaccent(NhaCungCap.email)).ilike(f"%{normalized_keyword}%"),
                    db.func.lower(db.func.unaccent(NhaCungCap.dia_chi)).ilike(f"%{normalized_keyword}%")
                )
                query = query.filter(search_filter)
        
        # Lọc theo trạng thái
        if trang_thai is not None:
            trang_thai_enum = TrangThaiNhaCungCapEnum.KICH_HOAT if trang_thai else TrangThaiNhaCungCapEnum.NGUNG_HOAT_DONG
            query = query.filter(NhaCungCap.trang_thai == trang_thai_enum)
        
        # Sắp xếp và phân trang
        nha_cung_caps = query.order_by(NhaCungCap.ngay_tao.desc()).offset(skip).limit(limit).all()
        
        return ListNhaCungCapResponse(
            nha_cung_caps=[NhaCungCapResponse.from_orm(ncc) for ncc in nha_cung_caps]
        )
    
    @staticmethod
    def tim_kiem_khong_dau(
        keyword: str,
        trang_thai: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> ListNhaCungCapResponse:
        """
        Tìm kiếm nhà cung cấp với hỗ trợ không dấu (dành cho trường hợp không có hàm unaccent trong database)
        """
        if not keyword:
            return NhaCungCapService.lay_danh_sach_nha_cung_cap(
                trang_thai=trang_thai, skip=skip, limit=limit
            )
        
        # Lấy tất cả nhà cung cấp và lọc bằng Python
        query = db.session.query(NhaCungCap)
        
        if trang_thai is not None:
            trang_thai_enum = TrangThaiNhaCungCapEnum.KICH_HOAT if trang_thai else TrangThaiNhaCungCapEnum.NGUNG_HOAT_DONG
            query = query.filter(NhaCungCap.trang_thai == trang_thai_enum)
        
        all_nha_cung_caps = query.order_by(NhaCungCap.ngay_tao.desc()).all()
        
        # Chuẩn hóa từ khóa tìm kiếm
        normalized_keyword = NhaCungCapService.normalize_search_term(keyword)
        
        # Lọc kết quả
        filtered_results = []
        for ncc in all_nha_cung_caps:
            # Chuẩn hóa các trường cần tìm kiếm
            fields_to_search = [
                ncc.ten_nha_cung_cap or "",
                ncc.ma_nha_cung_cap or "",
                ncc.nguoi_dai_dien or "",
                ncc.email or "",
                ncc.dia_chi or "",
                ncc.so_dien_thoai or ""
            ]
            
            # Kiểm tra xem từ khóa có xuất hiện trong bất kỳ trường nào (có hoặc không dấu)
            for field in fields_to_search:
                if keyword.lower() in field.lower():
                    filtered_results.append(ncc)
                    break
                elif normalized_keyword and normalized_keyword in NhaCungCapService.normalize_search_term(field):
                    filtered_results.append(ncc)
                    break
        
        # Áp dụng phân trang
        paginated_results = filtered_results[skip:skip + limit]
        
        return ListNhaCungCapResponse(
            nha_cung_caps=[NhaCungCapResponse.from_orm(ncc) for ncc in paginated_results]
        )

    @staticmethod
    def thay_doi_trang_thai_nha_cung_cap(id: int, kich_hoat: TrangThaiNhaCungCapEnum) -> Optional[NhaCungCapResponse]:
        """Thay đổi trạng thái nhà cung cấp (kích hoạt/ngừng hoạt động)"""
        nha_cung_cap = db.session.query(NhaCungCap).filter(NhaCungCap.id == id).first()
        if not nha_cung_cap:
            return None
        
        nha_cung_cap.trang_thai = kich_hoat
        
        db.session.commit()
        db.session.refresh(nha_cung_cap)
        return NhaCungCapResponse.from_orm(nha_cung_cap)