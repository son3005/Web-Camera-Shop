# backend/app/routes/thanhtoan_routes.py
from decimal import Decimal
import json
import time
import threading
from flask import request, jsonify, current_app as app
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_openapi3 import APIBlueprint, Tag

from ..schemas.giohang_dathang.DonHangAoRequest import DonHangAoCreateRequest
from ..services.kho_service import KhoService
from ..models.enums import PhuongThucThanhToanEnum
from ..services.donhang_ao_service import DonHangAoService
from ..services.donhang_that_service import DonHangThatService
from ..models.redis_models import DonHangAoCreate, DonHangAoResponse
from ..extensions import db, redis
from  payos import PayOS
import os
payos_client = PayOS(
    client_id= os.environ.get('PAYOS_CLIENT_ID'),
    api_key= os.environ.get('PAYOS_API_KEY'),
    checksum_key= os.environ.get('PAYOS_CHECKSUM_KEY')
)

thanhtoan_api = APIBlueprint('thanhtoan', __name__, url_prefix='/thanh-toan')
tag = Tag(name="Thanh Toán", description="Quản lý thanh toán và đơn hàng ảo")


# === XỬ LÝ ĐƠN PAID (FIXED APPLICATION CONTEXT) ===
def process_paid_order(don_ao_id: str, app_instance, redis_client, payos_client, db_session):
    """Xử lý đơn hàng đã thanh toán với application context"""
    with app_instance.app_context():
        service = DonHangAoService(redis_client, payos_client, db_session)
        real_service = DonHangThatService(db_session)
        kho = KhoService(redis_client, db_session)

        app_instance.logger.info(f"XỬ LÝ ĐƠN PAID (ID Ảo: {don_ao_id})")
        
        # Lấy đơn ảo trực tiếp, không cần scan
        don_ao = service.lay_don_hang_ao(don_ao_id)

        if not don_ao:
            app_instance.logger.warning(f"Không tìm thấy đơn ảo: {don_ao_id} để xử lý PAID")
            return

        try:
            result = real_service.chuyen_doi_don_hang_that(don_ao, kho)
            service.xoa_don_hang_ao(don_ao_id)
            app_instance.logger.info(f"HOÀN TẤT ĐƠN THẬT: {result['ma_don_hang']}")
        except Exception as e:
            app_instance.logger.error(f"Lỗi tạo đơn thật từ đơn ảo {don_ao_id}: {e}")

# === CHECK STATUS (FIXED APPLICATION CONTEXT) ===
def check_order_status(order_code: str, don_ao_id: str, app_instance, redis_client, payos_client, db_session):
    """Check trạng thái thanh toán với application context"""
    with app_instance.app_context():
        start = time.time()
        service = DonHangAoService(redis_client, payos_client, db_session)

        app_instance.logger.info(f"BẮT ĐẦU POLLING: Đơn {order_code} (ID Ảo: {don_ao_id})")

        while time.time() - start < 300:  # 5 phút
            try:
                app_instance.logger.debug(f"Polling {order_code}...")
                
                
                payment_info = payos_client.payment_requests.get(order_code)
                
                status = payment_info.status
                app_instance.logger.info(f"Trạng thái PayOS: {status} cho order {order_code}")

                if status == "PAID":
                    app_instance.logger.info(f"TRẠNG THÁI PAID: Đơn {order_code}")
                    # Gọi hàm đã tối ưu với application context
                    process_paid_order(don_ao_id, app_instance, redis_client, payos_client, db_session)
                    return

                if status in ["CANCELLED", "EXPIRED"]:
                    app_instance.logger.info(f"Đơn {order_code} bị hủy ({status}) → giải phóng kho")
                    service.xu_ly_thanh_toan_that_bai(don_ao_id)
                    return

                # Nếu là PENDING, không làm gì cả, lặp tiếp
                app_instance.logger.debug(f"Đơn {order_code} vẫn đang ở trạng thái {status}")

            except Exception as e:
                app_instance.logger.error(f"Lỗi check đơn {order_code}: {e}")

            time.sleep(10)

        # Hết 5 phút → giải phóng
        app_instance.logger.warning(f"Đơn {order_code} hết hạn → giải phóng kho")
        service.xu_ly_thanh_toan_that_bai(don_ao_id)

