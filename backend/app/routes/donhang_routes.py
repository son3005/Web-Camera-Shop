# /backend/app/routes/don_hang_routes.py
from flask import request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.enums import PhuongThucThanhToanEnum, TrangThaiDonHangEnum
from flask_openapi3 import APIBlueprint, Tag

from ..extensions import db
from ..models import DonHang, ThanhToan
from ..services.redis_session_service import RedisSessionService
from ..services.donhang_service import DonHangService
from ..schemas.giohang_dathang.DonHang import DonHangCreate, DonHangResponse
from ..schemas.giohang_dathang.ThanhToan import ThanhToanResponse
from ..schemas.giohang_dathang import DonHangStatusUpdate, OrderCancelRequest

# Tạo blueprint
don_hang_api = APIBlueprint('don_hang', __name__, url_prefix='/api/don-hang')
tag = Tag(name="Đơn hàng", description="Quản lý đơn hàng")

@don_hang_api.post('/checkout/cart')
@jwt_required()
def checkout_from_cart():
    """
    Thực hiện checkout từ giỏ hàng (cart) của người dùng hiện tại dựa trên session lưu trong Redis.

    Mô tả chi tiết:
    - Yêu cầu: endpoint này được bảo vệ bằng JWT (@jwt_required()). Hàm đọc identity của user từ token bằng get_jwt_identity().
    - Lấy session giỏ hàng: sử dụng RedisSessionService.get_session('cart', f'user_{current_user_id}') để truy vấn session giỏ hàng tương ứng với người dùng. 
        - Kỳ vọng cấu trúc của cart_session: phải chứa ít nhất:
            - 'session_id': một định danh của session giỏ hàng (chuỗi).
            - 'items': danh sách hoặc cấu trúc chứa các mục trong giỏ (thường là danh sách các dict mỗi mục có product_id, quantity, ...). Nếu 'items' trống hoặc không tồn tại => coi là giỏ trống.
    - Kiểm tra giỏ hàng rỗng: nếu không có cart_session hoặc cart_session.get('items') là rỗng, hàm trả về JSON lỗi {'error': 'Giỏ hàng trống'} với HTTP status 400.
    - Tạo checkout session: nếu giỏ có hàng, gọi RedisSessionService.create_checkout_session(session_id, payload) để tạo một checkout session mới trong Redis. Payload truyền gồm:
        - 'user_id': id người dùng hiện tại,
        - 'items': danh sách mục từ cart_session['items'],
        - 'type': 'cart' (đánh dấu nguồn là giỏ hàng).
        - Hàm create_checkout_session trả về một checkout_id (định danh của phiên checkout vừa tạo).
    - Phản hồi thành công: trả về JSON {'checkout_id': checkout_id, 'message': 'Checkout session created'} với HTTP status 200.
    - Xử lý lỗi: mọi ngoại lệ bất thường được bắt lại và trả về JSON {'error': str(e)} với HTTP status 500.
    Giá trị trả về:
    - Trả về một tuple (response_body: dict, status_code: int).
        - Trường hợp thành công: ({'checkout_id': <str>, 'message': 'Checkout session created'}, 200)
        - Trường hợp giỏ rỗng: ({'error': 'Giỏ hàng trống'}, 400)
        - Trường hợp lỗi server/ngoại lệ: ({'error': '<message>'}, 500)
    Lưu ý vận hành và an toàn:
    - Hàm phụ thuộc vào việc session giỏ hàng được lưu chính xác trong Redis với khóa 'cart' + 'user_{user_id}'.
    - Không có kiểm tra chi tiết về tính hợp lệ từng item (ví dụ tồn kho, giá cập nhật) — những kiểm tra này nên thực hiện trước hoặc trong bước tiếp theo của luồng thanh toán.
    - Khả năng trùng lặp: nếu người dùng gọi nhiều lần, hành vi phụ thuộc vào triển khai của RedisSessionService.create_checkout_session (có thể tạo nhiều checkout session hoặc ghi đè).
    - Nên cân nhắc thêm logging, kiểm tra ràng buộc (như tổng tiền), và cơ chế rollback/atomic khi có nhiều thao tác liên quan đến kho/giá.
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Lấy cart session từ Redis
        cart_session = RedisSessionService.get_session('cart', f'user_{current_user_id}')
        if not cart_session or not cart_session.get('items'):
            return {'error': 'Giỏ hàng trống'}, 400
        
        # Tạo checkout session
        checkout_id = RedisSessionService.create_checkout_session(
            cart_session['session_id'],
            {
                'user_id': current_user_id,
                'items': cart_session['items'],
                'type': 'cart'
            }
        )
        
        return {
            'checkout_id': checkout_id,
            'message': 'Checkout session created'
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

@don_hang_api.post('/checkout/buy-now')
@jwt_required()
def buy_now(body: dict):
    """
    Tạo checkout session cho luồng "mua ngay" (buy now).

    Mô tả:
        Hàm này xây dựng một phiên (session) tạm thời trong Redis để xử lý luồng "mua ngay" của người dùng:
        - Lấy identity người dùng hiện tại từ JWT bằng get_jwt_identity().
        - Kiểm tra và lấy thông tin sản phẩm từ body request (bắt buộc có 'bien_the_san_pham_id', 'so_luong' tùy chọn).
        - Tạo một cart session tạm lưu trữ duy nhất chỉ chứa mục sản phẩm được mua ngay.
        - Dựa trên cart session vừa tạo, tạo một checkout session với kiểu 'buy_now' và trả về checkout_id.
        Hàm catch mọi Exception và trả về lỗi 500 kèm thông điệp lỗi.

    Tham số:
        body (dict): payload đầu vào từ client. Các khóa quan trọng:
            - 'bien_the_san_pham_id' (bắt buộc): id biến thể sản phẩm cần mua.
            - 'so_luong' (tuỳ chọn, mặc định 1): số lượng muốn mua. Nên là số nguyên >= 1.

    Giá trị trả về:
        Tuple (response_body: dict, status_code: int)
        - Khi thành công:
            ({'checkout_id': <checkout_id>, 'message': 'Buy now session created'}, 200)
          trong đó <checkout_id> là identifier do RedisSessionService.create_checkout_session trả về.
        - Khi thiếu thông tin đầu vào (ví dụ không có 'bien_the_san_pham_id'):
            ({'error': 'Thiếu thông tin sản phẩm'}, 400)
        - Khi có lỗi bất ngờ trong quá trình xử lý:
            ({'error': str(e)}, 500)

    Hành vi chi tiết:
        1. current_user_id = get_jwt_identity()
           - Lấy id người dùng từ môi trường JWT. Hàm giả định rằng JWT đã được xác thực trước đó.
        2. Lấy và validate dữ liệu từ body:
           - Lấy bien_the_id = body.get('bien_the_san_pham_id')
           - Lấy so_luong = body.get('so_luong', 1)
           - Nếu bien_the_id là None hoặc rỗng -> trả về lỗi 400.
           - (Hàm hiện tại không ép kiểu/kiểm tra so_luong > 0; tốt nhất caller/hoặc bổ sung validate trước khi gọi.)
        3. Tạo cart session tạm:
           - Gọi RedisSessionService.create_cart_session(current_user_id, items)
           - items là một danh sách chỉ chứa một mục:
             {'bien_the_san_pham_id': bien_the_id, 'so_luong': so_luong}
           - Phần này không ghi đè lên giỏ hàng vĩnh viễn; chỉ tạo session tạm để phục vụ checkout ngay.
        4. Tạo checkout session:
           - Gọi RedisSessionService.create_checkout_session(cart_session_id, payload)
           - payload gồm:
                 'items': [ { 'bien_the_san_pham_id': bien_the_id, 'so_luong': so_luong } ],
           - Hàm mong đợi create_checkout_session trả về một checkout_id (chuỗi hoặc số) để trả lại cho client.
        5. Trả về checkout_id và thông báo thành công, mã 200.

    Ví dụ sử dụng:
        body = {'bien_the_san_pham_id': 'variant123', 'so_luong': 2}
        -> Tạo cart session chứa variant123 x2, tạo checkout session kiểu 'buy_now', trả về checkout_id.
    Lưu ý & ràng buộc:
        - Hàm không thực hiện xác thực quyền truy cập nâng cao hoặc kiểm tra tồn kho/giá tiền. Các bước này nên được thực hiện sau khi tạo checkout session (trong bước xử lý thanh toán).
        - Hàm giả định rằng RedisSessionService và get_jwt_identity() tồn tại và hoạt động như mong đợi.
        - Nếu cần kiểm tra chi tiết hơn (ví dụ so_luong là số nguyên dương, existence của biến thể sản phẩm, hay throttle), những kiểm tra này nên được thêm trước khi gọi các phương thức tạo session.
        - Mọi ngoại lệ không được dự đoán sẽ bị bắt và trả về mã lỗi 500 cùng thông điệp lỗi (str(e)). Tránh lộ thông tin nhạy cảm trong thông điệp lỗi trả về người dùng.
    """

    """Tạo checkout session cho mua ngay"""
    try:
        current_user_id = get_jwt_identity()
        
        # Validate request
        bien_the_id = body.get('bien_the_san_pham_id')
        so_luong = body.get('so_luong', 1)
        
        if not bien_the_id:
            return {'error': 'Thiếu thông tin sản phẩm'}, 400
        
        # Tạo cart session tạm cho mua ngay
        cart_session_id = RedisSessionService.create_cart_session(
            current_user_id,
            [{
                'bien_the_san_pham_id': bien_the_id,
                'so_luong': so_luong
            }]
        )
        
        # Tạo checkout session
        checkout_id = RedisSessionService.create_checkout_session(
            cart_session_id,
            {
                'user_id': current_user_id,
                'items': [{
                    'bien_the_san_pham_id': bien_the_id,
                    'so_luong': so_luong
                }],
                'type': 'buy_now'
            }
        )
        
        return {
            'checkout_id': checkout_id,
            'message': 'Buy now session created'
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

@don_hang_api.get('/checkout/<string:checkout_id>')
@jwt_required()
def get_checkout_session(checkout_id: str):
    """
    Lấy session thanh toán (checkout) từ Redis và trả về kết quả kèm mã trạng thái HTTP tương ứng.
    -----
    Mô tả
    -----
    Hàm này truy vấn Redis thông qua RedisSessionService để lấy dữ liệu phiên thanh toán có loại 'checkout' và id tương ứng với checkout_id truyền vào.
    Nó không ném ngoại lệ ra bên ngoài — mọi ngoại lệ phát sinh trong quá trình truy vấn được bắt lại và trả về dưới dạng thông báo lỗi kèm mã 500.
    Tham số
    --------
    checkout_id : str
        Chuỗi định danh của phiên thanh toán cần lấy. Giá trị này được dùng làm khóa phụ cho loại phiên 'checkout' khi gọi
        RedisSessionService.get_session('checkout', checkout_id).
    Hành vi và giá trị trả về
    ------------------------
    Trả về một tuple (payload, status_code) theo dạng sau:
    - (checkout_data, 200)
        Nếu RedisSessionService trả về dữ liệu cho phiên thanh toán (checkout) tương ứng.
        checkout_data thường là một dict hoặc cấu trúc dữ liệu biểu diễn trạng thái giỏ hàng/thông tin thanh toán đã lưu.
    - ({'error': 'Checkout session không tồn tại'}, 404)
        Nếu RedisSessionService không tìm thấy session tương ứng (giá trị trả về là falsy như None).
    - ({'error': str(e)}, 500)
        Nếu có bất kỳ ngoại lệ nào xảy ra trong quá trình lấy session (ví dụ: lỗi kết nối tới Redis, lỗi nội bộ của service).
        Trường error chứa thông điệp ngoại lệ (string) để tiện ghi log/hiển thị.
    Ghi chú triển khai
    ------------------
    - Hàm giả định rằng RedisSessionService có phương thức tĩnh get_session(namespace: str, session_id: str) -> Optional[dict].
      Namespace cố định là 'checkout' trong trường hợp này.
    - Hàm không thực hiện kiểm tra hợp lệ cho checkout_id (ví dụ: rỗng hoặc kiểu không phải str). Nếu cần, nên validate trước khi gọi.
    - Hàm không có tác dụng phụ (không sửa dữ liệu), chỉ đọc dữ liệu từ session store.
    - Việc bắt chung Exception giúp tránh làm rớt server nhưng có thể che lấp lỗi nội bộ; cần logging ngoài hàm để theo dõi lỗi chi tiết.
    Ví dụ sử dụng
    -------------
    - Khi tồn tại session:
        payload, status = get_checkout_session("abc123")
        => payload: {...dữ liệu checkout...}, status: 200
    - Khi không tồn tại session:
        payload, status = get_checkout_session("khong-ton-tai")
        => payload: {'error': 'Checkout session không tồn tại'}, status: 404
    - Khi có lỗi kết nối tới Redis:
        payload, status = get_checkout_session("abc123")
        => payload: {'error': 'Redis connection error'}, status: 500
    """
    
    try:
        checkout_data = RedisSessionService.get_session('checkout', checkout_id)
        if not checkout_data:
            return {'error': 'Checkout session không tồn tại'}, 404
        
        return checkout_data, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

@don_hang_api.put('/checkout/<string:checkout_id>')
@jwt_required()
def update_checkout_session(checkout_id: str, body: dict):
    """
    Cập nhật thông tin của một "checkout session" được lưu trong Redis.
    --
    Mô tả
    ----
    Hàm này kiểm tra và cập nhật thông tin cho một phiên thanh toán (checkout session) được lưu bằng Redis thông qua RedisSessionService.
    Quy trình chính:
    1. Lấy user hiện tại từ JWT bằng get_jwt_identity().
    2. Lấy dữ liệu session từ Redis bằng RedisSessionService.get_session('checkout', checkout_id).
    3. Kiểm tra tồn tại của session; nếu không tồn tại trả về lỗi 404.
    4. Kiểm tra quyền truy cập: chỉ cho phép user sở hữu session (so sánh checkout_data['user_id'] với user hiện tại). Nếu không khớp trả về lỗi 403.
    5. Tạo một dict updates chỉ chứa các trường cho phép cập nhật nếu chúng xuất hiện trong body: 'dia_chi_id', 'phuong_thuc_van_chuyen', 'voucher_code', 'ghi_chu'.
    6. Gọi RedisSessionService.update_session('checkout', checkout_id, updates) để lưu các thay đổi.
    7. Trả về thông báo thành công (kèm mã HTTP 200). Nếu có ngoại lệ không mong muốn, trả về lỗi 500 kèm thông tin ngoại lệ.
    Tham số
    ----
    checkout_id : str
        ID của checkout session cần cập nhật. Dùng để truy xuất session trong Redis.
    body : dict

        Dữ liệu gửi lên để cập nhật session. Các khóa hợp lệ (tùy chọn) gồm:
        - 'dia_chi_id' : (int | str) ID địa chỉ giao hàng (nếu có).
        - 'phuong_thuc_van_chuyen' : str phương thức vận chuyển được chọn.
        - 'voucher_code' : str mã voucher (nếu có).
        - 'ghi_chu' : str ghi chú của người mua.

        Lưu ý: hàm không thực hiện kiểm tra chi tiết về kiểu hoặc tính hợp lệ của các giá trị này — việc xác thực dữ liệu nên được thực hiện trước khi gọi hàm.

    Giá trị trả về
    ----
    Trả về một tuple (payload, status_code):
    - Khi cập nhật thành công:
        ({ 'message': 'Cập nhật thành công' }, 200)
    - Khi session không tồn tại:
        ({ 'error': 'Checkout session không tồn tại' }, 404)
    - Khi user không có quyền truy cập session:
        ({ 'error': 'Không có quyền truy cập' }, 403)
    - Khi có lỗi nội bộ/ngoại lệ:
        ({ 'error': <thông tin ngoại lệ> }, 500)

    Hành vi / Tác dụng phụ
    ----
    - Hàm sẽ gọi RedisSessionService.update_session để cập nhật session trong Redis. Bản thân hàm chỉ gửi các trường có trong body; nếu body rỗng hoặc không chứa các khóa hợp lệ, update_session có thể được gọi với một dict rỗng (tuỳ hiện thực của RedisSessionService) — điều này có thể dẫn đến không có thay đổi gì.
    - Hàm giả định rằng RedisSessionService.get_session trả về một dict có khóa 'user_id' để kiểm tra quyền sở hữu session.
    - Hàm lấy user hiện tại từ JWT; nếu get_jwt_identity() trả về None hoặc giá trị không tương thích với kiểu checkout_data['user_id'], kiểm tra quyền có thể thất bại.

    Lưu ý bảo mật và vận hành
    ----
    - Việc xác thực và phân quyền phụ thuộc vào get_jwt_identity() và dữ liệu session trong Redis; đảm bảo JWT được kiểm tra và ký đúng trước khi gọi hàm này.
    - Nên chuẩn hóa/kiểm tra kiểu dữ liệu (ví dụ kiểu ID, độ dài chuỗi voucher) trước khi truyền vào body để tránh lưu dữ liệu không hợp lệ.
    - Cân nhắc xử lý cạnh tranh (race conditions) nếu có nhiều yêu cầu cùng cập nhật một session — tuỳ vào hiện thực của RedisSessionService có thể cần cơ chế lock hoặc cập nhật theo phiên bản.
    - Không tiết lộ thông tin chi tiết của ngoại lệ cho client trong môi trường production — hiện hàm trả về str(e), có thể rò rỉ thông tin nội bộ. Nên thay bằng thông điệp tổng quát hoặc log chi tiết trên server.
    
    Ví dụ
    ----
    Gọi thành công (giả sử user sở hữu session và session tồn tại):
    body = { 'dia_chi_id': 123, 'phuong_thuc_van_chuyen': 'Giao hàng nhanh' }
    -> ({ 'message': 'Cập nhật thành công' }, 200)
    Trường hợp session không tồn tại:
    -> ({ 'error': 'Checkout session không tồn tại' }, 404)
    Trường hợp user không có quyền:
    -> ({ 'error': 'Không có quyền truy cập' }, 403)
    """
    
    try:
        current_user_id = get_jwt_identity()
        
        # Kiểm tra checkout session
        checkout_data = RedisSessionService.get_session('checkout', checkout_id)
        if not checkout_data:
            return {'error': 'Checkout session không tồn tại'}, 404
        
        # Chỉ cho phép user sở hữu session update
        if checkout_data.get('user_id') != current_user_id:
            return {'error': 'Không có quyền truy cập'}, 403
        
        # Cập nhật thông tin
        updates = {}
        if 'dia_chi_id' in body:
            updates['dia_chi_id'] = body['dia_chi_id']
        if 'phuong_thuc_van_chuyen' in body:
            updates['phuong_thuc_van_chuyen'] = body['phuong_thuc_van_chuyen']
        if 'voucher_code' in body:
            updates['voucher_code'] = body['voucher_code']
        if 'ghi_chu' in body:
            updates['ghi_chu'] = body['ghi_chu']
        
        RedisSessionService.update_session('checkout', checkout_id, updates)
        
        return {'message': 'Cập nhật thành công'}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

@don_hang_api.post('/checkout/<string:checkout_id>/place-order')
@jwt_required()
def place_order(checkout_id: str, body: DonHangCreate):
    """
    Đặt hàng từ checkout session
    ----
    Mô tả
    ----
    Hàm place_order chịu trách nhiệm hoàn tất quy trình tạo đơn hàng dựa trên một checkout session đã được lưu trong Redis.
    Quá trình thực hiện bao gồm:
    - Xác thực người dùng hiện tại qua JWT.
    - Lấy thông tin checkout từ Redis theo checkout_id.
    - Kiểm tra quyền sở hữu (chỉ người tạo checkout mới được phép tạo đơn từ checkout đó).
    - Kết hợp dữ liệu checkout với payload (DonHangCreate) để tạo payload đầy đủ cho việc tạo đơn hàng.
    - Gọi DonHangService.create_order_from_checkout để tạo bản ghi đơn hàng (thực hiện trong transaction tại service).
    - Sau khi tạo đơn thành công, xóa checkout session; nếu checkout đến từ giỏ hàng (type == 'cart') thì xóa cả cart session liên quan.
    - Chuẩn bị response gồm thông tin đơn hàng và thông tin thanh toán; nếu phương thức thanh toán là PayOS (VNPAY QR/EWALLET) sẽ trả về thông tin cần dùng để frontend gọi tạo payment link.
    
    Thao tác phụ (side effects)
    - Ghi mới đơn hàng và các bản ghi liên quan vào cơ sở dữ liệu (thông qua DonHangService).
    - Xóa các session liên quan trong Redis (checkout, có thể cả cart).
    - Trong trường hợp lỗi không mong muốn, sẽ thực hiện db.session.rollback() để tránh dữ liệu không nhất quán.

    Tham số
    ----
    - checkout_id (str): ID của checkout session được lưu trong Redis. Dùng để truy xuất dữ liệu checkout tạm thời.
    - body (DonHangCreate): DTO/Schema chứa các thông tin do client cung cấp khi đặt hàng (ví dụ: địa chỉ giao hàng, ghi chú, lựa chọn vận chuyển/khuyến mãi...).
        - Đối tượng này được chuyển thành dict bằng body.dict() để ghép vào dữ liệu checkout trước khi tạo đơn.
    
    Xác thực & Ủy quyền
    ----
    - Hàm lấy user hiện tại qua get_jwt_identity(). Người dùng phải được xác thực (có JWT hợp lệ).
    - Nếu checkout.user_id !== current_user_id => trả về lỗi 403 (Không có quyền truy cập).
    
    Giá trị trả về
    ----
    Hàm trả về tuple (response_dict, status_code). Các trường hợp chính:
    1) Thành công (HTTP 201)
    - response_dict có cấu trúc:
        {
            'don_hang': <dict: DonHangResponse từ ORM>,
            'thanh_toan': <dict: ThanhToanResponse từ ORM>,
            'payment_info': {
                    # Nếu cần frontend tạo payment link (PayOS)
                    'thanh_toan_id': <id của bản ghi thanh toán>, # chỉ khi phương thức là VNPAY_QR hoặc VNPAY_EWALLET
        hoặc
        {
            'don_hang': ...,
            'thanh_toan': ...,
            'payment_info': {
    2) Lỗi client liên quan tới checkout session (HTTP 400)
    - Nếu checkout session không tồn tại hoặc đã hết hạn:
        {'error': 'Checkout session không tồn tại hoặc đã hết hạn'}, 400
    3) Lỗi ủy quyền (HTTP 403)
    - Nếu người dùng hiện tại không phải chủ sở hữu checkout:
        {'error': 'Không có quyền truy cập'}, 403
    4) Lỗi xác thực/validate do service (HTTP 400)
    - Nếu DonHangService hoặc các validate khác ném ValueError, trả về:
        {'error': '<message từ exception>', 'code': 'VALIDATION_ERROR'}, 400
    5) Lỗi server/khác (HTTP 500)
    - Với bất kỳ exception không lường trước, hàm thực hiện rollback và trả về:
        {'error': 'Lỗi khi tạo đơn hàng: <message>'}, 500
    Điểm lưu ý / Rủi ro
    ----
    - Hàm giả định rằng DonHangService.create_order_from_checkout xử lý transaction tạo đơn và các bản ghi liên quan. Nếu service này không quản lý transaction, có thể gây inconsistency; do đó cần đảm bảo service đã triển khai transaction đúng.
    - Việc xóa session trong Redis là thao tác phá hủy: nếu muốn hỗ trợ rollback hoàn toàn (bao gồm Redis) khi tạo đơn lỗi, cần xem xét cơ chế compensating hoặc transactional session store.
    - Hàm trả về tuple (dict, status_code) theo mô hình route của Flask/Flask-RESTful; khi dùng framework khác, có thể cần điều chỉnh.
    - Trường payment_info chỉ cung cấp cờ và id thanh_toan để frontend gọi tạo payment link; không chứa thông tin nhạy cảm về thanh toán.
    Ví dụ kết quả (thành công)
    ----
    """
    
    try:
        current_user_id = get_jwt_identity()
        
        # Lấy checkout session
        checkout_data = RedisSessionService.get_session('checkout', checkout_id)
        if not checkout_data:
            return {'error': 'Checkout session không tồn tại hoặc đã hết hạn'}, 400
        
        # Validate ownership
        if checkout_data.get('user_id') != current_user_id:
            return {'error': 'Không có quyền truy cập'}, 403
        
        # Chuẩn bị data để tạo đơn hàng
        order_data = {
            **checkout_data,
            **body.dict(),
            'user_id': current_user_id
        }
        
        # Tạo đơn hàng với transaction
        don_hang = DonHangService.create_order_from_checkout(order_data, current_user_id)
        
        # Xóa checkout session sau khi tạo đơn thành công
        RedisSessionService.delete_session('checkout', checkout_id)
        
        # Xóa cart session nếu là từ giỏ hàng
        if checkout_data.get('type') == 'cart':
            RedisSessionService.delete_session('cart', checkout_data['cart_session_id'])
        
        # Chuẩn bị response
        response_data = {
            'don_hang': DonHangResponse.from_orm(don_hang).dict(),
            'thanh_toan': ThanhToanResponse.from_orm(don_hang.thanh_toan).dict(),
        }
        
        # Nếu là thanh toán PayOS, trả về thông tin để frontend gọi tạo payment link
        if don_hang.thanh_toan.phuong_thuc in [PhuongThucThanhToanEnum.PAYOS_QR, PhuongThucThanhToanEnum.VNPAY_QR, PhuongThucThanhToanEnum.VNPAY_EWALLET]:
            response_data['payment_info'] = {
                'thanh_toan_id': don_hang.thanh_toan.id,
                'need_create_payment_link': True
            }
        else:
            response_data['payment_info'] = {
                'need_create_payment_link': False
            }
        
        return response_data, 201
        
    except ValueError as e:
        return {'error': str(e), 'code': 'VALIDATION_ERROR'}, 400
    except Exception as e:
        db.session.rollback()
        return {'error': f'Lỗi khi tạo đơn hàng: {str(e)}'}, 500

@don_hang_api.get('/user')
@jwt_required()
def get_user_orders():
    """
    Lấy danh sách đơn hàng của người dùng hiện tại với phân trang.
    ----
    Mô tả chức năng
    ----
    - Hàm này lấy ID người dùng hiện tại từ JWT bằng get_jwt_identity() (thường được cung cấp bởi flask_jwt_extended).
    - Đọc tham số truy vấn HTTP để thực hiện phân trang:
        - "page": trang hiện tại (mặc định 1). Được lấy bằng request.args.get('page', 1, type=int).
        - "per_page": số mục trên một trang (mặc định 10). Được lấy bằng request.args.get('per_page', 10, type=int).
    - Truy vấn cơ sở dữ liệu trên model DonHang, lọc theo trường nguoi_dung_id = current_user_id để chỉ trả về đơn hàng thuộc về người dùng hiện tại.
    - Sử dụng phương thức paginate của truy vấn (pagination = orders_query.paginate(page=..., per_page=..., error_out=False)) để lấy một đối tượng phân trang.
    - Chuyển từng đối tượng đơn hàng (từng phần tử trong pagination.items) sang dạng JSON/đối tượng trả về bằng DonHangResponse.from_orm(order).dict() (giả định DonHangResponse là một schema/Pydantic model dùng để serialise).
    - Trả về một tuple (payload, http_status):
        - payload là dict có hai nhánh:
            - "data": danh sách đơn hàng đã được serialise.
            - "pagination": dict chứa thông tin phân trang: 'page', 'per_page', 'total' (tổng số bản ghi), 'pages' (tổng số trang).
        - http_status là 200 khi thành công.
    - Khi có exception không mong muốn, hàm trả về {'error': str(e)} với mã HTTP 500.

    Tham số đầu vào (implicit)
    ----
    - get_jwt_identity(): lấy từ ngữ cảnh của request (không phải tham số truyền vào trực tiếp).
    - request.args: truy vấn chuỗi của request HTTP (Flask global request).

    Giá trị trả về
    ----
    - Thành công: ({"data": [...], "pagination": {"page": int, "per_page": int, "total": int, "pages": int}}, 200)
    - Lỗi: ({"error": "<mô tả lỗi>"}, 500)

    Các trường hợp và lưu ý vận hành
    ----
    - Nếu không có JWT hợp lệ hoặc get_jwt_identity() trả về None, truy vấn sẽ lọc theo nguoi_dung_id = None; nên cần đảm bảo trước đó đã bảo vệ endpoint bằng decorator xác thực JWT (ví dụ @jwt_required()) để tránh rò rỉ/điền sai dữ liệu.
    - request.args.get(..., type=int) sẽ cố gắng ép kiểu giá trị truyền vào; nếu không hợp lệ hoặc không tồn tại, giá trị mặc định được dùng (1 cho page, 10 cho per_page). Có thể bổ sung kiểm tra để đảm bảo page >= 1 và một khoảng hợp lý cho per_page (ví dụ 1 <= per_page <= 100) để tránh truy vấn quá nặng.
    - paginate(..., error_out=False) sẽ không raise khi page vượt giới hạn mà trả về pagination.items rỗng; payload vẫn bao gồm thông tin total và pages.
    - DonHangResponse.from_orm(...) giả định mapping an toàn giữa model ORM và schema xuất khẩu; lưu ý lọc/bỏ các trường nhạy cảm trước khi trả về (ví dụ thông tin nhạy cảm của người dùng, token, v.v.).
    - Xử lý ngoại lệ chung hiện tại trả về mã 500 và thông báo lỗi thô; trong môi trường sản xuất nên log chi tiết server-side và trả về thông điệp lỗi thân thiện, không phơi bày stack trace.
    
    Khuyến nghị cải tiến
    ----
    - Thêm decorator bắt buộc xác thực JWT để đảm bảo luôn có current_user_id hợp lệ.
    - Thêm validation cho page và per_page (ràng buộc giá trị tối thiểu/tối đa).
    - Thêm caching hoặc tối ưu truy vấn nếu số lượng đơn hàng lớn (ví dụ chỉ select các cột cần thiết, thêm chỉ mục trên trường nguoi_dung_id).
    - Chuẩn hóa cấu trúc lỗi và dùng schema trả về thống nhất cho các endpoint khác.
    """
    
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Query đơn hàng với phân trang
        orders_query = DonHang.query.filter_by(nguoi_dung_id=current_user_id)
        pagination = orders_query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        orders_data = [
            DonHangResponse.from_orm(order).dict() 
            for order in pagination.items
        ]
        
        return {
            'data': orders_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500
    
@don_hang_api.get('/<int:order_id>')
@jwt_required()
def get_order_detail(order_id: int):
    """Lấy chi tiết đơn hàng của user"""
    try:
        current_user_id = get_jwt_identity()
        
        order = DonHangService.get_order_detail(order_id, current_user_id, is_admin=False)
        if not order:
            return {'error': 'Đơn hàng không tồn tại'}, 404
        
        return DonHangResponse.from_orm(order).dict(), 200
        
    except Exception as e:
        return {'error': str(e)}, 500

@don_hang_api.put('/<int:order_id>/cancel')
@jwt_required()
def cancel_order(order_id: int, body: OrderCancelRequest):
    """User hủy đơn hàng của mình"""
    try:
        current_user_id = get_jwt_identity()
        
        order = DonHangService.update_order_status(
            order_id, 
            TrangThaiDonHangEnum.DA_HUY,
            current_user_id,
            is_admin=False
        )

        return {
            'message': 'Đã hủy đơn hàng thành công',
            'don_hang': DonHangResponse.from_orm(order).dict()
        }, 200
        
    except ValueError as e:
        return {'error': str(e)}, 400
    except Exception as e:
        db.session.rollback()
        return {'error': f'Lỗi khi hủy đơn hàng: {str(e)}'}, 500

@don_hang_api.get('/user/history')
@jwt_required()
def get_order_history():
    """Lấy lịch sử đơn hàng của user với filter"""
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', type=str)
        
        # Convert string status to enum
        status_enum = None
        if status:
            try:
                status_enum = TrangThaiDonHangEnum(status)
            except ValueError:
                return {'error': 'Trạng thái không hợp lệ'}, 400
        
        orders, total = DonHangService.get_user_orders(
            current_user_id, page, per_page, status_enum
        )
        
        orders_data = [DonHangResponse.from_orm(order).dict() for order in orders]
        
        return {
            'data': orders_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500
    

@don_hang_api.post('/checkout/<string:checkout_id>/create-pending')
@jwt_required()
def create_pending_order(checkout_id: str):
    """Tạo đơn hàng tạm thời trước khi thanh toán"""
    try:
        current_user_id = get_jwt_identity()
        
        # Lấy checkout session
        checkout_data = RedisSessionService.get_session('checkout', checkout_id)
        if not checkout_data:
            return {'error': 'Checkout session không tồn tại'}, 400
            
        # Tạo pending order
        pending_order = DonHangService.create_pending_order(checkout_data, current_user_id)
        
        return {
            'pending_order_id': pending_order['order_id'],
            'order_data': pending_order['order_data']
        }, 200
        
    except ValueError as e:
        return {'error': str(e)}, 400
    except Exception as e:
        return {'error': f'Lỗi tạo đơn hàng tạm: {str(e)}'}, 500

@don_hang_api.post('/confirm-payment')
@jwt_required()
def confirm_order_after_payment(body: dict):
    """Xác nhận đơn hàng sau khi thanh toán thành công"""
    try:
        current_user_id = get_jwt_identity()
        
        don_hang = DonHangService.confirm_order_after_payment(
            body['pending_order_id'],
            body['payment_data']
        )
        
        return {
            'message': 'Đơn hàng đã được xác nhận',
            'don_hang': DonHangResponse.from_orm(don_hang).dict()
        }, 200
        
    except ValueError as e:
        return {'error': str(e)}, 400
    except Exception as e:
        db.session.rollback()
        return {'error': f'Lỗi xác nhận đơn hàng: {str(e)}'}, 500