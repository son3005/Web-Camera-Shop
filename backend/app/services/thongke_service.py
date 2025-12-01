from datetime import datetime, timedelta
from sqlalchemy import func, extract, case, and_, or_, desc, distinct
from ..extensions import db
from ..models import *
from ..models.enums import TrangThaiDonHangEnum, TrangThaiThanhToanEnum

class ThongKeService:
    
    @staticmethod
    def thong_ke_doanh_thu_theo_thang_nam(nam=None, thang=None):
        """
        Thống kê doanh thu và lợi nhuận theo năm hoặc tháng/năm
        """
        try:
            # Subquery để lấy giá nhập gần nhất cho mỗi biến thể tại thời điểm đơn hàng
            subquery_gia_nhap = db.session.query(
                ChiTietPhieuNhap.bien_the_san_pham_id,
                ChiTietPhieuNhap.gia_nhap_tung_vat,
                PhieuNhap.ngay_thu,
                func.row_number().over(
                    partition_by=ChiTietPhieuNhap.bien_the_san_pham_id,
                    order_by=desc(PhieuNhap.ngay_thu)
                ).label('row_num')
            ).join(PhieuNhap, ChiTietPhieuNhap.phieu_thu_id == PhieuNhap.id
            ).subquery()

            # Query chính để tính doanh thu và lợi nhuận
            query = db.session.query(
                extract('year', DonHang.ngay_tao).label('nam'),
                func.sum(ThanhToan.so_tien).label('tong_doanh_thu'),
                func.sum(
                    (ChiTietDonHang.don_gia_luc_mua - subquery_gia_nhap.c.gia_nhap_tung_vat) * 
                    ChiTietDonHang.so_luong
                ).label('loi_nhuan')
            ).join(ThanhToan, DonHang.id == ThanhToan.don_hang_id
            ).join(ChiTietDonHang, DonHang.id == ChiTietDonHang.don_hang_id
            ).join(
                subquery_gia_nhap,
                and_(
                    subquery_gia_nhap.c.bien_the_san_pham_id == ChiTietDonHang.bien_the_san_pham_id,
                    subquery_gia_nhap.c.ngay_thu <= DonHang.ngay_tao,
                    subquery_gia_nhap.c.row_num == 1
                )
            ).filter(
                DonHang.trang_thai == TrangThaiDonHangEnum.DA_GIAO,
                ThanhToan.trang_thai == TrangThaiThanhToanEnum.DA_THANH_TOAN
            )
            
            if nam:
                query = query.filter(extract('year', DonHang.ngay_tao) == nam)
            
            # Xử lý theo tháng hoặc năm
            if thang:
                query = query.filter(extract('month', DonHang.ngay_tao) == thang)
                query = query.group_by(extract('year', DonHang.ngay_tao), extract('month', DonHang.ngay_tao))
                result = query.all()
                
                # Format kết quả theo tháng
                formatted_result = []
                for item in result:
                    formatted_result.append({
                        'nam': int(item.nam),
                        'thang': int(thang),
                        'tong_doanh_thu': float(item.tong_doanh_thu) if item.tong_doanh_thu else 0,
                        'loi_nhuan': float(item.loi_nhuan) if item.loi_nhuan else 0
                    })
                return formatted_result
            else:
                # Chỉ group by năm
                query = query.group_by(extract('year', DonHang.ngay_tao))
                result = query.all()
                
                # Format kết quả theo năm
                formatted_result = []
                for item in result:
                    formatted_result.append({
                        'nam': int(item.nam),
                        'tong_doanh_thu': float(item.tong_doanh_thu) if item.tong_doanh_thu else 0,
                        'loi_nhuan': float(item.loi_nhuan) if item.loi_nhuan else 0
                    })
                return formatted_result
                
        except Exception as e:
            print(f"Lỗi trong thong_ke_doanh_thu_theo_thang_nam: {str(e)}")
            return []

    @staticmethod
    def thong_ke_nguoi_dung_moi(nam=None, thang=None):
        """
        Thống kê người dùng mới theo năm hoặc tháng/năm
        FIXED: Lấy tất cả các năm có trong dữ liệu khi không có tham số
        """
        try:
            # Tính tổng số tài khoản
            tong_tai_khoan = db.session.query(func.count(NguoiDung.id)).scalar()
            
            # Lấy tất cả các năm có trong dữ liệu người dùng
            if nam is None:
                # Lấy tất cả các năm có người dùng
                years_query = db.session.query(
                    distinct(extract('year', NguoiDung.ngay_tao)).label('nam')
                ).filter(
                    NguoiDung.ngay_tao.isnot(None)
                ).order_by(extract('year', NguoiDung.ngay_tao).desc())
                
                years = [year[0] for year in years_query.all()]
                
                if not years:
                    return []
                
                formatted_result = []
                for year in years:
                    # Đếm số người dùng mới cho mỗi năm
                    count_query = db.session.query(
                        func.count(NguoiDung.id).label('so_nguoi_dung_moi')
                    ).filter(
                        extract('year', NguoiDung.ngay_tao) == year
                    )
                    
                    if thang:
                        count_query = count_query.filter(extract('month', NguoiDung.ngay_tao) == thang)
                    
                    count_result = count_query.scalar()
                    
                    if thang:
                        formatted_result.append({
                            'nam': int(year),
                            'thang': int(thang),
                            'so_nguoi_dung_moi': count_result or 0,
                            'tong_so_tai_khoan': tong_tai_khoan
                        })
                    else:
                        formatted_result.append({
                            'nam': int(year),
                            'so_nguoi_dung_moi': count_result or 0,
                            'tong_so_tai_khoan': tong_tai_khoan
                        })
                
                return formatted_result
            else:
                # Có tham số năm, xử lý như cũ
                query = db.session.query(
                    extract('year', NguoiDung.ngay_tao).label('nam'),
                    func.count(NguoiDung.id).label('so_nguoi_dung_moi')
                ).filter(
                    extract('year', NguoiDung.ngay_tao) == nam
                )
                
                if thang:
                    query = query.filter(extract('month', NguoiDung.ngay_tao) == thang)
                    query = query.group_by(extract('year', NguoiDung.ngay_tao), extract('month', NguoiDung.ngay_tao))
                    result = query.all()
                    
                    # Format kết quả theo tháng
                    formatted_result = []
                    for item in result:
                        formatted_result.append({
                            'nam': int(item.nam),
                            'thang': int(thang),
                            'so_nguoi_dung_moi': item.so_nguoi_dung_moi,
                            'tong_so_tai_khoan': tong_tai_khoan
                        })
                    return formatted_result
                else:
                    # Chỉ group by năm
                    query = query.group_by(extract('year', NguoiDung.ngay_tao))
                    result = query.all()
                    
                    # Format kết quả theo năm
                    formatted_result = []
                    for item in result:
                        formatted_result.append({
                            'nam': int(item.nam),
                            'so_nguoi_dung_moi': item.so_nguoi_dung_moi,
                            'tong_so_tai_khoan': tong_tai_khoan
                        })
                    return formatted_result
                
        except Exception as e:
            print(f"Lỗi trong thong_ke_nguoi_dung_moi: {str(e)}")
            return []

    @staticmethod
    def thong_ke_don_hang_thanh_cong(nam=None, thang=None):
        """
        Thống kê đơn hàng đã giao thành công theo năm hoặc tháng/năm
        FIXED: Lấy tất cả các năm có trong dữ liệu khi không có tham số
        """
        try:
            # Lấy tất cả các năm có trong dữ liệu đơn hàng
            if nam is None:
                years_query = db.session.query(
                    distinct(extract('year', DonHang.ngay_tao)).label('nam')
                ).filter(
                    DonHang.ngay_tao.isnot(None),
                    DonHang.trang_thai == TrangThaiDonHangEnum.DA_GIAO
                ).order_by(extract('year', DonHang.ngay_tao).desc())
                
                years = [year[0] for year in years_query.all()]
                
                if not years:
                    return []
                
                formatted_result = []
                for year in years:
                    # Đếm số đơn hàng thành công cho mỗi năm
                    count_query = db.session.query(
                        func.count(DonHang.id).label('so_don_thanh_cong')
                    ).filter(
                        extract('year', DonHang.ngay_tao) == year,
                        DonHang.trang_thai == TrangThaiDonHangEnum.DA_GIAO
                    )
                    
                    if thang:
                        count_query = count_query.filter(extract('month', DonHang.ngay_tao) == thang)
                    
                    count_result = count_query.scalar()
                    
                    if thang:
                        formatted_result.append({
                            'nam': int(year),
                            'thang': int(thang),
                            'so_don_thanh_cong': count_result or 0
                        })
                    else:
                        formatted_result.append({
                            'nam': int(year),
                            'so_don_thanh_cong': count_result or 0
                        })
                
                return formatted_result
            else:
                # Có tham số năm, xử lý như cũ
                query = db.session.query(
                    extract('year', DonHang.ngay_tao).label('nam'),
                    func.count(DonHang.id).label('so_don_thanh_cong')
                ).filter(
                    DonHang.trang_thai == TrangThaiDonHangEnum.DA_GIAO
                )
                
                if nam:
                    query = query.filter(extract('year', DonHang.ngay_tao) == nam)
                
                if thang:
                    query = query.filter(extract('month', DonHang.ngay_tao) == thang)
                    query = query.group_by(extract('year', DonHang.ngay_tao), extract('month', DonHang.ngay_tao))
                    result = query.all()
                    
                    # Format kết quả theo tháng
                    formatted_result = []
                    for item in result:
                        formatted_result.append({
                            'nam': int(item.nam),
                            'thang': int(thang),
                            'so_don_thanh_cong': item.so_don_thanh_cong
                        })
                    return formatted_result
                else:
                    # Chỉ group by năm
                    query = query.group_by(extract('year', DonHang.ngay_tao))
                    result = query.all()
                    
                    # Format kết quả theo năm
                    formatted_result = []
                    for item in result:
                        formatted_result.append({
                            'nam': int(item.nam),
                            'so_don_thanh_cong': item.so_don_thanh_cong
                        })
                    return formatted_result
                
        except Exception as e:
            print(f"Lỗi trong thong_ke_don_hang_thanh_cong: {str(e)}")
            return []

    @staticmethod
    def thong_ke_ti_trong_thuong_hieu(nam=None, thang=None):
        """
        Thống kê tỉ trọng thương hiệu theo năm hoặc tháng/năm
        """
        try:
            # Base query cho đơn hàng đã giao
            base_query = db.session.query(DonHang.id).filter(
                DonHang.trang_thai == TrangThaiDonHangEnum.DA_GIAO
            )
            
            if nam:
                base_query = base_query.filter(extract('year', DonHang.ngay_tao) == nam)
            if thang:
                base_query = base_query.filter(extract('month', DonHang.ngay_tao) == thang)
                
            don_hang_ids = [str(item[0]) for item in base_query.all()]
            
            if not don_hang_ids:
                return []
            
            # Query chính tính tỉ trọng
            result = db.session.query(
                ThuongHieu.ten_thuong_hieu,
                func.count(ChiTietDonHang.id).label('so_luong_don'),
                func.sum(ChiTietDonHang.don_gia_luc_mua * ChiTietDonHang.so_luong).label('tong_doanh_thu')
            ).join(BienTheSanPham, ChiTietDonHang.bien_the_san_pham_id == BienTheSanPham.id
            ).join(SanPham, BienTheSanPham.san_pham_id == SanPham.id
            ).join(ThuongHieu, SanPham.thuong_hieu_id == ThuongHieu.id
            ).filter(ChiTietDonHang.don_hang_id.in_(don_hang_ids)
            ).group_by(ThuongHieu.id, ThuongHieu.ten_thuong_hieu
            ).order_by(func.sum(ChiTietDonHang.don_gia_luc_mua * ChiTietDonHang.so_luong).desc()
            ).all()
            
            # Tính tổng doanh thu để tính tỉ trọng phần trăm
            tong_doanh_thu = sum(float(item.tong_doanh_thu) if item.tong_doanh_thu else 0 for item in result)
            
            formatted_result = []
            for item in result:
                formatted_result.append({
                    'thuong_hieu': item.ten_thuong_hieu,
                    'so_luong_don': item.so_luong_don,
                    'tong_doanh_thu': float(item.tong_doanh_thu) if item.tong_doanh_thu else 0,
                    'ti_trong_phantram': (float(item.tong_doanh_thu) / tong_doanh_thu * 100) if tong_doanh_thu > 0 else 0
                })
            
            return formatted_result
            
        except Exception as e:
            print(f"Lỗi trong thong_ke_ti_trong_thuong_hieu: {str(e)}")
            return []

    @staticmethod
    def thong_ke_nguoi_dung_dang_nhap(nam=None, thang=None):
        """
        Thống kê người dùng đã đăng nhập theo năm hoặc tháng/năm
        FIXED: Lấy tất cả các năm có trong dữ liệu khi không có tham số
        """
        try:
            # Lấy tất cả các năm có trong dữ liệu đăng nhập
            if nam is None:
                years_query = db.session.query(
                    distinct(extract('year', NguoiDung.lan_cuoi_dang_nhap)).label('nam')
                ).filter(
                    NguoiDung.lan_cuoi_dang_nhap.isnot(None)
                ).order_by(extract('year', NguoiDung.lan_cuoi_dang_nhap).desc())
                
                years = [year[0] for year in years_query.all()]
                
                if not years:
                    return []
                
                formatted_result = []
                for year in years:
                    # Đếm số người dùng đã đăng nhập cho mỗi năm
                    count_query = db.session.query(
                        func.count(NguoiDung.id).label('so_nguoi_dung_dang_nhap')
                    ).filter(
                        extract('year', NguoiDung.lan_cuoi_dang_nhap) == year,
                        NguoiDung.lan_cuoi_dang_nhap.isnot(None)
                    )
                    
                    if thang:
                        count_query = count_query.filter(extract('month', NguoiDung.lan_cuoi_dang_nhap) == thang)
                    
                    count_result = count_query.scalar()
                    
                    if thang:
                        formatted_result.append({
                            'nam': int(year),
                            'thang': int(thang),
                            'so_nguoi_dung_dang_nhap': count_result or 0
                        })
                    else:
                        formatted_result.append({
                            'nam': int(year),
                            'so_nguoi_dung_dang_nhap': count_result or 0
                        })
                
                return formatted_result
            else:
                # Có tham số năm, xử lý như cũ
                query = db.session.query(
                    extract('year', NguoiDung.lan_cuoi_dang_nhap).label('nam'),
                    func.count(NguoiDung.id).label('so_nguoi_dung_dang_nhap')
                ).filter(
                    NguoiDung.lan_cuoi_dang_nhap.isnot(None)
                )
                
                if nam:
                    query = query.filter(extract('year', NguoiDung.lan_cuoi_dang_nhap) == nam)
                
                if thang:
                    query = query.filter(extract('month', NguoiDung.lan_cuoi_dang_nhap) == thang)
                    query = query.group_by(extract('year', NguoiDung.lan_cuoi_dang_nhap), extract('month', NguoiDung.lan_cuoi_dang_nhap))
                    result = query.all()
                    
                    # Format kết quả theo tháng
                    formatted_result = []
                    for item in result:
                        formatted_result.append({
                            'nam': int(item.nam),
                            'thang': int(thang),
                            'so_nguoi_dung_dang_nhap': item.so_nguoi_dung_dang_nhap
                        })
                    return formatted_result
                else:
                    # Chỉ group by năm
                    query = query.group_by(extract('year', NguoiDung.lan_cuoi_dang_nhap))
                    result = query.all()
                    
                    # Format kết quả theo năm
                    formatted_result = []
                    for item in result:
                        formatted_result.append({
                            'nam': int(item.nam),
                            'so_nguoi_dung_dang_nhap': item.so_nguoi_dung_dang_nhap
                        })
                    return formatted_result
                
        except Exception as e:
            print(f"Lỗi trong thong_ke_nguoi_dung_dang_nhap: {str(e)}")
            return []

    @staticmethod
    def thong_ke_danh_gia(nam=None, thang=None):
        """
        Thống kê đánh giá theo năm hoặc tháng/năm
        FIXED: Lấy tất cả các năm có trong dữ liệu khi không có tham số
        """
        try:
            # Lấy tất cả các năm có trong dữ liệu đánh giá
            if nam is None:
                years_query = db.session.query(
                    distinct(extract('year', DanhGia.ngay_tao)).label('nam')
                ).filter(
                    DanhGia.ngay_tao.isnot(None)
                ).order_by(extract('year', DanhGia.ngay_tao).desc())
                
                years = [year[0] for year in years_query.all()]
                
                if not years:
                    return []
                
                formatted_result = []
                for year in years:
                    # Tính toán số liệu đánh giá cho mỗi năm
                    query = db.session.query(
                        func.sum(case((DanhGia.diem_danh_gia.in_([1, 2]), 1), else_=0)).label('danh_gia_tieu_cuc'),
                        func.sum(case((DanhGia.diem_danh_gia.in_([3, 4]), 1), else_=0)).label('danh_gia_trung_binh'),
                        func.sum(case((DanhGia.diem_danh_gia == 5, 1), else_=0)).label('danh_gia_tich_cuc'),
                        func.count(DanhGia.id).label('tong_so_danh_gia')
                    ).filter(
                        extract('year', DanhGia.ngay_tao) == year
                    )
                    
                    if thang:
                        query = query.filter(extract('month', DanhGia.ngay_tao) == thang)
                    
                    result_item = query.first()
                    
                    if thang:
                        formatted_result.append({
                            'nam': int(year),
                            'thang': int(thang),
                            'danh_gia_tieu_cuc': result_item.danh_gia_tieu_cuc or 0,
                            'danh_gia_trung_binh': result_item.danh_gia_trung_binh or 0,
                            'danh_gia_tich_cuc': result_item.danh_gia_tich_cuc or 0,
                            'tong_so_danh_gia': result_item.tong_so_danh_gia or 0
                        })
                    else:
                        formatted_result.append({
                            'nam': int(year),
                            'danh_gia_tieu_cuc': result_item.danh_gia_tieu_cuc or 0,
                            'danh_gia_trung_binh': result_item.danh_gia_trung_binh or 0,
                            'danh_gia_tich_cuc': result_item.danh_gia_tich_cuc or 0,
                            'tong_so_danh_gia': result_item.tong_so_danh_gia or 0
                        })
                
                return formatted_result
            else:
                # Có tham số năm, xử lý như cũ
                query = db.session.query(
                    extract('year', DanhGia.ngay_tao).label('nam'),
                    func.sum(case((DanhGia.diem_danh_gia.in_([1, 2]), 1), else_=0)).label('danh_gia_tieu_cuc'),
                    func.sum(case((DanhGia.diem_danh_gia.in_([3, 4]), 1), else_=0)).label('danh_gia_trung_binh'),
                    func.sum(case((DanhGia.diem_danh_gia == 5, 1), else_=0)).label('danh_gia_tich_cuc'),
                    func.count(DanhGia.id).label('tong_so_danh_gia')
                )
                
                if nam:
                    query = query.filter(extract('year', DanhGia.ngay_tao) == nam)
                
                if thang:
                    query = query.filter(extract('month', DanhGia.ngay_tao) == thang)
                    query = query.group_by(extract('year', DanhGia.ngay_tao), extract('month', DanhGia.ngay_tao))
                    result = query.all()
                    
                    # Format kết quả theo tháng
                    formatted_result = []
                    for item in result:
                        formatted_result.append({
                            'nam': int(item.nam),
                            'thang': int(thang),
                            'danh_gia_tieu_cuc': item.danh_gia_tieu_cuc,
                            'danh_gia_trung_binh': item.danh_gia_trung_binh,
                            'danh_gia_tich_cuc': item.danh_gia_tich_cuc,
                            'tong_so_danh_gia': item.tong_so_danh_gia
                        })
                    return formatted_result
                else:
                    # Chỉ group by năm
                    query = query.group_by(extract('year', DanhGia.ngay_tao))
                    result = query.all()
                    
                    # Format kết quả theo năm
                    formatted_result = []
                    for item in result:
                        formatted_result.append({
                            'nam': int(item.nam),
                            'danh_gia_tieu_cuc': item.danh_gia_tieu_cuc,
                            'danh_gia_trung_binh': item.danh_gia_trung_binh,
                            'danh_gia_tich_cuc': item.danh_gia_tich_cuc,
                            'tong_so_danh_gia': item.tong_so_danh_gia
                        })
                    return formatted_result
                
        except Exception as e:
            print(f"Lỗi trong thong_ke_danh_gia: {str(e)}")
            return []

    @staticmethod
    def tong_hop_thong_ke():
        """
        Tổng hợp tất cả thống kê cho dashboard
        """
        try:
            # Tổng doanh thu tháng này
            thang_nay = datetime.now().month
            nam_nay = datetime.now().year
            
            doanh_thu_thang_nay = db.session.query(
                func.coalesce(func.sum(ThanhToan.so_tien), 0)
            ).join(DonHang, DonHang.id == ThanhToan.don_hang_id
            ).filter(
                DonHang.trang_thai == TrangThaiDonHangEnum.DA_GIAO,
                extract('month', DonHang.ngay_tao) == thang_nay,
                extract('year', DonHang.ngay_tao) == nam_nay
            ).scalar()
            
            # Tổng đơn hàng tháng này
            don_hang_thang_nay = db.session.query(
                func.count(DonHang.id)
            ).filter(
                extract('month', DonHang.ngay_tao) == thang_nay,
                extract('year', DonHang.ngay_tao) == nam_nay
            ).scalar()
            
            # Người dùng mới tháng này
            nguoi_dung_moi = db.session.query(
                func.count(NguoiDung.id)
            ).filter(
                extract('month', NguoiDung.ngay_tao) == thang_nay,
                extract('year', NguoiDung.ngay_tao) == nam_nay
            ).scalar()
            
            # Tổng số tài khoản
            tong_tai_khoan = db.session.query(func.count(NguoiDung.id)).scalar()
            
            return {
                'doanh_thu_thang_nay': float(doanh_thu_thang_nay) if doanh_thu_thang_nay else 0,
                'don_hang_thang_nay': don_hang_thang_nay or 0,
                'nguoi_dung_moi_thang_nay': nguoi_dung_moi or 0,
                'tong_so_tai_khoan': tong_tai_khoan or 0
            }
            
        except Exception as e:
            print(f"Lỗi trong tong_hop_thong_ke: {str(e)}")
            return {
                'doanh_thu_thang_nay': 0,
                'don_hang_thang_nay': 0,
                'nguoi_dung_moi_thang_nay': 0,
                'tong_so_tai_khoan': 0
            }