# === TẠO ĐƠN HÀNG ẢO (FIXED THREAD CONTEXT) ===
@thanhtoan_api.post('/tao-don-hang-ao', tags=[tag])
@jwt_required()
def tao_don_hang_ao():
    try:
        body = request.get_json()
        current_user = get_jwt_identity()
        
        # Validate dữ liệu đầu vào
        required_fields = ['ten_nguoi_nhan', 'so_dien_thoai_nguoi_nhan', 'dia_chi_giao', 'phuong_thuc_thanh_toan', 'items']
        for field in required_fields:
            if field not in body:
                return jsonify({"error": f"Thiếu trường bắt buộc: {field}"}), 400
        
        # Thêm ID người dùng và set mặc định phí vận chuyển
        body['id_nguoi_dung'] = int(current_user)
        body['phi_van_chuyen'] = body.get('phi_van_chuyen', 2000)

        # XỬ LÝ COD: TẠO LUÔN ĐƠN HÀNG THẬT, KHÔNG QUA ĐƠN ẢO
        if body.get('phuong_thuc_thanh_toan') == 'cod':
            kho_service = KhoService(redis, db)
            real_service = DonHangThatService(db)
            
            # Kiểm tra và lock số lượng
            success, items_enriched, error_msg = kho_service.kiem_tra_va_lock_so_luong(body['items'])
            if not success:
                return jsonify({"error": error_msg}), 400

            try:
                # Tạo đối tượng đơn hàng tạm thời để chuyển đổi
                don_hang_temp = {
                    'id_nguoi_dung': body['id_nguoi_dung'],
                    'id_dia_chi': body.get('id_dia_chi'),
                    'ten_nguoi_nhan': body['ten_nguoi_nhan'],
                    'so_dien_thoai_nguoi_nhan': body['so_dien_thoai_nguoi_nhan'],
                    'dia_chi_giao': body['dia_chi_giao'],
                    'phuong_thuc_thanh_toan': body['phuong_thuc_thanh_toan'],
                    'phi_van_chuyen': Decimal(str(body.get('phi_van_chuyen', 2000))),
                    'ghi_chu': body.get('ghi_chu'),
                    'items': body['items'],
                    'items_enriched': items_enriched,
                    'tong_tien': Decimal('0.0')  # Sẽ được tính trong service
                }
                
                # Tính tổng tiền
                tong_tien = Decimal('0.0')
                for item in items_enriched:
                    don_gia_item = Decimal(item['don_gia'])
                    tong_tien += don_gia_item * item['so_luong']
                tong_tien += Decimal(str(body.get('phi_van_chuyen', 2000)))
                don_hang_temp['tong_tien'] = tong_tien

                # Tạo đơn hàng thật trực tiếp
                result = real_service.tao_don_hang_that_truc_tiep(don_hang_temp, kho_service)
                
                response = {
                    "message": "Tạo đơn hàng COD thành công",
                    "data": result
                }
                return jsonify(response), 200

            except Exception as e:
                # Nếu có lỗi, giải phóng lock
                kho_service.giai_phong_lock(items_enriched)
                raise e

        else:
            # PayOS: vẫn tạo đơn hàng ảo như bình thường
            service = DonHangAoService(redis, payos_client, db)
            don_ao = service.tao_don_hang_ao(body)

            response = {
                "message": "Tạo đơn hàng ảo thành công",
                "data": don_ao.model_dump()
            }

            # Kích hoạt check thanh toán cho PayOS QR
            if body.get('phuong_thuc_thanh_toan') == 'payos_qr' and don_ao.ma_giao_dich_payos:
                app.logger.info(f"KÍCH HOẠT CHECK PAYOS CHO ĐƠN: {don_ao.ma_giao_dich_payos}")
                
                threading.Thread(
                    target=check_order_status,
                    args=(
                        don_ao.ma_giao_dich_payos, 
                        don_ao.id,
                        app._get_current_object(),
                        redis,
                        payos_client,
                        db
                    ),
                    daemon=True
                ).start()

            return jsonify(response), 200

    except Exception as e:
        app.logger.error(f"Lỗi tạo đơn: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 400
    

@thanhtoan_api.get('/kiem-tra-don-hang-ao/<string:don_hang_ao_id>', tags=[tag])
@jwt_required()
def kiem_tra_don_hang_ao(don_hang_ao_id: str):
    service = DonHangAoService(redis, app.payos_client, db)
    don_ao = service.lay_don_hang_ao(don_hang_ao_id)
    if not don_ao:
        return jsonify({"error": "Đơn không tồn tại"}), 404
    return jsonify({"data": don_ao.model_dump()}), 200
