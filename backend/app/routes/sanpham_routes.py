# /backend/app/routes/sanpham_routes.py
import traceback
import json
from flask import jsonify, current_app, request
from pydantic import BaseModel, Field
from flask_openapi3 import APIBlueprint
from werkzeug.exceptions import BadRequest, NotFound
from ..extensions import db
from ..services.cloudinary_service import delete_image_task
from ..services.sanpham_service import SanPhamService
from ..models.sanpham import SanPham, BienTheSanPham
from ..schemas.sanpham import (
    SanPhamCreate, SanPhamUpdate, SanPhamResponse,
    BienTheSanPhamCreate, BienTheSanPhamResponse, BienTheSanPhamUpdate, SanPhamListResponse,
    HinhAnhCreate, HinhAnhUpdate, HinhAnhResponse, SanPhamBasicListResponse, BienTheBasicListResponse
)
from ..services.upload_service import UploadService
from ..schemas.path_models import *  
from ..utils.decorators import admin_required

# ==============================================================
# Khởi tạo APIBlueprint
# ==============================================================
product_api = APIBlueprint('product_api', __name__, url_prefix='/api/san-pham')

# ==============================================================
# 1️ LẤY DANH SÁCH SẢN PHẨM
# ==============================================================
@product_api.get('', responses={"200": SanPhamListResponse})
def get_all_san_pham():
    """Lấy danh sách sản phẩm với tìm kiếm cải tiến""" 
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', None, type=str)
        min_price = request.args.get('min_price', None, type=float)
        max_price = request.args.get('max_price', None, type=float)
        sort_by_price = request.args.get('sort_by_price', None, type=str)
        sort_by_name = request.args.get('sort_by_name', None, type=str)
        thuong_hieu_ids = request.args.getlist('thuong_hieu_ids', type=int)
        danh_muc_ids = request.args.getlist('danh_muc_ids', type=int)
        cap_do_ids = request.args.getlist('cap_do_ids', type=int)
        valid_sorts_price = ['price_asc', 'price_desc']
        valid_sorts_name = ['name_asc', 'name_desc']
        
        if sort_by_price and sort_by_price not in valid_sorts_price:
            return jsonify({"error": "sort_by_price phải là: price_asc, price_desc"}), 400
        if sort_by_name and sort_by_name not in valid_sorts_name:
            return jsonify({"error": "sort_by_name phải là: name_asc, name_desc"}), 400

        result = SanPhamService.get_all_san_pham(
            page=page, per_page=per_page, search=search,
            min_price=min_price, max_price=max_price, 
            sort_by_price=sort_by_price, sort_by_name=sort_by_name,
            thuong_hieu_ids=thuong_hieu_ids, danh_muc_ids=danh_muc_ids, cap_do_ids=cap_do_ids
        )
        response = SanPhamListResponse.model_validate(result)
        return jsonify(response.model_dump()), 200
    except Exception:
        current_app.logger.error(f"Lỗi lấy danh sách sản phẩm: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi lấy danh sách sản phẩm."}), 500

# ==============================================================
# 2️ LẤY CHI TIẾT SẢN PHẨM
# ==============================================================
@product_api.get(
    '/<int:san_pham_id>',
    responses={"200": SanPhamResponse}
)
def get_san_pham(path: SanPhamPath):
    """
    Lấy thông tin chi tiết sản phẩm theo ID
    """
    try:
        san_pham = SanPhamService.get_san_pham_by_id(path.san_pham_id)
        response = SanPhamResponse.model_validate(san_pham)
        return jsonify(response.model_dump()), 200
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"Lỗi lấy sản phẩm {path.san_pham_id}: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi lấy sản phẩm."}), 500

