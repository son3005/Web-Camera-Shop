# app/services/diachi_service.py
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.exceptions import NotFound, BadRequest
from ..extensions import db
from ..models import DiaChi, NguoiDung
from ..schemas.nguoidung import DiaChiCreate, DiaChiUpdate, DiaChiResponse
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class DiaChiNotFound(NotFound):
    def __init__(self, message="Địa chỉ không tồn tại"):
        super().__init__(description=message)

class DiaChiService:
    
    @staticmethod
    def get_all_dia_chi(nguoi_dung_id: int, page: int = 1, per_page: int = 10):
        """
        Lấy danh sách địa chỉ của người dùng với phân trang
        """
        try:
            logger.info(f"Lấy danh sách địa chỉ | User: {nguoi_dung_id}")
            
            query = DiaChi.query.filter_by(nguoi_dung_id=nguoi_dung_id)
            
            # Sắp xếp: địa chỉ mặc định lên đầu, mới nhất lên trước
            query = query.order_by(
                DiaChi.la_mac_dinh.desc(),
                DiaChi.ngay_tao.desc()
            )
            
            # Phân trang
            pagination = query.paginate(
                page=page, 
                per_page=per_page, 
                error_out=False
            )
            
            # Chuẩn bị dữ liệu response - giờ có thể dùng trực tiếp với DiaChiResponse
            data = []
            for dia_chi in pagination.items:
                data.append(dia_chi)  # Trả về trực tiếp đối tượng DiaChi
            
            logger.info(f"Lấy danh sách địa chỉ thành công | total={pagination.total}")
            
            return {
                "data": data,  # Danh sách đối tượng DiaChi
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": pagination.total,
                    "pages": pagination.pages
                }
            }
            
        except SQLAlchemyError as e:
            logger.error(f"Lỗi database khi lấy danh sách địa chỉ: {e}", exc_info=True)
            raise BadRequest("Lỗi hệ thống khi lấy danh sách địa chỉ")
    
    @staticmethod
    def get_dia_chi_by_id(dia_chi_id: int, nguoi_dung_id: int):
        """
        Lấy chi tiết địa chỉ theo ID và kiểm tra quyền sở hữu
        """
        try:
            logger.info(f"Lấy chi tiết địa chỉ | ID: {dia_chi_id}, User: {nguoi_dung_id}")
            
            dia_chi = DiaChi.query.filter_by(
                id=dia_chi_id, 
                nguoi_dung_id=nguoi_dung_id
            ).first()
            
            if not dia_chi:
                logger.warning(f"Địa chỉ không tồn tại hoặc không có quyền truy cập | ID: {dia_chi_id}")
                raise DiaChiNotFound()
            
            return dia_chi
            
        except SQLAlchemyError as e:
            logger.error(f"Lỗi database khi lấy địa chỉ: {e}", exc_info=True)
            raise BadRequest("Lỗi hệ thống khi lấy thông tin địa chỉ")
    
    @staticmethod
    def create_dia_chi(data: DiaChiCreate, nguoi_dung_id: int):
        """
        Tạo địa chỉ mới cho người dùng
        """
        try:
            logger.info(f"Tạo địa chỉ mới | User: {nguoi_dung_id}")
            
            # Kiểm tra người dùng tồn tại
            nguoi_dung = NguoiDung.query.get(nguoi_dung_id)
            if not nguoi_dung:
                raise NotFound("Người dùng không tồn tại")
            
            # Nếu đánh dấu là mặc định, hủy mặc định của các địa chỉ khác
            if data.la_mac_dinh:
                DiaChi.query.filter_by(
                    nguoi_dung_id=nguoi_dung_id, 
                    la_mac_dinh=True
                ).update({'la_mac_dinh': False})
                db.session.commit()
            
            # Tạo địa chỉ mới
            dia_chi_moi = DiaChi(
                nguoi_dung_id=nguoi_dung_id,
                ten_nguoi_nhan=data.ten_nguoi_nhan,
                so_dien_thoai=data.so_dien_thoai,
                dia_chi_cu_the=data.dia_chi_cu_the,
                phuong_xa=data.phuong_xa,
                tinh_thanh=data.tinh_thanh,
                ma_buu_dien=data.ma_buu_dien,
                la_mac_dinh=data.la_mac_dinh
            )
            
            db.session.add(dia_chi_moi)
            db.session.commit()
            
            logger.info(f"Tạo địa chỉ thành công | ID: {dia_chi_moi.id}")
            return dia_chi_moi
            
        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"Lỗi integrity khi tạo địa chỉ: {e}", exc_info=True)
            raise BadRequest("Dữ liệu địa chỉ không hợp lệ")
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Lỗi database khi tạo địa chỉ: {e}", exc_info=True)
            raise BadRequest("Lỗi hệ thống khi tạo địa chỉ")
    
    @staticmethod
    def update_dia_chi(dia_chi_id: int, data: DiaChiUpdate, nguoi_dung_id: int):
        """
        Cập nhật thông tin địa chỉ
        """
        try:
            logger.info(f"Cập nhật địa chỉ | ID: {dia_chi_id}, User: {nguoi_dung_id}")
            
            # Lấy địa chỉ và kiểm tra quyền sở hữu
            dia_chi = DiaChiService.get_dia_chi_by_id(dia_chi_id, nguoi_dung_id)
            
            # Lấy dữ liệu cập nhật
            update_data = data.model_dump(exclude_unset=True)
            
            if not update_data:
                logger.info("Không có trường nào được cập nhật")
                return dia_chi
            
            # Xử lý địa chỉ mặc định
            if 'la_mac_dinh' in update_data and update_data['la_mac_dinh']:
                DiaChi.query.filter_by(
                    nguoi_dung_id=nguoi_dung_id, 
                    la_mac_dinh=True
                ).update({'la_mac_dinh': False})
            
            # Cập nhật từng trường
            for field, value in update_data.items():
                if hasattr(dia_chi, field) and value is not None:
                    setattr(dia_chi, field, value)
            
            # Cập nhật thời gian
            dia_chi.ngay_cap_nhat = datetime.utcnow()
            
            db.session.commit()
            logger.info(f"Cập nhật địa chỉ thành công | ID: {dia_chi_id}")
            
            return dia_chi
            
        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"Lỗi integrity khi cập nhật địa chỉ: {e}", exc_info=True)
            raise BadRequest("Dữ liệu cập nhật không hợp lệ")
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Lỗi database khi cập nhật địa chỉ: {e}", exc_info=True)
            raise BadRequest("Lỗi hệ thống khi cập nhật địa chỉ")
    
    @staticmethod
    def delete_dia_chi(dia_chi_id: int, nguoi_dung_id: int):
        """
        Xóa địa chỉ
        """
        try:
            logger.info(f"Xóa địa chỉ | ID: {dia_chi_id}, User: {nguoi_dung_id}")
            
            # Lấy địa chỉ và kiểm tra quyền sở hữu
            dia_chi = DiaChiService.get_dia_chi_by_id(dia_chi_id, nguoi_dung_id)
            
            # Không cho phép xóa địa chỉ mặc định
            if dia_chi.la_mac_dinh:
                logger.warning(f"Không thể xóa địa chỉ mặc định | ID: {dia_chi_id}")
                raise BadRequest("Không thể xóa địa chỉ mặc định")
            
            # Xóa địa chỉ
            db.session.delete(dia_chi)
            db.session.commit()
            
            logger.info(f"Xóa địa chỉ thành công | ID: {dia_chi_id}")
            return {"message": "Xóa địa chỉ thành công"}
            
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Lỗi database khi xóa địa chỉ: {e}", exc_info=True)
            raise BadRequest("Lỗi hệ thống khi xóa địa chỉ")
    
    @staticmethod
    def set_mac_dinh(dia_chi_id: int, nguoi_dung_id: int):
        """
        Đặt địa chỉ làm mặc định
        """
        try:
            logger.info(f"Đặt địa chỉ mặc định | ID: {dia_chi_id}, User: {nguoi_dung_id}")
            
            # Lấy địa chỉ và kiểm tra quyền sở hữu
            dia_chi = DiaChiService.get_dia_chi_by_id(dia_chi_id, nguoi_dung_id)
            
            # Hủy mặc định của tất cả địa chỉ khác
            DiaChi.query.filter_by(
                nguoi_dung_id=nguoi_dung_id, 
                la_mac_dinh=True
            ).update({'la_mac_dinh': False})
            
            # Đặt địa chỉ này làm mặc định
            dia_chi.la_mac_dinh = True
            dia_chi.ngay_cap_nhat = datetime.utcnow()
            
            db.session.commit()
            logger.info(f"Đặt địa chỉ mặc định thành công | ID: {dia_chi_id}")
            
            return dia_chi
            
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.error(f"Lỗi database khi đặt địa chỉ mặc định: {e}", exc_info=True)
            raise BadRequest("Lỗi hệ thống khi đặt địa chỉ mặc định")