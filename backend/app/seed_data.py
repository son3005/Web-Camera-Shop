# backend/app/seed_data.py
import sys
import os
from datetime import datetime
from werkzeug.security import generate_password_hash



# Thêm đường dẫn để import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .main import create_app
from .extensions import db
from .models.sanpham.DanhMuc import DanhMuc
from .models.sanpham.ThuongHieu import ThuongHieu
from .models.sanpham.CapDo import CapDo
from .models.sanpham.SanPham import SanPham
from .models.sanpham.BienTheSanPham import BienTheSanPham
from .models.nguoidung.NguoiDung import NguoiDung
from .models.nguoidung.DiaChi import DiaChi
from .models.giohang_dathang import ChiTietGioHang, GioHang
from .models.sanpham import HinhAnhSanPham

def seed_data():
    # ĐẶT BIẾN MÔI TRƯỜNG TRƯỚC KHI TẠO APP
    os.environ.setdefault('PAYOS_CLIENT_ID', 'dummy_client_id')
    os.environ.setdefault('PAYOS_API_KEY', 'dummy_api_key') 
    os.environ.setdefault('PAYOS_CHECKSUM_KEY', 'dummy_checksum_key')
    
    app = create_app()
    
    with app.app_context():
        print("🔄 Bắt đầu tạo dữ liệu mẫu...")
        
        # Xóa dữ liệu cũ (cẩn thận: chỉ dùng cho development)
        print("🧹 Đang xóa dữ liệu cũ...")
        db.session.query(BienTheSanPham).delete()
        db.session.query(SanPham).delete()
        db.session.query(DanhMuc).delete()
        db.session.query(ThuongHieu).delete()
        db.session.query(CapDo).delete()
        db.session.query(DiaChi).delete()
        db.session.query(NguoiDung).delete()
        
        try:
            # ==================== TẠO DANH MỤC ====================
            print("📁 Đang tạo danh mục...")
            danh_muc_list = [
                DanhMuc(ma_danh_muc="DM001", ten_danh_muc="Máy ảnh DSLR"),
                DanhMuc(ma_danh_muc="DM002", ten_danh_muc="Máy ảnh Mirrorless"),
                DanhMuc(ma_danh_muc="DM003", ten_danh_muc="Ống kính"),
                DanhMuc(ma_danh_muc="DM004", ten_danh_muc="Máy ảnh Compact"),
                DanhMuc(ma_danh_muc="DM005", ten_danh_muc="Thiết bị quay phim"),
                DanhMuc(ma_danh_muc="DM006", ten_danh_muc="Đèn Flash"),
                DanhMuc(ma_danh_muc="DM007", ten_danh_muc="Tripod"),
                DanhMuc(ma_danh_muc="DM008", ten_danh_muc="Balô & Túi đựng"),
                DanhMuc(ma_danh_muc="DM009", ten_danh_muc="Phụ kiện"),
                DanhMuc(ma_danh_muc="DM010", ten_danh_muc="Drone")
            ]
            
            for dm in danh_muc_list:
                db.session.add(dm)
            db.session.commit()
            print("✅ Đã tạo danh mục")
            
            # ==================== TẠO THƯƠNG HIỆU ====================
            print("🏷️ Đang tạo thương hiệu...")
            thuong_hieu_list = [
                ThuongHieu(ma_thuong_hieu="TH001", ten_thuong_hieu="Canon"),
                ThuongHieu(ma_thuong_hieu="TH002", ten_thuong_hieu="Nikon"), 
                ThuongHieu(ma_thuong_hieu="TH003", ten_thuong_hieu="Sony"),
                ThuongHieu(ma_thuong_hieu="TH004", ten_thuong_hieu="Fujifilm"),
                ThuongHieu(ma_thuong_hieu="TH005", ten_thuong_hieu="Panasonic"),
                ThuongHieu(ma_thuong_hieu="TH006", ten_thuong_hieu="Olympus"),
                ThuongHieu(ma_thuong_hieu="TH007", ten_thuong_hieu="GoPro"),
                ThuongHieu(ma_thuong_hieu="TH008", ten_thuong_hieu="DJI"),
                ThuongHieu(ma_thuong_hieu="TH009", ten_thuong_hieu="Sigma"),
                ThuongHieu(ma_thuong_hieu="TH010", ten_thuong_hieu="Tamron")
            ]
            
            for th in thuong_hieu_list:
                db.session.add(th)
            db.session.commit()
            print("✅ Đã tạo thương hiệu")
            
            # ==================== TẠO CẤP ĐỘ ====================
            print("📊 Đang tạo cấp độ...")
            cap_do_list = [
                CapDo(ma_cap_do="CD001", ten_cap_do="Mới bắt đầu"),
                CapDo(ma_cap_do="CD002", ten_cap_do="Nghiệp dư"),
                CapDo(ma_cap_do="CD003", ten_cap_do="Bán chuyên"),
                CapDo(ma_cap_do="CD004", ten_cap_do="Chuyên nghiệp"),
                CapDo(ma_cap_do="CD005", ten_cap_do="Cao cấp"),
                CapDo(ma_cap_do="CD006", ten_cap_do="Nhà nhiếp ảnh"),
                CapDo(ma_cap_do="CD007", ten_cap_do="Studio"),
                CapDo(ma_cap_do="CD008", ten_cap_do="Quay phim"),
                CapDo(ma_cap_do="CD009", ten_cap_do="Du lịch"),
                CapDo(ma_cap_do="CD010", ten_cap_do="Thiên nhiên")
            ]
            
            for cd in cap_do_list:
                db.session.add(cd)
            db.session.commit()
            print("✅ Đã tạo cấp độ")
            
            # ==================== TẠO SẢN PHẨM ====================
            print("📦 Đang tạo sản phẩm...")
            san_pham_list = [
                SanPham(
                    ma_san_pham="SP001",
                    danh_muc_id=1,
                    thuong_hieu_id=1, 
                    cap_do_id=4,
                    ten_san_pham="Canon EOS R5",
                    mo_ta="Máy ảnh mirrorless chuyên nghiệp",
                    thong_so_ky_thuat={"Cảm biến": "Full-frame 45MP", "ISO": "100-51200"}
                ),
                SanPham(
                    ma_san_pham="SP002", 
                    danh_muc_id=1,
                    thuong_hieu_id=2,
                    cap_do_id=4,
                    ten_san_pham="Nikon Z9",
                    mo_ta="Flagship mirrorless cho nhiếp ảnh thể thao",
                    thong_so_ky_thuat={"Cảm biến": "Stacked CMOS 45.7MP", "Tốc độ chụp": "20 fps"}
                ),
                SanPham(
                    ma_san_pham="SP003",
                    danh_muc_id=2,
                    thuong_hieu_id=3,
                    cap_do_id=3,
                    ten_san_pham="Sony A7 III", 
                    mo_ta="Máy ảnh full-frame đa năng",
                    thong_so_ky_thuat={"Cảm biến": "24.2MP", "Ổn định hình ảnh": "5 trục"}
                ),
                SanPham(
                    ma_san_pham="SP004",
                    danh_muc_id=3,
                    thuong_hieu_id=1,
                    cap_do_id=4,
                    ten_san_pham="Canon RF 24-70mm f/2.8",
                    mo_ta="Ống kính zoom tiêu chuẩn chuyên nghiệp",
                    thong_so_ky_thuat={"Khẩu độ": "f/2.8", "Tiêu cự": "24-70mm"}
                ),
                SanPham(
                    ma_san_pham="SP005",
                    danh_muc_id=3,
                    thuong_hieu_id=9,
                    cap_do_id=4,
                    ten_san_pham="Sigma 85mm f/1.4",
                    mo_ta="Ống kính chân dung cao cấp",
                    thong_so_ky_thuat={"Khẩu độ": "f/1.4", "Trọng lượng": "1130g"}
                ),
                SanPham(
                    ma_san_pham="SP006",
                    danh_muc_id=4,
                    thuong_hieu_id=7,
                    cap_do_id=2,
                    ten_san_pham="GoPro Hero 11",
                    mo_ta="Máy quay hành động 4K",
                    thong_so_ky_thuat={"Độ phân giải": "4K", "Chống nước": "10m"}
                ),
                SanPham(
                    ma_san_pham="SP007",
                    danh_muc_id=5,
                    thuong_hieu_id=8,
                    cap_do_id=4,
                    ten_san_pham="DJI Ronin-S",
                    mo_ta="Gimbal stabilizer chuyên nghiệp",
                    thong_so_ky_thuat={"Tải trọng": "3.6kg", "Pin": "12 giờ"}
                ),
                SanPham(
                    ma_san_pham="SP008",
                    danh_muc_id=6,
                    thuong_hieu_id=1,
                    cap_do_id=3,
                    ten_san_pham="Canon Speedlite 600EX",
                    mo_ta="Đèn flash tốc độ cao",
                    thong_so_ky_thuat={"GN": "60m", "Xoay": "360 độ"}
                ),
                SanPham(
                    ma_san_pham="SP009",
                    danh_muc_id=7,
                    thuong_hieu_id=6,
                    cap_do_id=2,
                    ten_san_pham="Manfrotto 190X",
                    mo_ta="Tripod nhôm chắc chắn",
                    thong_so_ky_thuat={"Chiều cao": "150cm", "Trọng lượng": "2.1kg"}
                ),
                SanPham(
                    ma_san_pham="SP010",
                    danh_muc_id=8,
                    thuong_hieu_id=5,
                    cap_do_id=1,
                    ten_san_pham="Lowepro ProTactic 450",
                    mo_ta="Ba lô máy ảnh đa năng",
                    thong_so_ky_thuat={"Kích thước": "30x45x25cm", "Ngăn chứa": "15"}
                )
            ]
            
            for sp in san_pham_list:
                db.session.add(sp)
            db.session.commit()
            print("✅ Đã tạo sản phẩm")
            
            # ==================== TẠO BIẾN THỂ SẢN PHẨM ====================
            print("🎨 Đang tạo biến thể sản phẩm...")
            bien_the_list = [
                BienTheSanPham(san_pham_id=1, ten_bien_the="Body Only", gia_ban=38990000, so_luong=5, mau="Đen"),
                BienTheSanPham(san_pham_id=1, ten_bien_the="Kit 24-105mm", gia_ban=45990000, so_luong=3, mau="Đen"),
                BienTheSanPham(san_pham_id=2, ten_bien_the="Body Only", gia_ban=42990000, so_luong=4, mau="Đen"),
                BienTheSanPham(san_pham_id=3, ten_bien_the="Body Only", gia_ban=23990000, so_luong=8, mau="Đen"),
                BienTheSanPham(san_pham_id=4, ten_bien_the="RF 24-70mm", gia_ban=25990000, so_luong=6, mau="Đen"),
                BienTheSanPham(san_pham_id=5, ten_bien_the="Sigma 85mm", gia_ban=15990000, so_luong=7, mau="Bạc"),
                BienTheSanPham(san_pham_id=6, ten_bien_the="GoPro Hero 11", gia_ban=8990000, so_luong=15, mau="Đen"),
                BienTheSanPham(san_pham_id=7, ten_bien_the="DJI Ronin-S", gia_ban=11990000, so_luong=4, mau="Đen"),
                BienTheSanPham(san_pham_id=8, ten_bien_the="Speedlite 600EX", gia_ban=7990000, so_luong=10, mau="Đen"),
                BienTheSanPham(san_pham_id=9, ten_bien_the="Manfrotto 190X", gia_ban=4590000, so_luong=12, mau="Đen")
            ]
            
            for bt in bien_the_list:
                db.session.add(bt)
            db.session.commit()
            print("✅ Đã tạo biến thể sản phẩm")
            
            # ==================== TẠO HÌNH ẢNH SẢN PHẨM ====================
            print("🖼️ Đang tạo hình ảnh sản phẩm...")
            hinh_anh_list = [
                HinhAnhSanPham(bien_the_id=1, url="https://example.com/canon-r5-1.jpg", alt_text="Canon EOS R5 Body", thu_tu=1, la_anh_dai_dien=True),
                HinhAnhSanPham(bien_the_id=1, url="https://example.com/canon-r5-2.jpg", alt_text="Canon EOS R5 Góc nghiêng", thu_tu=2, la_anh_dai_dien=False),
                HinhAnhSanPham(bien_the_id=2, url="https://example.com/nikon-z9-1.jpg", alt_text="Nikon Z9 Body", thu_tu=1, la_anh_dai_dien=True),
                HinhAnhSanPham(bien_the_id=3, url="https://example.com/sony-a7iii-1.jpg", alt_text="Sony A7 III Body", thu_tu=1, la_anh_dai_dien=True),
                HinhAnhSanPham(bien_the_id=4, url="https://example.com/canon-24-70.jpg", alt_text="Canon RF 24-70mm", thu_tu=1, la_anh_dai_dien=True),
                HinhAnhSanPham(bien_the_id=5, url="https://example.com/sigma-85mm.jpg", alt_text="Sigma 85mm f/1.4", thu_tu=1, la_anh_dai_dien=True),
                HinhAnhSanPham(bien_the_id=6, url="https://example.com/gopro-11.jpg", alt_text="GoPro Hero 11", thu_tu=1, la_anh_dai_dien=True),
                HinhAnhSanPham(bien_the_id=7, url="https://example.com/dji-ronin.jpg", alt_text="DJI Ronin-S", thu_tu=1, la_anh_dai_dien=True),
                HinhAnhSanPham(bien_the_id=8, url="https://example.com/canon-flash.jpg", alt_text="Canon Speedlite 600EX", thu_tu=1, la_anh_dai_dien=True),
                HinhAnhSanPham(bien_the_id=9, url="https://example.com/manfrotto.jpg", alt_text="Manfrotto 190X Tripod", thu_tu=1, la_anh_dai_dien=True)
            ]
            
            for ha in hinh_anh_list:
                db.session.add(ha)
            db.session.commit()
            print("✅ Đã tạo hình ảnh sản phẩm")
            
            # ==================== TẠO NGƯỜI DÙNG ====================
            print("👥 Đang tạo người dùng...")
            mat_khau_hash = generate_password_hash("12345678")
            admin_mat_khau_hash = generate_password_hash("admin123")
            
            nguoi_dung_list = [
                # Khách hàng
                NguoiDung(
                    ma_nguoi_dung="KH001",
                    ho_ten="Nguyễn Văn An",
                    email="an.nguyen@email.com", 
                    mat_khau_hash=mat_khau_hash,
                    so_dien_thoai="0912345678",
                    vai_tro="khach_hang",
                    trang_thai="kich_hoat"
                ),
                NguoiDung(
                    ma_nguoi_dung="KH002",
                    ho_ten="Trần Thị Bình", 
                    email="binh.tran@email.com",
                    mat_khau_hash=mat_khau_hash,
                    so_dien_thoai="0923456789",
                    vai_tro="khach_hang",
                    trang_thai="kich_hoat"
                ),
                NguoiDung(
                    ma_nguoi_dung="KH003",
                    ho_ten="Lê Văn Cường",
                    email="cuong.le@email.com",
                    mat_khau_hash=mat_khau_hash,
                    so_dien_thoai="0934567890",
                    vai_tro="khach_hang",
                    trang_thai="kich_hoat"
                ),
                NguoiDung(
                    ma_nguoi_dung="KH004",
                    ho_ten="Phạm Thị Dung",
                    email="dung.pham@email.com",
                    mat_khau_hash=mat_khau_hash,
                    so_dien_thoai="0945678901",
                    vai_tro="khach_hang",
                    trang_thai="kich_hoat"
                ),
                # Admin
                NguoiDung(
                    ma_nguoi_dung="AD001", 
                    ho_ten="Admin Quản Trị",
                    email="admin@camerastore.com",
                    mat_khau_hash=admin_mat_khau_hash,
                    so_dien_thoai="0990123456",
                    vai_tro="quan_tri_vien", 
                    trang_thai="kich_hoat"
                ),
                NguoiDung(
                    ma_nguoi_dung="AD002",
                    ho_ten="Quản Lý Kho",
                    email="kho@camerastore.com",
                    mat_khau_hash=admin_mat_khau_hash,
                    so_dien_thoai="0991234567",
                    vai_tro="quan_tri_vien",
                    trang_thai="kich_hoat"
                )
            ]
            
            for nd in nguoi_dung_list:
                db.session.add(nd)
            db.session.commit()
            print("✅ Đã tạo người dùng")
            
            # ==================== TẠO ĐỊA CHỈ ====================
            print("🏠 Đang tạo địa chỉ...")
            dia_chi_list = [
                DiaChi(
                    nguoi_dung_id=1,
                    ten_nguoi_nhan="Nguyễn Văn An",
                    so_dien_thoai="0912345678", 
                    dia_chi_cu_the="123 Đường ABC",
                    phuong_xa="Phường 1",
                    tinh_thanh="TP.HCM",
                    la_mac_dinh=True
                ),
                DiaChi(
                    nguoi_dung_id=2,
                    ten_nguoi_nhan="Trần Thị Bình", 
                    so_dien_thoai="0923456789",
                    dia_chi_cu_the="456 Đường XYZ",
                    phuong_xa="Phường 2", 
                    tinh_thanh="Hà Nội",
                    la_mac_dinh=True
                ),
                DiaChi(
                    nguoi_dung_id=3,
                    ten_nguoi_nhan="Lê Văn Cường",
                    so_dien_thoai="0934567890",
                    dia_chi_cu_the="789 Đường DEF",
                    phuong_xa="Phường 3",
                    tinh_thanh="Đà Nẵng",
                    la_mac_dinh=True
                ),
                DiaChi(
                    nguoi_dung_id=4,
                    ten_nguoi_nhan="Phạm Thị Dung",
                    so_dien_thoai="0945678901",
                    dia_chi_cu_the="321 Đường GHI",
                    phuong_xa="Phường 4",
                    tinh_thanh="Cần Thơ",
                    la_mac_dinh=True
                )
            ]
            
            for dc in dia_chi_list:
                db.session.add(dc)
            db.session.commit()
            print("✅ Đã tạo địa chỉ")
            
            # ==================== TẠO GIỎ HÀNG ====================
            print("🛒 Đang tạo giỏ hàng...")
            gio_hang_list = [
                GioHang(nguoi_dung_id=1),
                GioHang(nguoi_dung_id=2),
                GioHang(nguoi_dung_id=3),
                GioHang(nguoi_dung_id=4)
            ]
            
            for gh in gio_hang_list:
                db.session.add(gh)
            db.session.commit()
            print("✅ Đã tạo giỏ hàng")
            
            # ==================== TẠO CHI TIẾT GIỎ HÀNG ====================
            print("📝 Đang tạo chi tiết giỏ hàng...")
            chi_tiet_gio_hang_list = [
                ChiTietGioHang(gio_hang_id=1, bien_the_san_pham_id=1, so_luong=1),
                ChiTietGioHang(gio_hang_id=1, bien_the_san_pham_id=4, so_luong=1),
                ChiTietGioHang(gio_hang_id=2, bien_the_san_pham_id=3, so_luong=1),
                ChiTietGioHang(gio_hang_id=3, bien_the_san_pham_id=5, so_luong=2),
                ChiTietGioHang(gio_hang_id=4, bien_the_san_pham_id=6, so_luong=1)
            ]
            
            for ctgh in chi_tiet_gio_hang_list:
                db.session.add(ctgh)
            db.session.commit()
            print("✅ Đã tạo chi tiết giỏ hàng")
            
            print("\n🎉 TẤT CẢ DỮ LIỆU MẪU ĐÃ ĐƯỢC TẠO THÀNH CÔNG!")
            print("\n📋 THÔNG TIN ĐĂNG NHẬP:")
            print("👤 Khách hàng 1: an.nguyen@email.com / 12345678")
            print("👤 Khách hàng 2: binh.tran@email.com / 12345678") 
            print("👤 Khách hàng 3: cuong.le@email.com / 12345678")
            print("👤 Khách hàng 4: dung.pham@email.com / 12345678")
            print("👑 Admin: admin@camerastore.com / admin123")
            print("👑 Quản lý kho: kho@camerastore.com / admin123")
            
            print("\n🛒 BIẾN THỂ SẢN PHẨM (ID - Tên - Giá - Số lượng):")
            for i, bt in enumerate(bien_the_list, 1):
                print(f"   {bt.id}. {bt.ten_bien_the} - {bt.gia_ban:,} VND - {bt.so_luong} cái")
                
        except Exception as e:
            print(f"❌ Lỗi khi tạo dữ liệu: {str(e)}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    seed_data()