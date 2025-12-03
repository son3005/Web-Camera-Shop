from datetime import datetime, timedelta
from sqlalchemy import func, extract, case, and_, or_, desc, distinct
from ..extensions import db
from ..models import *
from ..models.enums import TrangThaiDonHangEnum, TrangThaiThanhToanEnum

class ThongKeService:
    
    @staticmethod
    def thong_ke_doanh_thu_theo_thang_nam(nam=None, thang=None, ngay=None):
        """
        Thống kê doanh thu và lợi nhuận theo năm, tháng/năm hoặc ngày cụ thể (YYYY-MM-DD)
        """
        try:
            ngay_date = None
            if ngay:
                if isinstance(ngay, str):
                    ngay_date = datetime.strptime(ngay, '%Y-%m-%d').date()
                elif isinstance(ngay, datetime):
                    ngay_date = ngay.date()
                else:
                    ngay_date = getattr(ngay, 'date', lambda: ngay)()

            subquery_gia_nhap = db.session.query(
                ChiTietPhieuNhap.bien_the_san_pham_id,
                ChiTietPhieuNhap.gia_nhap_tung_vat,
                PhieuNhap.ngay_nhap,
                func.row_number().over(
                    partition_by=ChiTietPhieuNhap.bien_the_san_pham_id,
                    order_by=desc(PhieuNhap.ngay_nhap)
                ).label('row_num')
            ).join(PhieuNhap, ChiTietPhieuNhap.phieu_nhap_id == PhieuNhap.id
            ).subquery()

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
                    subquery_gia_nhap.c.ngay_nhap <= DonHang.ngay_tao,
                    subquery_gia_nhap.c.row_num == 1
                )
            ).filter(
                DonHang.trang_thai == TrangThaiDonHangEnum.DA_GIAO,
                ThanhToan.trang_thai == TrangThaiThanhToanEnum.DA_THANH_TOAN
            )

            if nam:
                query = query.filter(extract('year', DonHang.ngay_tao) == nam)

            if ngay_date:
                query = query.add_columns(
                    extract('month', DonHang.ngay_tao).label('thang'),
                    extract('day', DonHang.ngay_tao).label('ngay')
                ).filter(
                    func.date(DonHang.ngay_tao) == ngay_date
                ).group_by(
                    extract('year', DonHang.ngay_tao),
                    extract('month', DonHang.ngay_tao),
                    extract('day', DonHang.ngay_tao)
                )
                result = query.all()

                formatted_result = []
                for item in result:
                    formatted_result.append({
                        'nam': int(item.nam),
                        'thang': int(item.thang),
                        'ngay': int(item.ngay),
                        'tong_doanh_thu': float(item.tong_doanh_thu) if item.tong_doanh_thu else 0,
                        'loi_nhuan': float(item.loi_nhuan) if item.loi_nhuan else 0
                    })
                return formatted_result

            if thang:
                query = query.filter(extract('month', DonHang.ngay_tao) == thang
                ).group_by(
                    extract('year', DonHang.ngay_tao),
                    extract('month', DonHang.ngay_tao)
                )
                result = query.all()

                formatted_result = []
                for item in result:
                    formatted_result.append({
                        'nam': int(item.nam),
                        'thang': int(thang),
                        'tong_doanh_thu': float(item.tong_doanh_thu) if item.tong_doanh_thu else 0,
                        'loi_nhuan': float(item.loi_nhuan) if item.loi_nhuan else 0
                    })
                return formatted_result

            query = query.group_by(extract('year', DonHang.ngay_tao))
            result = query.all()

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
                ThanhToan.trang_thai == TrangThaiThanhToanEnum.DA_THANH_TOAN,
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
        
    @staticmethod
    def lay_danh_sach_loi_nhuan_doanh_thu(start_date=None, end_date=None):
        """
        Lấy danh sách lợi nhuận và doanh thu theo cấu trúc năm -> tháng -> ngày
        """
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else None
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None

            base_filters = [
                DonHang.trang_thai == TrangThaiDonHangEnum.DA_GIAO,
                DonHang.ngay_tao.isnot(None)
            ]
            if start_date_obj:
                base_filters.append(func.date(DonHang.ngay_tao) >= start_date_obj)
            if end_date_obj:
                base_filters.append(func.date(DonHang.ngay_tao) <= end_date_obj)

            years = db.session.query(
                distinct(extract('year', DonHang.ngay_tao)).label('nam')
            ).filter(
                *base_filters
            ).order_by(
                desc(extract('year', DonHang.ngay_tao))
            ).all()

            if not years:
                return []

            result = []
            for year_row in years:
                year = int(year_row.nam) if year_row.nam else None
                if not year:
                    continue

                months_filters = base_filters + [extract('year', DonHang.ngay_tao) == year]
                months = db.session.query(
                    distinct(extract('month', DonHang.ngay_tao)).label('thang')
                ).filter(
                    *months_filters
                ).order_by(
                    desc(extract('month', DonHang.ngay_tao))
                ).all()

                months_data = []
                for month_row in months:
                    month = int(month_row.thang) if month_row.thang else None
                    if not month:
                        continue

                    days_filters = months_filters + [extract('month', DonHang.ngay_tao) == month]
                    days = db.session.query(
                        func.date(DonHang.ngay_tao).label('ngay')
                    ).filter(
                        *days_filters
                    ).distinct().order_by(
                        desc(func.date(DonHang.ngay_tao))
                    ).all()

                    days_data = []
                    for day_row in days:
                        day_date = day_row.ngay
                        if isinstance(day_date, datetime):
                            day_date = day_date.date()
                        if not day_date:
                            continue

                        day_stats = ThongKeService.thong_ke_doanh_thu_theo_thang_nam(
                            ngay=day_date.strftime('%Y-%m-%d')
                        )
                        if not day_stats:
                            continue

                        stat = day_stats[0]
                        days_data.append({
                            'ngay': stat.get('ngay'),
                            'tong_doanh_thu': stat.get('tong_doanh_thu', 0),
                            'loi_nhuan': stat.get('loi_nhuan', 0)
                        })

                    if not days_data:
                        continue

                    months_data.append({
                        'thang': month,
                        'tong_doanh_thu': sum(day['tong_doanh_thu'] for day in days_data),
                        'loi_nhuan': sum(day['loi_nhuan'] for day in days_data),
                        'ngay': days_data
                    })

                if not months_data:
                    continue

                result.append({
                    'nam': year,
                    'tong_doanh_thu': sum(month['tong_doanh_thu'] for month in months_data),
                    'loi_nhuan': sum(month['loi_nhuan'] for month in months_data),
                    'thang': months_data
                })

            return result
        except Exception as e:
            print(f"Lỗi trong lay_danh_sach_loi_nhuan_doanh_thu: {str(e)}")
            return []


    @staticmethod
    def lay_danh_sach_danh_gia(start_date=None, end_date=None):
        try:
            # Xử lý ngày tháng
            start_date_obj = None
            end_date_obj = None
            
            if start_date:
                try:
                    start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                except ValueError:
                    # Thử định dạng khác nếu cần
                    pass
            
            if end_date:
                try:
                    end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                except ValueError:
                    pass
            
            # Truy vấn cơ bản
            query = db.session.query(DanhGia)
            
            # Áp dụng bộ lọc
            if start_date_obj:
                query = query.filter(func.date(DanhGia.ngay_tao) >= start_date_obj)
            if end_date_obj:
                query = query.filter(func.date(DanhGia.ngay_tao) <= end_date_obj)
            
            # Lấy tất cả dữ liệu trước để debug
            all_data = query.filter(DanhGia.ngay_tao.isnot(None)).all()
            print(f"DEBUG: Tổng số bản ghi lấy được: {len(all_data)}")
            
            if not all_data:
                return []
            
            # Nhóm dữ liệu theo năm/tháng thủ công
            from collections import defaultdict
            import calendar
            
            grouped_data = defaultdict(lambda: defaultdict(lambda: {
                'danh_gia_tieu_cuc': 0,
                'danh_gia_trung_binh': 0,
                'danh_gia_tich_cuc': 0,
                'tong_so_danh_gia': 0
            }))
            
            for danh_gia in all_data:
                if danh_gia.ngay_tao:
                    year = danh_gia.ngay_tao.year
                    month = danh_gia.ngay_tao.month
                    
                    month_data = grouped_data[year][month]
                    month_data['tong_so_danh_gia'] += 1
                    
                    if danh_gia.diem_danh_gia in [1, 2]:
                        month_data['danh_gia_tieu_cuc'] += 1
                    elif danh_gia.diem_danh_gia in [3, 4]:
                        month_data['danh_gia_trung_binh'] += 1
                    elif danh_gia.diem_danh_gia == 5:
                        month_data['danh_gia_tich_cuc'] += 1
            
            # Chuyển đổi sang định dạng kết quả
            result = []
            for year in sorted(grouped_data.keys(), reverse=True):
                months_data = []
                year_totals = {
                    'danh_gia_tieu_cuc': 0,
                    'danh_gia_trung_binh': 0,
                    'danh_gia_tich_cuc': 0,
                    'tong_so_danh_gia': 0
                }
                
                for month in sorted(grouped_data[year].keys(), reverse=True):
                    month_data = grouped_data[year][month]
                    months_data.append({
                        'thang': month,
                        **month_data
                    })
                    
                    # Cộng dồn vào tổng năm
                    for key in year_totals:
                        year_totals[key] += month_data[key]
                
                result.append({
                    'nam': year,
                    **year_totals,
                    'thang': months_data
                })
            
            return result
            
        except Exception as e:
            print(f"Lỗi trong lay_danh_sach_danh_gia: {str(e)}")
            import traceback
            traceback.print_exc()
            return []

    @staticmethod
    def lay_danh_sach_nguoi_dung_moi(start_date=None, end_date=None):
        try:
            # Xử lý ngày tháng
            start_date_obj = None
            end_date_obj = None
            
            if start_date:
                try:
                    start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                except ValueError:
                    # Thử định dạng khác nếu cần
                    pass
            
            if end_date:
                try:
                    end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                except ValueError:
                    pass
            
            # Truy vấn cơ bản
            query = db.session.query(NguoiDung)
            
            # Áp dụng bộ lọc
            if start_date_obj:
                query = query.filter(func.date(NguoiDung.ngay_tao) >= start_date_obj)
            if end_date_obj:
                query = query.filter(func.date(NguoiDung.ngay_tao) <= end_date_obj)
            
            # Lấy tất cả dữ liệu trước để debug
            all_data = query.filter(NguoiDung.ngay_tao.isnot(None)).all()
            print(f"DEBUG: Tổng số người dùng mới lấy được: {len(all_data)}")
            
            if not all_data:
                return []
            
            # Nhóm dữ liệu theo năm/tháng thủ công
            from collections import defaultdict
            
            grouped_data = defaultdict(lambda: defaultdict(int))
            
            for nguoi_dung in all_data:
                if nguoi_dung.ngay_tao:
                    year = nguoi_dung.ngay_tao.year
                    month = nguoi_dung.ngay_tao.month
                    
                    grouped_data[year][month] += 1
            
            # Chuyển đổi sang định dạng kết quả
            result = []
            for year in sorted(grouped_data.keys(), reverse=True):
                months_data = []
                year_total = 0
                
                for month in sorted(grouped_data[year].keys(), reverse=True):
                    count = grouped_data[year][month]
                    months_data.append({
                        'thang': month,
                        'so_nguoi_dung_moi': count
                    })
                    year_total += count
                
                result.append({
                    'nam': year,
                    'so_nguoi_dung_moi': year_total,
                    'thang': months_data
                })
            
            return result
            
        except Exception as e:
            print(f"Lỗi trong lay_danh_sach_nguoi_dung_moi: {str(e)}")