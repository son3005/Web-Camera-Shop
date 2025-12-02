from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from ..services.thongke_service import ThongKeService
from ..utils.decorators import admin_required

thong_ke_api = Blueprint('thong_ke', __name__, url_prefix='/api/thong-ke')

@thong_ke_api.route('/tong-hop', methods=['GET'])
@admin_required
def tong_hop_thong_ke():
    """Tổng hợp thống kê dashboard"""
    try:
        data = ThongKeService.tong_hop_thong_ke()
        return jsonify({
            'success': True,
            'data': data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lấy thống kê: {str(e)}'
        }), 500

@thong_ke_api.route('/doanh-thu', methods=['GET'])
@admin_required
def thong_ke_doanh_thu():
    """Thống kê doanh thu theo năm hoặc tháng/năm"""
    try:
        nam = request.args.get('nam', type=int)
        thang = request.args.get('thang', type=int)
        
        # Validate input
        if thang is not None and (thang < 1 or thang > 12):
            return jsonify({
                'success': False,
                'message': 'Tháng không hợp lệ. Vui lòng nhập giá trị từ 1 đến 12.'
            }), 400
            
        if nam is not None and nam <= 0:
            return jsonify({
                'success': False,
                'message': 'Năm không hợp lệ. Vui lòng nhập giá trị dương.'
            }), 400
        
        data = ThongKeService.thong_ke_doanh_thu_theo_thang_nam(nam, thang)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lấy thống kê doanh thu: {str(e)}'
        }), 500

@thong_ke_api.route('/nguoi-dung-moi', methods=['GET'])
@admin_required
def thong_ke_nguoi_dung_moi():
    """Thống kê người dùng mới theo năm hoặc tháng/năm"""
    try:
        nam = request.args.get('nam', type=int)
        thang = request.args.get('thang', type=int)
        
        # Validate input
        if thang is not None and (thang < 1 or thang > 12):
            return jsonify({
                'success': False,
                'message': 'Tháng không hợp lệ. Vui lòng nhập giá trị từ 1 đến 12.'
            }), 400
            
        if nam is not None and nam <= 0:
            return jsonify({
                'success': False,
                'message': 'Năm không hợp lệ. Vui lòng nhập giá trị dương.'
            }), 400
        
        data = ThongKeService.thong_ke_nguoi_dung_moi(nam, thang)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lấy thống kê người dùng: {str(e)}'
        }), 500

@thong_ke_api.route('/don-hang-thanh-cong', methods=['GET'])
@admin_required
def thong_ke_don_hang_thanh_cong():
    """Thống kê đơn hàng thành công theo năm hoặc tháng/năm"""
    try:
        nam = request.args.get('nam', type=int)
        thang = request.args.get('thang', type=int)
        
        # Validate input
        if thang is not None and (thang < 1 or thang > 12):
            return jsonify({
                'success': False,
                'message': 'Tháng không hợp lệ. Vui lòng nhập giá trị từ 1 đến 12.'
            }), 400
            
        if nam is not None and nam <= 0:
            return jsonify({
                'success': False,
                'message': 'Năm không hợp lệ. Vui lòng nhập giá trị dương.'
            }), 400
        
        data = ThongKeService.thong_ke_don_hang_thanh_cong(nam, thang)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lấy thống kê đơn hàng: {str(e)}'
        }), 500

@thong_ke_api.route('/ti-trong-thuong-hieu', methods=['GET'])
@admin_required
def thong_ke_ti_trong_thuong_hieu():
    """Thống kê tỉ trọng thương hiệu theo năm hoặc tháng/năm"""
    try:
        nam = request.args.get('nam', type=int)
        thang = request.args.get('thang', type=int)
        
        # Validate input
        if thang is not None and (thang < 1 or thang > 12):
            return jsonify({
                'success': False,
                'message': 'Tháng không hợp lệ. Vui lòng nhập giá trị từ 1 đến 12.'
            }), 400
            
        if nam is not None and nam <= 0:
            return jsonify({
                'success': False,
                'message': 'Năm không hợp lệ. Vui lòng nhập giá trị dương.'
            }), 400
        
        data = ThongKeService.thong_ke_ti_trong_thuong_hieu(nam, thang)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lấy thống kê thương hiệu: {str(e)}'
        }), 500

@thong_ke_api.route('/nguoi-dung-dang-nhap', methods=['GET'])
@admin_required
def thong_ke_nguoi_dung_dang_nhap():
    """Thống kê người dùng đăng nhập theo năm hoặc tháng/năm"""
    try:
        nam = request.args.get('nam', type=int)
        thang = request.args.get('thang', type=int)

        # Validate input
        if thang is not None and (thang < 1 or thang > 12):
            return jsonify({
                'success': False,
                'message': 'Tháng không hợp lệ. Vui lòng nhập giá trị từ 1 đến 12.'
            }), 400
            
        if nam is not None and nam <= 0:
            return jsonify({
                'success': False,
                'message': 'Năm không hợp lệ. Vui lòng nhập giá trị dương.'
            }), 400
        
        data = ThongKeService.thong_ke_nguoi_dung_dang_nhap(nam, thang)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lấy thống kê đăng nhập: {str(e)}'
        }), 500

@thong_ke_api.route('/danh-gia', methods=['GET'])
@admin_required
def thong_ke_danh_gia():
    """Thống kê đánh giá theo năm hoặc tháng/năm"""
    try:
        nam = request.args.get('nam', type=int)
        thang = request.args.get('thang', type=int)
        
        # Validate input
        if thang is not None and (thang < 1 or thang > 12):
            return jsonify({
                'success': False,
                'message': 'Tháng không hợp lệ. Vui lòng nhập giá trị từ 1 đến 12.'
            }), 400
            
        if nam is not None and nam <= 0:
            return jsonify({
                'success': False,
                'message': 'Năm không hợp lệ. Vui lòng nhập giá trị dương.'
            }), 400
        
        data = ThongKeService.thong_ke_danh_gia(nam, thang)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lấy thống kê đánh giá: {str(e)}'
        }), 500