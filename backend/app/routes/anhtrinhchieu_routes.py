from flask import   request, jsonify
import json
from flask_openapi3 import APIBlueprint
from pydantic import ValidationError, BaseModel
from werkzeug.exceptions import BadRequest, NotFound
from ..extensions import db
from ..schemas.khac.AnhTrinhChieu import (
    AnhTrinhChieuCreate,
    AnhTrinhChieuUpdate,
    AnhTrinhChieuDelete,
    AnhTrinhChieuResponsePrivate,
    AnhTrinhChieuResponsePublic,
    DanhSachAnhTrinhChieuResponsePrivate,
    DanhSachAnhTrinhChieuResponsePublic
)
from ..services.anhtrinhchieu_service import AnhTrinhChieuService
from ..services.upload_service import UploadService
from ..utils.decorators import admin_required

class ErrorResponse(BaseModel):
    detail: str

class AnhTrinhChieuPath(BaseModel):
    anh_trinh_chieu_id: int

anhtrinhchieu_api = APIBlueprint('anhtrinhchieu', __name__, url_prefix='/api/anh-trinh-chieu')

@anhtrinhchieu_api.get(
        '/private/<int:anh_trinh_chieu_id>', 
        responses={200: AnhTrinhChieuResponsePrivate}
        )
@admin_required
def get_anh_trinh_chieu_private(path: AnhTrinhChieuPath):
    """Lấy thông tin ảnh trình chiếu theo ID (dành cho admin)"""
    try:
        id_anh_trinh_chieu = path.anh_trinh_chieu_id
        if not id_anh_trinh_chieu:
            raise BadRequest("Thiếu ID ảnh trình chiếu.")
    except ValidationError as e:
        raise BadRequest(e.errors())
    
    anh_trinh_chieu = AnhTrinhChieuService.get_anh_trinh_chieu_by_id(id_anh_trinh_chieu)
    if not anh_trinh_chieu:
        raise NotFound(f"Ảnh trình chiếu với ID {id_anh_trinh_chieu} không tồn tại.")
    return jsonify(anh_trinh_chieu.model_dump())

@anhtrinhchieu_api.get(
        '/private',
        responses={200: DanhSachAnhTrinhChieuResponsePrivate}
        )
@admin_required
def get_all_anh_trinh_chieu_private():
    """Lấy danh sách tất cả ảnh trình chiếu (dành cho admin)"""
    danh_sach = AnhTrinhChieuService.get_all_anh_trinh_chieu_private()
    return jsonify(danh_sach.model_dump())

@anhtrinhchieu_api.get(
        '/public',
        responses={200: DanhSachAnhTrinhChieuResponsePublic}
        )
def get_all_anh_trinh_chieu_public():
    """Lấy danh sách tất cả ảnh trình chiếu (dành cho public)"""
    danh_sach = AnhTrinhChieuService.get_all_anh_trinh_chieu_public()
    return jsonify(danh_sach.model_dump())

@anhtrinhchieu_api.post(
        '/private',
        responses={201: AnhTrinhChieuResponsePrivate}
        )
@admin_required
def create_anh_trinh_chieu():
    """Tạo mới ảnh trình chiếu (dành cho admin)"""
    
    trinh_chieu_anh_json = request.form.get('anh_trinh_chieu')
    if not trinh_chieu_anh_json:
        raise BadRequest("Dữ liệu ảnh trình chiếu không hợp lệ.")
    
    try:
        trinh_chieu_anh_data = json.loads(trinh_chieu_anh_json)
    except json.JSONDecodeError:
        raise BadRequest("Dữ liệu ảnh trình chiếu không hợp lệ.")
    
    file_key = 'anh_trinh_chieu_file'
    file = request.files.get(file_key)
    try:
        upload_result = UploadService.upload_direct_to_server(file, folder="anh_trinh_chieu")
        trinh_chieu_anh_data['hinh_anh_url'] = upload_result['url']
        trinh_chieu_anh_data['public_id'] = upload_result['public_id']
    except Exception as e:
        raise BadRequest(f"Lỗi khi upload hình ảnh: {str(e)}")
    
    try:
        create_data = AnhTrinhChieuCreate(**trinh_chieu_anh_data)
    except ValidationError as e:
        raise BadRequest(f"Dữ liệu không hợp lệ: {e.errors()}")
    
    anh_trinh_chieu_moi = AnhTrinhChieuService.create_anh_trinh_chieu(create_data)
    return jsonify(anh_trinh_chieu_moi.model_dump()), 201

@anhtrinhchieu_api.put(
        '/private/<int:anh_trinh_chieu_id>',
        responses={200: AnhTrinhChieuResponsePrivate}
        )
@admin_required
def update_anh_trinh_chieu(path: AnhTrinhChieuPath):
    """Cập nhật thông tin ảnh trình chiếu (dành cho admin)"""
    try:
        id_anh_trinh_chieu = path.anh_trinh_chieu_id
        if not id_anh_trinh_chieu:
            raise BadRequest("Thiếu ID ảnh trình chiếu.")
    except ValidationError as e:
        raise BadRequest(e.errors())

    try:
        update_data = AnhTrinhChieuUpdate.model_validate(request.json)
    except ValidationError as e:
        raise BadRequest(e.errors())
    
    anh_trinh_chieu_cap_nhat = AnhTrinhChieuService.update_anh_trinh_chieu(id_anh_trinh_chieu, update_data)
    if not anh_trinh_chieu_cap_nhat:
        raise NotFound(f"Ảnh trình chiếu với ID {id_anh_trinh_chieu} không tồn tại.")
    
    return jsonify(anh_trinh_chieu_cap_nhat.model_dump())


 
class DeleteResponse(BaseModel):
    detail: str

@anhtrinhchieu_api.delete(
        '/private/<int:anh_trinh_chieu_id>',
        responses={200: DeleteResponse}
        )
@admin_required
def delete_anh_trinh_chieu(path: AnhTrinhChieuPath):
    """Xóa ảnh trình chiếu (dành cho admin)"""
    try:
        id_anh_trinh_chieu = path.anh_trinh_chieu_id
        if not id_anh_trinh_chieu:
            raise BadRequest("Thiếu ID ảnh trình chiếu.")
    except ValidationError as e:
        raise BadRequest(e.errors())

    xoa_thanh_cong = AnhTrinhChieuService.delete_anh_trinh_chieu(id_anh_trinh_chieu)
    if not xoa_thanh_cong:
        raise NotFound(f"Ảnh trình chiếu với ID {id_anh_trinh_chieu} không tồn tại.")
    
    return jsonify({"detail": "Xóa ảnh trình chiếu thành công."})
