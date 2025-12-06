import pytest
from unittest.mock import patch, MagicMock
from app.main import create_app
from app.extensions import db

# Import models để db.create_all() nhận diện
from app.models.nguoidung import NguoiDung, KhachHang, QuanTriVien
from app.models.sanpham import SanPham, BienTheSanPham, HinhAnhSanPham, DanhMuc, ThuongHieu
from app.models.extras import DanhGia
from app.models.giohang_dathang import GioHang, ChiTietGioHang, DonHang, ChiTietDonHang, ThanhToan


@pytest.fixture(scope="function")
def app():
    """Tạo Flask app cho pytest, mỗi test function có một app riêng."""
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'SECRET_KEY': 'test-secret',
        'JWT_SECRET_KEY': 'test-jwt-secret'
    })

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Trả về test client Flask."""
    return app.test_client()


@pytest.fixture
def admin_headers():
    """✅ SỬA: Dùng token đơn giản"""
    return {"Authorization": "Bearer test-admin-token"}


@pytest.fixture
def init_data(app):
    """Tạo dữ liệu mẫu để test."""
    with app.app_context():
        # XÓA DỮ LIỆU CŨ TRƯỚC KHI TẠO MỚI
        db.session.query(DanhMuc).delete()
        db.session.query(ThuongHieu).delete()
        
        dm = DanhMuc(ma_danh_muc="CAM", ten_danh_muc="Máy ảnh")
        th = ThuongHieu(ma_thuong_hieu="SONY", ten_thuong_hieu="Sony", logo_url="https://logo.com")
        db.session.add(dm)
        db.session.add(th)
        db.session.commit()
        return {"danh_muc_id": dm.id, "thuong_hieu_id": th.id}


# ✅ THÊM FIXTURE MOCK JWT ĐƠN GIẢN HƠN
@pytest.fixture(autouse=True)
def mock_jwt():
    """Mock JWT verification - SỬA LẠI CÁCH MOCK"""
    # Mock trực tiếp flask_jwt_extended functions
    with patch('flask_jwt_extended.verify_jwt_in_request') as mock_verify:
        with patch('flask_jwt_extended.get_jwt_identity') as mock_identity:
            with patch('flask_jwt_extended.get_jwt') as mock_jwt:
                # Setup return values
                mock_verify.return_value = True
                mock_identity.return_value = "1"  # User ID as string
                mock_jwt.return_value = {"is_admin": True}
                yield