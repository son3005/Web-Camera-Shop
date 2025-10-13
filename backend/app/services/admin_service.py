from app.models import Admin
from app.models import Product  # Giả sử có model Product
from app.models import Order  # Giả sử có model Order
from app.extensions import db

class AdminService:
    @staticmethod
    def add_product(ma_quan_tri, product_data):
        """add_product(product_data): Thêm sản phẩm mới."""
        admin = Admin.query.get(ma_quan_tri)
        if not admin:
            raise ValueError("Không phải quản trị viên")
        product = Product(**product_data)  # product_data: dict như {'ten': 'Máy ảnh Canon', 'gia': 1000}
        db.session.add(product)
        db.session.commit()
        return product

    @staticmethod
    def update_product(ma_quan_tri, product_id, update_data):
        """update_product(product_id, update_data): Cập nhật sản phẩm."""
        admin = Admin.query.get(ma_quan_tri)
        if not admin:
            raise ValueError("Không phải quản trị viên")
        product = Product.query.get(product_id)
        if not product:
            raise ValueError("Sản phẩm không tồn tại")
        for key, value in update_data.items():
            setattr(product, key, value)
        db.session.commit()
        return product

    @staticmethod
    def view_orders(ma_quan_tri):
        """view_orders(): Xem danh sách đơn hàng."""
        admin = Admin.query.get(ma_quan_tri)
        if not admin:
            raise ValueError("Không phải quản trị viên")
        return Order.query.all()  # Trả về list đơn hàng

    @staticmethod
    def view_users(ma_quan_tri):
        """view_users(): Xem danh sách người dùng."""
        admin = Admin.query.get(ma_quan_tri)
        if not admin:
            raise ValueError("Không phải quản trị viên")
        return User.query.all()  # Trả về list user

    @staticmethod
    def view_revenue(ma_quan_tri):
        """view_revenue(): Xem doanh thu (tính toán từ orders)."""
        admin = Admin.query.get(ma_quan_tri)
        if not admin:
            raise ValueError("Không phải quản trị viên")
        # Ví dụ tính tổng doanh thu: Giả sử Order có cột 'tong_tien'
        from sqlalchemy import func
        total_revenue = db.session.query(func.sum(Order.tong_tien)).scalar() or 0
        return total_revenue

    @staticmethod
    def manage_transaction_history(ma_quan_tri):
        """manage_transaction_history(): Quản lý lịch sử giao dịch (ví dụ: xem list orders với filter)."""
        admin = Admin.query.get(ma_quan_tri)
        if not admin:
            raise ValueError("Không phải quản trị viên")
        # Logic phức tạp hơn: Trả về list orders với status 'completed'
        return Order.query.filter_by(status='completed').all()