'''mermaid
classDiagram
%% ========== CORE ENTITIES WITH API OPERATIONS ==========
class NguoiDung {
+Integer id
+String ma_nguoi_dung
+String ho_ten
+String email
+VaiTroNguoiDungEnum vai_tro

        +dang_nhap(email, mat_khau) LoginResponse
        +dang_ky(user_data) RegisterResponse
        +quen_mat_khau(email) void
        +dat_lai_mat_khau(token, new_password) void
        +lay_nguoi_dung_hien_tai() NguoiDungResponse
        +cap_nhat_ho_so(user_data) NguoiDungResponse
        +doi_mat_khau(current_pw, new_pw) void
        +xac_thuc_mat_khau_hien_tai(password) boolean
    }

    class SanPham {
        +Integer id
        +String ma_san_pham
        +String ten_san_pham
        +Numeric so_sao_trung_binh
        +Integer so_luong_danh_gia

        +lay_tat_ca(page, per_page, filters) SanPhamListResponse
        +lay_theo_id(san_pham_id) SanPhamResponse
        +tao_kem_hinh_anh(product_data, files) SanPhamResponse
        +cap_nhat_kem_hinh_anh(san_pham_id, product_data, files) SanPhamResponse
        +xoa(san_pham_id) DeleteResponse
        +lay_danh_sach_co_ban() SanPhamBasicListResponse
    }

    class BienTheSanPham {
        +Integer id
        +String ten_bien_the
        +Numeric gia_ban
        +Integer so_luong_nhap
        +Integer so_luong_ban

        +lay_co_ban_theo_san_pham(san_pham_id) BienTheBasicListResponse
    }

    class GioHang {
        +Integer id

        +lay_gio_hang() GioHangResponse
        +them_san_pham(bien_the_id, so_luong) GioHangResponse
        +cap_nhat_so_luong(chi_tiet_id, so_luong) GioHangResponse
        +xoa_san_pham(chi_tiet_id) GioHangResponse
        +kiem_tra_ton_kho(bien_the_id, so_luong) boolean
        +lay_san_pham_thanh_toan() CheckoutResponse
    }

    class ChiTietGioHang {
        +Integer id
        +Integer bien_the_id
        +Integer so_luong
    }

    class DonHang {
        +Integer id
        +String ma_don_hang
        +TrangThaiDonHangEnum trang_thai

        +lay_tat_ca_admin(filters) DonHangResponse[]
        +lay_chi_tiet(don_hang_id) DonHangResponse
        +cap_nhat_trang_thai(don_hang_id, new_status, ly_do) void
        +cap_nhat_trang_thai_thanh_toan(don_hang_id, payment_status) void
        +huy_don_hang(don_hang_id, ly_do) void
        +yeu_cau_tra_hang(don_hang_id, ly_do) void
        +lay_don_hang_cua_khach() DonHangResponse[]
    }

    class ChiTietDonHang {
        +Integer id
        +Integer bien_the_id
        +Integer so_luong
        +Numeric don_gia_tai_thoi_diem
    }

    class DanhGia {
        +Integer id
        +Integer diem_danh_gia
        +TrangThaiDanhGiaEnum trang_thai

        +lay_theo_san_pham(san_pham_id, filters) DanhGiaResponse[]
        +lay_thong_ke(san_pham_id) ThongKeResponse
        +lay_danh_gia_cua_toi(filters) DanhGiaResponse[]
        +tao_moi(review_data) DanhGiaResponse
        +cap_nhat(danh_gia_id, update_data) DanhGiaResponse
        +xoa(danh_gia_id) void
        +lay_tat_ca_admin(filters) DanhGiaResponse[]
        +duyet_danh_gia(danh_gia_id) void
        +tu_choi_danh_gia(danh_gia_id) void
        +lay_thong_ke_danh_gia() ThongKeTongQuan
    }

    class DiaChi {
        +Integer id
        +String dia_chi_cu_the
        +Boolean la_mac_dinh

        +lay_tat_ca(page, per_page) DiaChiListResponse
        +lay_theo_id(dia_chi_id) DiaChiResponse
        +tao_moi(address_data) DiaChiResponse
        +cap_nhat(dia_chi_id, update_data) DiaChiResponse
        +xoa(dia_chi_id) DeleteResponse
        +dat_lam_mac_dinh(dia_chi_id) DiaChiResponse
        +lay_mac_dinh() DiaChiResponse
    }

    class ThanhToan {
        +Integer id
        +PhuongThucThanhToanEnum phuong_thuc
        +TrangThaiThanhToanEnum trang_thai

        +tao_don_hang_ao(order_data) DonHangAoResponse
        +kiem_tra_trang_thai_don_hang(order_code, don_ao_id) void
        +xac_minh_don_hang_ao(don_ao_id) DonHangAoResponse
        +xu_ly_don_hang_da_thanh_toan(don_ao_id) void
    }

    class PhieuThu {
        +Integer id
        +String ma_phieu_thu
        +String ten_nha_cung_cap

        +tao_moi(receipt_data) PhieuThuResponse
        +cap_nhat(phieu_thu_id, update_data) PhieuThuResponse
        +lay_theo_id(phieu_thu_id) PhieuThuResponse
        +lay_tat_ca(filters) PhieuThuListResponse
        +lay_thong_ke(year, month) ThongKeNhapHang
    }

    %% ========== CATALOG MANAGEMENT ==========
    class DanhMuc {
        +Integer id
        +String ma_danh_muc
        +String ten_danh_muc

        +lay_tat_ca(page, per_page) DanhMucListResponse
        +lay_theo_id(danh_muc_id) DanhMucResponse
        +tao_moi(category_data) DanhMucResponse
        +cap_nhat(danh_muc_id, update_data) DanhMucResponse
        +xoa(danh_muc_id) DeleteResponse
        +kiem_tra_su_dung(danh_muc_id) UsageCheckResponse
    }

    class ThuongHieu {
        +Integer id
        +String ma_thuong_hieu
        +String ten_thuong_hieu

        +lay_tat_ca(page, per_page) ThuongHieuListResponse
        +lay_theo_id(thuong_hieu_id) ThuongHieuResponse
        +tao_moi(brand_data) ThuongHieuResponse
        +cap_nhat(thuong_hieu_id, update_data) ThuongHieuResponse
        +xoa(thuong_hieu_id) DeleteResponse
        +kiem_tra_su_dung(thuong_hieu_id) UsageCheckResponse
    }

    class CapDo {
        +Integer id
        +String ma_cap_do
        +String ten_cap_do

        +lay_tat_ca(page, per_page) CapDoListResponse
        +lay_theo_id(cap_do_id) CapDoResponse
        +tao_moi(level_data) CapDoResponse
        +cap_nhat(cap_do_id, update_data) CapDoResponse
        +xoa(cap_do_id) DeleteResponse
        +kiem_tra_su_dung(cap_do_id) UsageCheckResponse
    }

    %% ========== ADMIN MANAGEMENT ==========
    class KhachHang {
        +lay_tat_ca(page, per_page, filters) KhachHangListResponse
        +lay_chi_tiet(khach_hang_id) KhachHangDetailResponse
        +cap_nhat_trang_thai(khach_hang_id, new_status) NguoiDungResponse
        +khoa_tai_khoan(khach_hang_id) NguoiDungResponse
        +kich_hoat_tai_khoan(khach_hang_id) NguoiDungResponse
    }

    class ThongKe {
        +lay_thong_ke_tong_quan() TongHopThongKe
        +lay_thong_ke_doanh_thu(year, month) DoanhThuThongKe
        +lay_thong_ke_nguoi_dung(year, month) NguoiDungThongKe
        +lay_thong_ke_don_hang(year, month) DonHangThongKe
        +lay_thong_ke_thuong_hieu(year, month) ThuongHieuThongKe
        +lay_thong_ke_dang_nhap(year, month) DangNhapThongKe
        +lay_thong_ke_danh_gia(year, month) DanhGiaThongKe
    }

    class UploadService {
        +tai_len_hinh_anh(file, folder) UploadResponse
        +lay_chu_ky_upload(folder) SignatureResponse
    }

    %% ========== RELATIONSHIPS (ĐÃ DỊCH) ==========
    %% Đảm bảo có một dòng trống sau class 'UploadService'

    NguoiDung ||--o{ DonHang : "dat_hang"
    NguoiDung ||--|| GioHang : "so_huu"
    NguoiDung ||--o{ DiaChi : "co"
    NguoiDung ||--o{ DanhGia : "viet"

    SanPham }o--|| DanhMuc : "thuoc_ve"
    SanPham }o--|| ThuongHieu : "thuoc_ve"
    SanPham }o--|| CapDo : "thuoc_ve"
    SanPham ||--o{ BienTheSanPham : "co"
    SanPham ||--o{ DanhGia : "nhan"

    BienTheSanPham ||--o{ ChiTietGioHang : "trong_gio_hang"
    BienTheSanPham ||--o{ ChiTietDonHang : "trong_don_hang"

    DonHang ||--|| ThanhToan : "co_thanh_toan"
    DonHang ||--o{ ChiTietDonHang : "chua"

    GioHang ||--o{ ChiTietGioHang : "chua"

    %% Service relationships (Đã dịch)
    NguoiDung ..> KhachHang : "quan_ly"
    SanPham ..> UploadService : "su_dung"
    DonHang ..> ThanhToan : "xu_ly"

'''
