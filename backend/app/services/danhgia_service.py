# /backend/app/services/danh_gia_service.py
import traceback
from sqlalchemy import and_, func
from sqlalchemy.orm import joinedload
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple 
from decimal import Decimal

from ..extensions import db
from ..models import DanhGia, SanPham, ChiTietDonHang, NguoiDung, BienTheSanPham
from ..models.enums import TrangThaiDanhGiaEnum, VaiTroNguoiDungEnum, TrangThaiDonHangEnum
from ..schemas.extras.DanhGia import DanhGiaCreate, DanhGiaUpdate, DanhGiaAdminUpdate


class DanhGiaService:
    @staticmethod
    def get_danh_gia_by_id(danh_gia_id: int) -> Optional[DanhGia]:
        """Lấy đánh giá theo ID"""
        return DanhGia.query.options(
            joinedload(DanhGia.nguoi_dung),
            joinedload(DanhGia.san_pham),
            joinedload(DanhGia.chi_tiet_don_hang)
        ).filter(DanhGia.id == danh_gia_id).first()

    @staticmethod
    def get_danh_gia_san_pham(
        san_pham_id: int, 
        filters: Optional[Dict[str, Any]] = None,  # THÊM OPTIONAL
        page: int = 1, 
        per_page: int = 10
    ) -> Tuple[List[DanhGia], Dict[str, int]]:  # SỬA RETURN TYPE
        """
        Lấy danh sách đánh giá của sản phẩm với bộ lọc nâng cao
        """
        query = DanhGia.query.options(
            joinedload(DanhGia.nguoi_dung)
        ).filter(
            DanhGia.san_pham_id == san_pham_id,
            DanhGia.trang_thai == TrangThaiDanhGiaEnum.DA_DUYET
        )

        # Áp dụng các bộ lọc nếu có
        query = DanhGiaService._apply_filters(query, filters)

        query = query.order_by(DanhGia.ngay_tao.desc())

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return pagination.items, {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages
        }
    
    @staticmethod
    def get_danh_gia_cua_toi(
        nguoi_dung_id: int, 
        filters: Optional[Dict[str, Any]] = None,  # THÊM OPTIONAL
        page: int = 1, 
        per_page: int = 10
    ) -> Tuple[List[DanhGia], Dict[str, int]]:  # SỬA RETURN TYPE
        """
        Lấy danh sách đánh giá của người dùng hiện tại với bộ lọc
        """
        query = DanhGia.query.options(
            joinedload(DanhGia.san_pham),
            joinedload(DanhGia.chi_tiet_don_hang)
        ).filter(
            DanhGia.nguoi_dung_id == nguoi_dung_id
        )

        # Áp dụng các bộ lọc nếu có
        query = DanhGiaService._apply_filters(query, filters)

        query = query.order_by(DanhGia.ngay_tao.desc())

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return pagination.items, {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages
        }

    @staticmethod
    def _apply_filters(query, filters: Optional[Dict[str, Any]]):  # THÊM OPTIONAL
        """
        Áp dụng các bộ lọc vào query
        """
        if not filters:
            return query

        # Lọc theo điểm đánh giá (sao)
        if 'diem_danh_gia' in filters and filters['diem_danh_gia']:
            diem_values = filters['diem_danh_gia']
            if isinstance(diem_values, list):
                # Nhiều điểm số: [4, 5] - đánh giá 4 hoặc 5 sao
                query = query.filter(DanhGia.diem_danh_gia.in_(diem_values))
            else:
                # Một điểm số cụ thể
                query = query.filter(DanhGia.diem_danh_gia == diem_values)

        # Lọc theo trạng thái
        if 'trang_thai' in filters and filters['trang_thai']:
            trang_thai_values = filters['trang_thai']
            if isinstance(trang_thai_values, list):
                # Nhiều trạng thái: ['da_duyet', 'bi_tu_choi']
                query = query.filter(DanhGia.trang_thai.in_([TrangThaiDanhGiaEnum(tt) for tt in trang_thai_values]))
            else:
                # Một trạng thái cụ thể
                query = query.filter(DanhGia.trang_thai == TrangThaiDanhGiaEnum(trang_thai_values))

        # Lọc theo sản phẩm
        if 'san_pham_id' in filters and filters['san_pham_id']:
            query = query.filter(DanhGia.san_pham_id == filters['san_pham_id'])

        # Lọc theo người dùng
        if 'nguoi_dung_id' in filters and filters['nguoi_dung_id']:
            query = query.filter(DanhGia.nguoi_dung_id == filters['nguoi_dung_id'])

        # Lọc theo khoảng thời gian
        if 'tu_ngay' in filters and filters['tu_ngay']:
            try:
                tu_ngay = datetime.strptime(filters['tu_ngay'], '%Y-%m-%d')
                query = query.filter(DanhGia.ngay_tao >= tu_ngay)
            except ValueError:
                pass  # Bỏ qua nếu định dạng không hợp lệ

        if 'den_ngay' in filters and filters['den_ngay']:
            try:
                den_ngay = datetime.strptime(filters['den_ngay'], '%Y-%m-%d')
                # Thêm 1 ngày để bao gồm cả ngày kết thúc
                den_ngay = den_ngay + timedelta(days=1)
                query = query.filter(DanhGia.ngay_tao < den_ngay)
            except ValueError:
                pass  # Bỏ qua nếu định dạng không hợp lệ

        # Lọc theo từ khóa trong bình luận
        if 'tu_khoa' in filters and filters['tu_khoa']:
            tu_khoa = f"%{filters['tu_khoa']}%"
            query = query.filter(DanhGia.binh_luan.ilike(tu_khoa))

        # Lọc theo có bình luận/không có bình luận
        if 'co_binh_luan' in filters and filters['co_binh_luan'] is not None:
            if filters['co_binh_luan']:
                query = query.filter(DanhGia.binh_luan.isnot(None))
            else:
                query = query.filter(DanhGia.binh_luan.is_(None))

        return query

    @staticmethod
    def get_thong_ke_danh_gia(san_pham_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Thống kê đánh giá theo điểm số
        """
        query = db.session.query(
            DanhGia.diem_danh_gia,
            func.count(DanhGia.id).label('so_luong')
        ).filter(
            DanhGia.trang_thai == TrangThaiDanhGiaEnum.DA_DUYET
        )

        if san_pham_id:
            query = query.filter(DanhGia.san_pham_id == san_pham_id)

        results = query.group_by(DanhGia.diem_danh_gia).all()

        # Tạo dict thống kê
        thong_ke = {i: 0 for i in range(1, 6)}  # Khởi tạo từ 1-5 sao
        for diem, so_luong in results:
            thong_ke[diem] = so_luong

        # Tính tổng và trung bình
        tong_danh_gia = sum(thong_ke.values())
        trung_binh = sum(diem * so_luong for diem, so_luong in thong_ke.items()) / tong_danh_gia if tong_danh_gia > 0 else 0

        return {
            'thong_ke_theo_sao': thong_ke,
            'tong_danh_gia': tong_danh_gia,
            'trung_binh': round(trung_binh, 1),
            'phan_tram_theo_sao': {
                diem: round((so_luong / tong_danh_gia) * 100, 1) if tong_danh_gia > 0 else 0
                for diem, so_luong in thong_ke.items()
            }
        }

    @staticmethod
    def get_all_danh_gia_admin(
        page: int = 1,
        per_page: int = 20,
        diem_danh_gia: Optional[int] = None,
        trang_thai: Optional[TrangThaiDanhGiaEnum] = None,
        san_pham_id: Optional[int] = None,
        nguoi_dung_id: Optional[int] = None,
        tu_ngay: Optional[datetime] = None,
        den_ngay: Optional[datetime] = None,
        co_binh_luan: Optional[bool] = None
    ) -> Tuple[List[DanhGia], Dict[str, int]]:
        """Lấy tất cả đánh giá với bộ lọc (dành cho admin)"""
        try:
            from flask import current_app
            current_app.logger.info("Bắt đầu get_all_danh_gia_admin")
            
            # Khởi tạo query với eager loading
            query = DanhGia.query.options(
                joinedload(DanhGia.nguoi_dung),
                joinedload(DanhGia.san_pham),
                joinedload(DanhGia.chi_tiet_don_hang)
            )

            # Áp dụng filters nếu có
            if diem_danh_gia:
                query = query.filter(DanhGia.diem_danh_gia == diem_danh_gia)
            
            if trang_thai:
                query = query.filter(DanhGia.trang_thai == trang_thai)
            
            if san_pham_id:
                query = query.filter(DanhGia.san_pham_id == san_pham_id)
            
            if nguoi_dung_id:
                query = query.filter(DanhGia.nguoi_dung_id == nguoi_dung_id)
            
            if tu_ngay:
                # Lọc từ ngày (bao gồm cả ngày đó)
                query = query.filter(DanhGia.ngay_tao >= tu_ngay)
            
            if den_ngay:
                # Lọc đến ngày (bao gồm cả ngày đó) - thêm thời gian cuối ngày
                den_ngay_end = den_ngay.replace(hour=23, minute=59, second=59)
                query = query.filter(DanhGia.ngay_tao <= den_ngay_end)
            
            if co_binh_luan is not None:
                if co_binh_luan:
                    # Lọc đánh giá CÓ bình luận
                    query = query.filter(DanhGia.binh_luan.isnot(None))
                else:
                    # Lọc đánh giá KHÔNG CÓ bình luận
                    query = query.filter(DanhGia.binh_luan.is_(None))

            # Sắp xếp theo ngày tạo mới nhất
            query = query.order_by(DanhGia.ngay_tao.desc())

            current_app.logger.info(f"Truy vấn SQL: {query}")

            # Phân trang
            pagination = query.paginate(page=page, per_page=per_page, error_out=False)
            
            current_app.logger.info(f"Phân trang: total={pagination.total}, pages={pagination.pages}")
            
            return pagination.items, {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
            
        except Exception as e:
            from flask import current_app
            current_app.logger.error(f"Lỗi trong get_all_danh_gia_admin: {str(e)}")
            current_app.logger.error(traceback.format_exc())
            raise

    @staticmethod
    def create_danh_gia(danh_gia_data: DanhGiaCreate, nguoi_dung_id: int) -> DanhGia:
        """Tạo đánh giá mới (khách hàng)"""
        try:
            print(f"DEBUG: Bắt đầu tạo đánh giá - chi_tiet_don_hang_id: {danh_gia_data.chi_tiet_don_hang_id}, nguoi_dung_id: {nguoi_dung_id}")
            
            # Kiểm tra chi tiết đơn hàng có tồn tại và thuộc về người dùng
            chi_tiet_dh = ChiTietDonHang.query.join(ChiTietDonHang.don_hang).filter(
                and_(
                    ChiTietDonHang.id == danh_gia_data.chi_tiet_don_hang_id,
                    ChiTietDonHang.don_hang.has(nguoi_dung_id=nguoi_dung_id),  # Sử dụng has để kiểm tra khóa ngoại
                    ChiTietDonHang.don_hang.has(trang_thai=TrangThaiDonHangEnum.DA_GIAO)
                )
                ).first()

            print(f"DEBUG: Kết quả truy vấn chi_tiet_dh: {chi_tiet_dh}")

            if not chi_tiet_dh:
                raise ValueError("Chi tiết đơn hàng không tồn tại, không thuộc về bạn hoặc chưa được giao")

            # Kiểm tra đã đánh giá chưa
            existing_review = DanhGia.query.filter_by(
                chi_tiet_don_hang_id=danh_gia_data.chi_tiet_don_hang_id
            ).first()
            
            if existing_review:
                raise ValueError("Bạn đã đánh giá đơn hàng này rồi")

            # Lấy san_pham_id từ biến thể sản phẩm
            if not chi_tiet_dh.bien_the_san_pham:
                raise ValueError("Không tìm thấy thông tin biến thể sản phẩm")

            print(f"DEBUG: san_pham_id từ biến thể: {chi_tiet_dh.bien_the_san_pham.san_pham_id}")

            # Tạo đánh giá mới
            danh_gia = DanhGia(
                chi_tiet_don_hang_id=danh_gia_data.chi_tiet_don_hang_id,
                san_pham_id=chi_tiet_dh.bien_the_san_pham.san_pham_id,
                nguoi_dung_id=nguoi_dung_id,
                diem_danh_gia=danh_gia_data.diem_danh_gia,
                binh_luan=danh_gia_data.binh_luan,
                trang_thai=TrangThaiDanhGiaEnum.DA_DUYET
            )

            print(f"DEBUG: Đối tượng DanhGia được tạo: {danh_gia}")

            db.session.add(danh_gia)
            db.session.commit()

            print("DEBUG: Commit thành công")

            # Cập nhật điểm trung bình sản phẩm
            DanhGiaService._update_product_rating(danh_gia.san_pham_id)

            return danh_gia

        except Exception as e:
            print(f"DEBUG: Lỗi trong create_danh_gia: {str(e)}")
            print(f"DEBUG: Traceback: {traceback.format_exc()}")
            db.session.rollback()
            raise

    @staticmethod
    def update_danh_gia(
        danh_gia_id: int, 
        update_data: DanhGiaUpdate, 
        nguoi_dung_id: int

    ) -> Optional[DanhGia]:
        """Cập nhật đánh giá"""
        danh_gia = DanhGia.query.filter_by(id=danh_gia_id).first()
        
        if not danh_gia:
            return None

        # SỬA LỖI: Kiểm tra quyền đúng cách
        if danh_gia.nguoi_dung_id != int(nguoi_dung_id):
            raise PermissionError(f"Bạn không có quyền cập nhật đánh giá này {danh_gia_id} của người dùng {danh_gia.nguoi_dung_id}, không phải {nguoi_dung_id}")

        # Cập nhật thông tin
        if update_data.diem_danh_gia is not None:
            danh_gia.diem_danh_gia = update_data.diem_danh_gia
        if update_data.binh_luan is not None:
            danh_gia.binh_luan = update_data.binh_luan
        if update_data.trang_thai is not None:
            danh_gia.trang_thai = update_data.trang_thai

        danh_gia.ngay_cap_nhat = datetime.utcnow()

        db.session.commit()

        # Cập nhật lại điểm trung bình sản phẩm
        DanhGiaService._update_product_rating(danh_gia.san_pham_id)

        return danh_gia
    

    @staticmethod
    def delete_danh_gia(danh_gia_id: int, nguoi_dung_id: int, ) -> bool:
        """Xóa đánh giá"""
        danh_gia = DanhGia.query.filter_by(id=danh_gia_id).first()
        
        if not danh_gia:
            return False

        # Kiểm tra quyền
        if danh_gia.nguoi_dung_id != int(nguoi_dung_id):
            raise PermissionError("Bạn không có quyền xóa đánh giá này")

        san_pham_id = danh_gia.san_pham_id
        
        db.session.delete(danh_gia)
        db.session.commit()

        # Cập nhật lại điểm trung bình sản phẩm
        DanhGiaService._update_product_rating(san_pham_id)  # SỬA TÊN PHƯƠNG THỨC

        return True

    @staticmethod
    def admin_update_trang_thai(danh_gia_id: int, trang_thai: TrangThaiDanhGiaEnum) -> Optional[DanhGia]:
        """Admin cập nhật trạng thái đánh giá (khóa/mở)"""
        danh_gia = DanhGia.query.filter_by(id=danh_gia_id).first()
        
        if not danh_gia:
            return None

        danh_gia.trang_thai = trang_thai
        danh_gia.ngay_cap_nhat = datetime.utcnow()

        db.session.commit()

        # Cập nhật lại điểm trung bình sản phẩm
        DanhGiaService._update_product_rating(danh_gia.san_pham_id)  # SỬA TÊN PHƯƠNG THỨC

        return danh_gia

    @staticmethod
    def _update_product_rating(san_pham_id: int):  # ĐỔI TÊN PHƯƠNG THỨC
        """Cập nhật điểm trung bình và số lượng đánh giá cho sản phẩm"""
        # Tính toán điểm trung bình và số lượng đánh giá đã duyệt
        result = db.session.query(
            func.avg(DanhGia.diem_danh_gia).label('trung_binh'),
            func.count(DanhGia.id).label('so_luong')
        ).filter(
            DanhGia.san_pham_id == san_pham_id,
            DanhGia.trang_thai == TrangThaiDanhGiaEnum.DA_DUYET
        ).first()

        # Lấy sản phẩm và cập nhật - giả sử model SanPham có các trường này
        san_pham = SanPham.query.filter_by(id=san_pham_id).first()
        if san_pham:
            san_pham.so_sao_trung_binh = Decimal(result.trung_binh).quantize(Decimal('0.1')) if result.trung_binh else Decimal('0')
            san_pham.so_luong_danh_gia = result.so_luong or 0
            db.session.commit()