# ==============================================================
# 3 TẠO SẢN PHẨM VỚI UPLOAD ẢNH (FormData) - ADMIN 
# ==============================================================
@product_api.post('/', responses={"201": SanPhamResponse})
@admin_required
def create_san_pham_with_images():
    """
    Tạo mới sản phẩm kèm theo upload ảnh cho từng biến thể sản phẩm.
    FIXED: Xử lý linh hoạt khi có ảnh bị thiếu
    """
    
    try:
        # Lấy dữ liệu sản phẩm từ form
        product_json = request.form.get('product')
        if not product_json:
            return jsonify({"error": "Thiếu dữ liệu sản phẩm"}), 400
        
        # Parse JSON thành dict
        try:
            product_data = json.loads(product_json)
        except json.JSONDecodeError as e:
            return jsonify({"error": f"Dữ liệu sản phẩm không hợp lệ: {str(e)}"}), 400
        
        # FIX: Kiểm tra xem có biến thể và hình ảnh không
        if 'cac_bien_the' not in product_data:
            return jsonify({"error": "Thiếu thông tin biến thể sản phẩm"}), 400
        
        # DEBUG: Log để kiểm tra
        current_app.logger.info(f"Files nhận được: {list(request.files.keys())}")
        
        # FIX: Xử lý upload ảnh - CHẤP NHẬN THIẾU ẢNH VÀ BỎ QUA ẢNH ĐÓ
        for i, bien_the in enumerate(product_data.get('cac_bien_the', [])):
            if 'hinh_anhs' not in bien_the:
                continue
                
            # FIX: Tạo danh sách hình ảnh mới, chỉ giữ lại những ảnh có file
            hinh_anhs_valid = []
            
            for j, hinh_anh in enumerate(bien_the.get('hinh_anhs', [])):
                # Lấy file ảnh từ form data
                file_key = f'images[{i}][{j}]'
                current_app.logger.info(f"Kiểm tra file key: {file_key}")
                
                if file_key in request.files:
                    file = request.files[file_key]
                    if file and file.filename:
                        current_app.logger.info(f"Tìm thấy file: {file.filename}")
                        # Upload ảnh lên Cloudinary
                        try:
                            upload_result = UploadService.upload_direct_to_server(file, folder="san_pham")
                            # Cập nhật URL và public_id vào dữ liệu ảnh
                            hinh_anh['url'] = upload_result['url']
                            hinh_anh['public_id'] = upload_result['public_id']
                            hinh_anhs_valid.append(hinh_anh)
                            current_app.logger.info(f"Upload thành công: {upload_result['url']}")
                        except Exception as e:
                            # FIX: Không dừng lại, mà ghi log và bỏ qua ảnh này
                            current_app.logger.warning(f"Lỗi upload ảnh {file_key}, bỏ qua ảnh này: {str(e)}")
                            continue
                    else:
                        current_app.logger.warning(f"File rỗng cho key: {file_key}, bỏ qua ảnh này")
                        continue
                else:
                    current_app.logger.warning(f"Không tìm thấy file cho key: {file_key}, bỏ qua ảnh này")
                    continue
            
            # FIX: Cập nhật lại danh sách hình ảnh chỉ với những ảnh upload thành công
            bien_the['hinh_anhs'] = hinh_anhs_valid
            
            # FIX: Nếu không còn ảnh nào, báo lỗi
            if not bien_the['hinh_anhs']:
                return jsonify({"error": f"Biến thể {i+1} không có ảnh nào được upload thành công"}), 400
            
            # FIX: Đảm bảo có ít nhất 1 ảnh đại diện
            has_main_image = any(img.get('la_anh_dai_dien', False) for img in bien_the['hinh_anhs'])
            if not has_main_image:
                bien_the['hinh_anhs'][0]['la_anh_dai_dien'] = True
                current_app.logger.info(f"Tự động set ảnh đầu tiên làm ảnh đại diện cho biến thể {i}")
        
        # FIX: Kiểm tra xem còn biến thể nào có ảnh không
        bien_the_co_anh = [bt for bt in product_data.get('cac_bien_the', []) if bt.get('hinh_anhs')]
        if not bien_the_co_anh:
            return jsonify({"error": "Không có biến thể nào có ảnh được upload thành công"}), 400
        
        # Chuyển đổi dict thành SanPhamCreate
        try:
            current_app.logger.info("Bắt đầu validate dữ liệu sản phẩm...")
            san_pham_create = SanPhamCreate.model_validate(product_data)
            current_app.logger.info("Validate dữ liệu sản phẩm thành công")
        except Exception as e:
            current_app.logger.error(f"Lỗi validate dữ liệu sản phẩm: {str(e)}")
            return jsonify({"error": f"Dữ liệu sản phẩm không hợp lệ: {str(e)}"}), 400
        
        # Gọi service tạo sản phẩm
        current_app.logger.info("Gọi service tạo sản phẩm...")
        new_san_pham = SanPhamService.create_san_pham(san_pham_create)
        db.session.commit()
        current_app.logger.info("Tạo sản phẩm thành công")
        
        response = SanPhamResponse.model_validate(new_san_pham)
        return jsonify(response.model_dump()), 201
        
    except (BadRequest, NotFound) as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi BadRequest/NotFound: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi tạo sản phẩm với ảnh: {traceback.format_exc()}")
        return jsonify({"error": f"Không thể tạo sản phẩm: {str(e)}"}), 500
    
