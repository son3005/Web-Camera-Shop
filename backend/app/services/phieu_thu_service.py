from decimal import Decimal
from typing import List, Optional
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, extract
from ..extensions import db
from ..models.phieuthu import PhieuThu, ChiTietPhieuThu
from ..models.sanpham import BienTheSanPham, SanPham
from ..schemas.phieuthu import PhieuThuCreate, PhieuThuUpdate, ChiTietPhieuThuCreate, ChiTietPhieuThuUpdate, ChiTietPhieuThuResponse, PhieuThuResponse


class PhieuThuService:
    """
    Service xử lý nghiệp vụ Phiếu Thu
    - Tạo phiếu thu và cộng dồn số lượng biến thể
    - Cập nhật phiếu thu và điều chỉnh số lượng biến thể
    - Xử lý thay đổi biến thể sản phẩm
    """
    
    @staticmethod
    def generate_ma_phieu_thu() -> str:
        """Tạo mã phiếu thu tự động (PT + timestamp)"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"PT{timestamp}"
    
    @staticmethod
    def _cap_nhat_so_luong_bien_the(
        bien_the_id: int, 
        so_luong_thay_doi: int, 
        session: Session
    ):
        """
        Cập nhật số lượng biến thể sản phẩm
        Args:
            bien_the_id: ID biến thể cần cập nhật
            so_luong_thay_doi: Số lượng thay đổi (dương = cộng, âm = trừ)
            session: Database session
        """
        if not bien_the_id:
            raise ValueError("bien_the_id không được để trống")
            
        bien_the = session.query(BienTheSanPham).filter_by(id=bien_the_id).first()
        if not bien_the:
            raise ValueError(f"Biến thể sản phẩm với ID {bien_the_id} không tồn tại")
        
        # Tính toán số lượng mới
        so_luong_moi = (bien_the.so_luong or 0) + so_luong_thay_doi
        
        # Kiểm tra số lượng không âm
        if so_luong_moi < 0:
            raise ValueError(f"Số lượng biến thể {bien_the_id} không thể âm: {so_luong_moi}")
        
        # Cập nhật số lượng
        bien_the.so_luong = so_luong_moi
        session.add(bien_the)
    
    @staticmethod
    def _chuan_hoa_thoi_gian_loc(
        ngay_bat_dau: Optional[str],
        ngay_ket_thuc: Optional[str]
    ) -> tuple[Optional[datetime], Optional[datetime]]:
        """
        Chuẩn hóa thời gian lọc từ string sang datetime
        """
        start_datetime = None
        end_datetime = None
        
        if ngay_bat_dau:
            try:
                start_date = datetime.strptime(ngay_bat_dau, "%Y-%m-%d").date()
                start_datetime = datetime.combine(start_date, datetime.min.time())
            except ValueError:
                raise ValueError("Định dạng ngày bắt đầu không hợp lệ. Sử dụng YYYY-MM-DD")
        
        if ngay_ket_thuc:
            try:
                end_date = datetime.strptime(ngay_ket_thuc, "%Y-%m-%d").date()
                end_datetime = datetime.combine(end_date, datetime.max.time())
            except ValueError:
                raise ValueError("Định dạng ngày kết thúc không hợp lệ. Sử dụng YYYY-MM-DD")
        
        if start_datetime and end_datetime and start_datetime > end_datetime:
            raise ValueError("Ngày bắt đầu không được lớn hơn ngày kết thúc")
        
        return start_datetime, end_datetime
    
    @staticmethod
    def _lay_thong_tin_san_pham_cho_chi_tiet(chi_tiet: ChiTietPhieuThu) -> dict:
        """
        Lấy thông tin sản phẩm và biến thể cho chi tiết phiếu thu
        """
        if not chi_tiet.bien_the_san_pham_id:
            return {
                'ten_san_pham': None,
                'ten_bien_the': None,
                'ma_san_pham': None,
                'anh_dai_dien': None
            }
        
        try:
            bien_the = db.session.query(BienTheSanPham).\
                join(SanPham, BienTheSanPham.san_pham_id == SanPham.id).\
                options(joinedload(BienTheSanPham.san_pham)).\
                filter(BienTheSanPham.id == chi_tiet.bien_the_san_pham_id).first()
            
            if not bien_the or not bien_the.san_pham:
                return {
                    'ten_san_pham': "Sản phẩm không tồn tại",
                    'ten_bien_the': "Biến thể không tồn tại",
                    'ma_san_pham': "N/A",
                    'anh_dai_dien': None
                }
            
            anh_dai_dien = None
            if bien_the.hinh_anhs and len(bien_the.hinh_anhs) > 0:
                anh_dai_dien_obj = next((ha for ha in bien_the.hinh_anhs if ha.la_anh_dai_dien), 
                                      bien_the.hinh_anhs[0] if bien_the.hinh_anhs else None)
                if anh_dai_dien_obj:
                    anh_dai_dien = anh_dai_dien_obj.url
            
            return {
                'ten_san_pham': bien_the.san_pham.ten_san_pham,
                'ten_bien_the': bien_the.ten_bien_the,
                'ma_san_pham': bien_the.san_pham.ma_san_pham,
                'anh_dai_dien': anh_dai_dien
            }
        except Exception as e:
            print(f"Lỗi khi lấy thông tin sản phẩm: {e}")
            return {
                'ten_san_pham': None,
                'ten_bien_the': None,
                'ma_san_pham': None,
                'anh_dai_dien': None
            }
    
    @staticmethod
    def _tinh_tong_so_luong_va_gia_tri(chi_tiet_phieu_thus: List[ChiTietPhieuThu]) -> tuple[int, Decimal]:
        """
        Tính tổng số lượng và tổng giá trị từ danh sách chi tiết phiếu thu
        """
        tong_so_luong = 0
        tong_gia_tri = Decimal('0')
        
        for chi_tiet in chi_tiet_phieu_thus:
            tong_so_luong += chi_tiet.so_luong
            tong_gia_tri += chi_tiet.so_luong * chi_tiet.gia_nhap_tung_vat
        
        return tong_so_luong, tong_gia_tri
    
    @staticmethod
    def chuyen_doi_phieu_thu_sang_response(phieu_thu: PhieuThu) -> PhieuThuResponse:
        """
        Chuyển đổi model PhieuThu sang schema PhieuThuResponse
        với đầy đủ thông tin sản phẩm và biến thể
        """
        chi_tiet_responses = []
        for chi_tiet in phieu_thu.chi_tiet_phieu_thus:
            thong_tin_san_pham = PhieuThuService._lay_thong_tin_san_pham_cho_chi_tiet(chi_tiet)
            
            chi_tiet_response = ChiTietPhieuThuResponse(
                id=chi_tiet.id,
                phieu_thu_id=chi_tiet.phieu_thu_id,
                bien_the_san_pham_id=chi_tiet.bien_the_san_pham_id,
                so_luong=chi_tiet.so_luong,
                gia_nhap_tung_vat=chi_tiet.gia_nhap_tung_vat,
                ngay_cap_nhat=chi_tiet.ngay_cap_nhat,
                **thong_tin_san_pham
            )
            chi_tiet_responses.append(chi_tiet_response)
        
        tong_so_luong, tong_gia_tri = PhieuThuService._tinh_tong_so_luong_va_gia_tri(phieu_thu.chi_tiet_phieu_thus)
        
        phieu_thu_response = PhieuThuResponse(
            id=phieu_thu.id,
            ma_phieu_thu=phieu_thu.ma_phieu_thu,
            ten_nha_cung_cap=phieu_thu.ten_nha_cung_cap,
            nguoi_nhap_id=phieu_thu.nguoi_nhap_id,
            ngay_thu=phieu_thu.ngay_thu,
            ngay_cap_nhat=phieu_thu.ngay_cap_nhat,
            cac_chi_tiet_phieu_thu=chi_tiet_responses,
            tong_so_luong=tong_so_luong,
            tong_gia_tri=tong_gia_tri
        )
        
        return phieu_thu_response
    
    @staticmethod
    def tao_phieu_thu(phieu_thu_data: PhieuThuCreate, nguoi_nhap_id: int) -> PhieuThu:
        """
        Tạo phiếu thu mới và cộng dồn số lượng biến thể
        """
        session = db.session
        
        try:
            phieu_thu = PhieuThu(
                ma_phieu_thu=PhieuThuService.generate_ma_phieu_thu(),
                ten_nha_cung_cap=phieu_thu_data.ten_nha_cung_cap,
                nguoi_nhap_id=nguoi_nhap_id,
                ngay_thu=datetime.utcnow()
            )
            session.add(phieu_thu)
            session.flush()  # Lấy ID của phiếu thu
            
            for chi_tiet_data in phieu_thu_data.phieu_thu_chi_tiets:
                chi_tiet = ChiTietPhieuThu(
                    phieu_thu_id=phieu_thu.id,
                    bien_the_san_pham_id=chi_tiet_data.bien_the_san_pham_id,
                    so_luong=chi_tiet_data.so_luong,
                    gia_nhap_tung_vat=chi_tiet_data.gia_nhap_tung_vat
                )
                session.add(chi_tiet)
                
                PhieuThuService._cap_nhat_so_luong_bien_the(
                    chi_tiet_data.bien_the_san_pham_id,
                    chi_tiet_data.so_luong,
                    session
                )
            
            session.commit()
            
            # Load lại phiếu thu với đầy đủ relationship để trả về
            phieu_thu_complete = session.query(PhieuThu).\
                options(joinedload(PhieuThu.chi_tiet_phieu_thus)).\
                filter(PhieuThu.id == phieu_thu.id).first()
            
            return phieu_thu_complete
            
        except Exception as e:
            session.rollback()
            raise e
    
    @staticmethod
    def cap_nhat_phieu_thu(phieu_thu_id: int, update_data: PhieuThuUpdate) -> Optional[PhieuThu]:
        """
        Cập nhật phiếu thu và điều chỉnh số lượng biến thể
        - Xử lý thay đổi biến thể sản phẩm
        - Điều chỉnh số lượng tồn kho của cả biến thể cũ và mới
        """
        session = db.session
        
        try:
            # Lấy phiếu thu hiện tại với đầy đủ chi tiết
            phieu_thu = session.query(PhieuThu).\
                options(joinedload(PhieuThu.chi_tiet_phieu_thus)).\
                filter(PhieuThu.id == phieu_thu_id).first()
            
            if not phieu_thu:
                return None
            
            # Cập nhật thông tin cơ bản
            if update_data.ten_nha_cung_cap is not None:
                phieu_thu.ten_nha_cung_cap = update_data.ten_nha_cung_cap
            
            # Xử lý cập nhật chi tiết nếu có
            if update_data.phieu_thu_chi_tiets is not None:
                # Lấy chi tiết hiện tại
                chi_tiet_hien_tai = {
                    ct.id: ct for ct in phieu_thu.chi_tiet_phieu_thus
                }
                
                # Xử lý từng chi tiết trong request
                for chi_tiet_update in update_data.phieu_thu_chi_tiets:
                    # Cập nhật chi tiết tồn tại
                    if chi_tiet_update.id and chi_tiet_update.id in chi_tiet_hien_tai:
                        chi_tiet = chi_tiet_hien_tai.get(chi_tiet_update.id)
                        if chi_tiet:
                            # Lấy thông tin cũ
                            so_luong_cu = chi_tiet.so_luong
                            bien_the_id_cu = chi_tiet.bien_the_san_pham_id
                            
                            # Lấy thông tin mới (nếu không có thì giữ nguyên giá trị cũ)
                            so_luong_moi = chi_tiet_update.so_luong if chi_tiet_update.so_luong is not None else so_luong_cu
                            bien_the_id_moi = chi_tiet_update.bien_the_san_pham_id if chi_tiet_update.bien_the_san_pham_id is not None else bien_the_id_cu
                            gia_nhap_moi = chi_tiet_update.gia_nhap_tung_vat if chi_tiet_update.gia_nhap_tung_vat is not None else chi_tiet.gia_nhap_tung_vat
                            
                            # Xử lý thay đổi biến thể
                            if bien_the_id_cu != bien_the_id_moi:
                                # TH1: Thay đổi biến thể sản phẩm
                                # Giảm số lượng ở biến thể cũ
                                PhieuThuService._cap_nhat_so_luong_bien_the(
                                    bien_the_id_cu,
                                    -so_luong_cu,
                                    session
                                )
                                # Tăng số lượng ở biến thể mới
                                PhieuThuService._cap_nhat_so_luong_bien_the(
                                    bien_the_id_moi,
                                    so_luong_moi,
                                    session
                                )
                            else:
                                # TH2: Cùng biến thể, chỉ thay đổi số lượng
                                chenh_lech = so_luong_moi - so_luong_cu
                                if chenh_lech != 0:
                                    PhieuThuService._cap_nhat_so_luong_bien_the(
                                        bien_the_id_cu,
                                        chenh_lech,
                                        session
                                    )
                            
                            # Cập nhật thông tin chi tiết
                            chi_tiet.so_luong = so_luong_moi
                            chi_tiet.gia_nhap_tung_vat = gia_nhap_moi
                            chi_tiet.bien_the_san_pham_id = bien_the_id_moi
                    
                    else:
                        # Thêm chi tiết mới - cần có bien_the_san_pham_id
                        if not chi_tiet_update.bien_the_san_pham_id:
                            raise ValueError("bien_the_san_pham_id là bắt buộc khi thêm chi tiết mới")
                        if chi_tiet_update.so_luong is None:
                            raise ValueError("so_luong là bắt buộc khi thêm chi tiết mới")
                        if chi_tiet_update.gia_nhap_tung_vat is None:
                            raise ValueError("gia_nhap_tung_vat là bắt buộc khi thêm chi tiết mới")
                        
                        chi_tiet_moi = ChiTietPhieuThu(
                            phieu_thu_id=phieu_thu_id,
                            bien_the_san_pham_id=chi_tiet_update.bien_the_san_pham_id,
                            so_luong=chi_tiet_update.so_luong,
                            gia_nhap_tung_vat=chi_tiet_update.gia_nhap_tung_vat
                        )
                        session.add(chi_tiet_moi)
                        
                        PhieuThuService._cap_nhat_so_luong_bien_the(
                            chi_tiet_update.bien_the_san_pham_id,
                            chi_tiet_update.so_luong,
                            session
                        )
            
            session.commit()
            
            # Refresh để lấy dữ liệu mới nhất
            session.refresh(phieu_thu)
            
            # Load lại với đầy đủ relationship
            phieu_thu_complete = session.query(PhieuThu).\
                options(joinedload(PhieuThu.chi_tiet_phieu_thus)).\
                filter(PhieuThu.id == phieu_thu_id).first()
            
            return phieu_thu_complete
            
        except Exception as e:
            session.rollback()
            raise e
    
    @staticmethod
    def lay_phieu_thu_theo_id(phieu_thu_id: int) -> Optional[PhieuThu]:
        """Lấy thông tin phiếu thu theo ID với đầy đủ chi tiết"""
        return db.session.query(PhieuThu).\
            options(joinedload(PhieuThu.chi_tiet_phieu_thus)).\
            filter(PhieuThu.id == phieu_thu_id).first()
    
    @staticmethod
    def lay_danh_sach_phieu_thu(
        page: int = 1, 
        per_page: int = 10,
        ten_nha_cung_cap: Optional[str] = None,
        ngay_bat_dau: Optional[str] = None,
        ngay_ket_thuc: Optional[str] = None,
        ma_phieu_thu: Optional[str] = None
    ):
        """
        Lấy danh sách phiếu thu với phân trang và filter
        """
        query = db.session.query(PhieuThu).\
            options(joinedload(PhieuThu.chi_tiet_phieu_thus))
        
        # Filter theo tên nhà cung cấp
        if ten_nha_cung_cap:
            query = query.filter(PhieuThu.ten_nha_cung_cap.ilike(f"%{ten_nha_cung_cap}%"))
        
        # Filter theo mã phiếu thu
        if ma_phieu_thu:
            query = query.filter(PhieuThu.ma_phieu_thu.ilike(f"%{ma_phieu_thu}%"))
        
        # Filter theo khoảng thời gian
        try:
            start_datetime, end_datetime = PhieuThuService._chuan_hoa_thoi_gian_loc(
                ngay_bat_dau, ngay_ket_thuc
            )
            
            if start_datetime:
                query = query.filter(PhieuThu.ngay_thu >= start_datetime)
            
            if end_datetime:
                query = query.filter(PhieuThu.ngay_thu <= end_datetime)
                
        except ValueError as e:
            raise e
        
        # Sắp xếp theo ngày thu mới nhất
        query = query.order_by(PhieuThu.ngay_thu.desc())
        
        return query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
    
    @staticmethod
    def thong_ke_nhap_hang_theo_thang(
        nam: int,
        thang: Optional[int] = None
    ) -> dict:
        """
        Thống kê nhập hàng theo tháng/năm
        """
        query = db.session.query(PhieuThu)
        
        # Filter theo năm và tháng
        if thang:
            start_date = datetime(nam, thang, 1)
            if thang == 12:
                end_date = datetime(nam + 1, 1, 1) - timedelta(seconds=1)
            else:
                end_date = datetime(nam, thang + 1, 1) - timedelta(seconds=1)
        else:
            start_date = datetime(nam, 1, 1)
            end_date = datetime(nam + 1, 1, 1) - timedelta(seconds=1)
        
        query = query.filter(
            and_(
                PhieuThu.ngay_thu >= start_date,
                PhieuThu.ngay_thu <= end_date
            )
        )
        
        phieu_thu_list = query.all()
        
        # Tính tổng số lượng và giá trị nhập
        tong_so_luong = 0
        tong_gia_tri = Decimal('0')
        
        for phieu_thu in phieu_thu_list:
            for chi_tiet in phieu_thu.chi_tiet_phieu_thus:
                tong_so_luong += chi_tiet.so_luong
                tong_gia_tri += chi_tiet.so_luong * chi_tiet.gia_nhap_tung_vat
        
        return {
            'nam': nam,
            'thang': thang,
            'tong_phieu_thu': len(phieu_thu_list),
            'tong_so_luong_nhap': tong_so_luong,
            'tong_gia_tri_nhap': float(tong_gia_tri),
            'tu_ngay': start_date.strftime("%Y-%m-%d"),
            'den_ngay': end_date.strftime("%Y-%m-%d")
        }