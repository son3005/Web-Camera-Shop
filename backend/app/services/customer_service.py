from app.models import Customer
from app.models import Address  # Giả sử có model Address
from app.extensions import db

class CustomerService:
    @staticmethod
    def them_dia_chi(ma_nguoi_dung, dia_chi_data):
        """themDiaChi(): Thêm địa chỉ cho KhachHang.
        - dia_chi_data: dict chứa thông tin địa chỉ (ví dụ: {'ten': 'Home', 'dia_chi': '123 ABC'}).
        """
        customer = Customer.query.get(ma_nguoi_dung)
        if not customer:
            raise ValueError("Không tìm thấy khách hàng")
        address = Address(**dia_chi_data, ma_nguoi_dung=ma_nguoi_dung)  # Tạo Address instance
        db.session.add(address)
        db.session.commit()
        return address