# ==============================================================
# 4 CẬP NHẬT SẢN PHẨM VỚI UPLOAD ẢNH (FormData) - ADMIN
# ==============================================================
@product_api.put('/<int:san_pham_id>', responses={"200": SanPhamResponse})
@admin_required
def update_san_pham_with_images(path: SanPhamPath):
    """
    Cập nhật thông tin sản phẩm cùng với các hình ảnh biến thể.
    FIXED: Sửa lỗi key mapping với Postman
    """
    
    try:
        current_app.logger.info("🎬 BẮT ĐẦU UPDATE SẢN PHẨM")
        
        # Lấy dữ liệu sản phẩm từ form
        product_json = request.form.get('product')
        if not product_json:
            return jsonify({"error": "Thiếu dữ liệu sản phẩm"}), 400
        
        # Parse JSON thành dict
        try:
            product_data = json.loads(product_json)
        except json.JSONDecodeError as e:
            return jsonify({"error": f"Dữ liệu sản phẩm không hợp lệ: {str(e)}"}), 400

        # DEBUG: Log structure của product_data
        current_app.logger.info(f"📦 PRODUCT DATA STRUCTURE:")
        for i, bt in enumerate(product_data.get('cac_bien_the', [])):
            current_app.logger.info(f"  Biến thể {i}: ID={bt.get('id', 'NEW')}, Ảnh={len(bt.get('hinh_anhs', []))}")

        # Xử lý upload ảnh - SỬA LỖI KEY MAPPING
        current_app.logger.info("🖼️ XỬ LÝ UPLOAD ẢNH...")
        
        # Tạo mapping cho files - SỬA: Dùng cả 'image' và 'images'
        files_mapping = {}
        for key, file in request.files.items():
            current_app.logger.info(f"📎 File key: {key}")
            files_mapping[key] = file

        # Xử lý từng biến thể
        for variant_index, variant in enumerate(product_data.get('cac_bien_the', [])):
            variant_id = variant.get('id', 'NEW')
            current_app.logger.info(f"🔧 Xử lý biến thể {variant_index} (ID: {variant_id})")
            
            if 'hinh_anhs' not in variant:
                continue
                
            valid_images = []
            
            for image_index, image_data in enumerate(variant.get('hinh_anhs', [])):
                # Ảnh đã có ID -> ảnh cũ, giữ nguyên
                if image_data.get('id'):
                    valid_images.append(image_data)
                    current_app.logger.info(f"  ✅ Giữ ảnh cũ: ID={image_data['id']}")
                else:
                    # Ảnh mới -> cần upload
                    current_app.logger.info(f"  🆕 Ảnh mới: index={image_index}, alt={image_data.get('alt_text', '')}")
                    
                    # THỬ CÁC FORMAT KEY KHÁC NHAU - SỬA QUAN TRỌNG
                    possible_keys = [
                        f"image[{variant_index}][{image_index}]",  # Postman format
                        f"images[{variant_index}][{image_index}]", # Code format
                        f"image[{variant_index}][{image_index}]",
                        f"images[{variant_index}][{image_index}]"
                    ]
                    
                    file_found = None
                    for key in possible_keys:
                        if key in files_mapping:
                            file_found = files_mapping[key]
                            current_app.logger.info(f"  📁 Tìm thấy file với key: {key}")
                            break
                    
                    if file_found and file_found.filename:
                        try:
                            current_app.logger.info(f"  ⬆️ Uploading file: {file_found.filename}")
                            upload_result = UploadService.upload_direct_to_server(file_found, folder="san_pham")
                            
                            # Cập nhật thông tin ảnh
                            image_data['url'] = upload_result['url']
                            image_data['public_id'] = upload_result['public_id']
                            valid_images.append(image_data)
                            
                            current_app.logger.info(f"  ✅ Upload thành công: {upload_result['url']}")
                        except Exception as e:
                            current_app.logger.error(f"  ❌ Lỗi upload: {str(e)}")
                    else:
                        current_app.logger.warning(f"  ⚠️ Không tìm thấy file cho ảnh mới")
            
            # Cập nhật danh sách ảnh hợp lệ
            variant['hinh_anhs'] = valid_images
            
            # Đảm bảo có ảnh đại diện
            if valid_images and not any(img.get('la_anh_dai_dien') for img in valid_images):
                valid_images[0]['la_anh_dai_dien'] = True
                current_app.logger.info(f"  🏷️ Đặt ảnh đầu tiên làm đại diện")

        # Log kết quả cuối cùng
        current_app.logger.info("📊 KẾT QUẢ XỬ LÝ ẢNH:")
        for i, bt in enumerate(product_data.get('cac_bien_the', [])):
            current_app.logger.info(f"  Biến thể {i}: {len(bt.get('hinh_anhs', []))} ảnh")
            for img in bt.get('hinh_anhs', []):
                current_app.logger.info(f"    - ID: {img.get('id', 'NEW')}, URL: {img.get('url', 'NO_URL')}")

        # Validate và cập nhật
        try:
            san_pham_update = SanPhamUpdate.model_validate(product_data)
        except Exception as e:
            current_app.logger.error(f"❌ Lỗi validate: {str(e)}")
            return jsonify({"error": f"Dữ liệu không hợp lệ: {str(e)}"}), 400

        updated_san_pham = SanPhamService.update_san_pham_with_variants(path.san_pham_id, san_pham_update)
        db.session.commit()
        
        current_app.logger.info("🎉 CẬP NHẬT THÀNH CÔNG")
        response = SanPhamResponse.model_validate(updated_san_pham)
        return jsonify(response.model_dump()), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"💥 Lỗi: {traceback.format_exc()}")
        return jsonify({"error": f"Lỗi server: {str(e)}"}), 500

# ==============================================================
# 5️ XÓA SẢN PHẨM (ADMIN)
# ==============================================================
@product_api.delete(
    '/<int:san_pham_id>',
    responses={"200": DeleteResponse}
)
@admin_required
def delete_san_pham(path: SanPhamPath):
    """Xóa sản phẩm."""
    try:
        # Gọi service xóa sản phẩm và nhận danh sách public_ids
        public_ids = SanPhamService.delete_san_pham(path.san_pham_id)
        
        # Gửi task xóa ảnh trên Cloudinary sau khi commit thành công
        for public_id in public_ids:
            try:
                # Gọi đồng bộ để kiểm tra
                delete_image_task(public_id)
                current_app.logger.info(f"Đã xóa ảnh Cloudinary: {public_id}")
            except Exception as e:
                current_app.logger.error(f"Lỗi xóa ảnh Cloudinary {public_id}: {str(e)}")
        
        return jsonify({"message": "Xóa sản phẩm thành công"}), 200
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except BadRequest as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        current_app.logger.error(f"Lỗi xóa sản phẩm {path.san_pham_id}: {traceback.format_exc()}")
        return jsonify({"error": "Không thể xóa sản phẩm."}), 500
    

# ==============================================================
# ENDPOINT TEST - DEBUG UPLOAD ẢNH
# ==============================================================
@product_api.post('/test-upload')
def test_upload():
    """Endpoint test upload ảnh"""
    try:
        current_app.logger.info("🧪 TEST UPLOAD ENDPOINT")
        
        # Log tất cả form data và files
        current_app.logger.info(f"📋 FORM DATA KEYS: {list(request.form.keys())}")
        current_app.logger.info(f"📁 FILES KEYS: {list(request.files.keys())}")
        
        # Log chi tiết từng file
        for key, file in request.files.items():
            current_app.logger.info(f"📎 FILE DETAIL: {key} -> {file.filename} (size: {len(file.read())} bytes)")
            file.seek(0)  # Reset file pointer
        
        # Log product data nếu có
        if 'product' in request.form:
            try:
                product_data = json.loads(request.form['product'])
                current_app.logger.info(f"📦 PRODUCT DATA: {json.dumps(product_data, indent=2, ensure_ascii=False)}")
            except Exception as e:
                current_app.logger.error(f"❌ Lỗi parse product: {e}")
        
        return jsonify({
            "message": "Test completed",
            "form_keys": list(request.form.keys()),
            "file_keys": list(request.files.keys())
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"💥 Test error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


# ==============================================================
# 6️ LẤY DANH SÁCH SẢN PHẨM CƠ BẢN (ID + TÊN)
# ==============================================================
@product_api.get(
    '/danh-sach-co-ban',
    responses={"200": SanPhamBasicListResponse}
)
def get_all_san_pham_basic():
    """
    Lấy danh sách tất cả sản phẩm chỉ bao gồm ID và tên
    Sử dụng cho dropdown, autocomplete, etc.
    """
    try:
        current_app.logger.info("Lấy danh sách sản phẩm cơ bản")
        
        result = SanPhamService.get_all_san_pham_basic()
        response = SanPhamBasicListResponse.model_validate(result)
        
        return jsonify(response.model_dump()), 200
        
    except BadRequest as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        current_app.logger.error(f"Lỗi lấy danh sách sản phẩm cơ bản: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi lấy danh sách sản phẩm cơ bản."}), 500

# ==============================================================
# 7️ LẤY DANH SÁCH BIẾN THỂ CƠ BẢN THEO SẢN PHẨM
# ==============================================================
@product_api.get(
    '/<int:san_pham_id>/bien-the/danh-sach-co-ban',
    responses={"200": BienTheBasicListResponse}
)
def get_bien_the_basic_by_san_pham(path: SanPhamPath):
    """
    Lấy danh sách biến thể cơ bản (ID + tên) theo ID sản phẩm
    Sử dụng để hiển thị các biến thể của sản phẩm trong dropdown
    """
    try:
        current_app.logger.info(f"Lấy danh sách biến thể cơ bản cho sản phẩm: {path.san_pham_id}")
        
        result = SanPhamService.get_bien_the_basic_by_san_pham(path.san_pham_id)
        response = BienTheBasicListResponse.model_validate(result)
        
        return jsonify(response.model_dump()), 200
        
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except BadRequest as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        current_app.logger.error(f"Lỗi lấy danh sách biến thể cơ bản: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi lấy danh sách biến thể."}), 500