# app/routes/export_routes.py
import traceback
from flask import jsonify, send_file
from flask_openapi3 import APIBlueprint
from io import BytesIO
from openpyxl import Workbook
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from ..utils.decorators import admin_required
from ..services.sanpham_service import SanPhamService

export_api = APIBlueprint('export_api', __name__, url_prefix='/api/san-pham')

def get_product_stats(product):
    """
    Tính toán thống kê cho sản phẩm
    """
    variants = product.cac_bien_the or []
    prices = [float(variant.gia_ban) for variant in variants if variant.gia_ban]
    total_stock = sum(variant.so_luong_ton for variant in variants)
    
    return {
        'min_price': min(prices) if prices else 0,
        'max_price': max(prices) if prices else 0,
        'total_stock': total_stock
    }

@export_api.get('/export/excel')
@admin_required
def export_products_excel():
    """Export danh sách sản phẩm ra Excel"""
    try:
        # Lấy tất cả sản phẩm (không phân trang)
        result = SanPhamService.get_all_san_pham(page=1, per_page=1000)  # Số lớn để lấy tất cả
        products = result.get('data', [])
        
        # Tạo workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Danh sách Sản phẩm"
        
        # Headers
        headers = ['Mã SP', 'Tên Sản Phẩm', 'Danh Mục', 'Thương Hiệu', 'Giá Thấp Nhất', 'Giá Cao Nhất', 'Tổng Tồn Kho']
        ws.append(headers)
        
        # Style header
        for col in range(1, len(headers) + 1):
            ws.cell(row=1, column=col).font = {'bold': True, 'color': 'FFFFFF'}
            ws.cell(row=1, column=col).fill = {'fill_type': 'solid', 'start_color': '366092'}
        
        # Data
        for product in products:
            stats = get_product_stats(product)
            ws.append([
                product['ma_san_pham'],
                product['ten_san_pham'],
                product['danh_muc']['ten_danh_muc'],
                product['thuong_hieu']['ten_thuong_hieu'],
                stats['min_price'],
                stats['max_price'],
                stats['total_stock']
            ])
        
        # Auto adjust column widths
        for column_cells in ws.columns:
            length = max(len(str(cell.value)) for cell in column_cells)
            ws.column_dimensions[column_cells[0].column_letter].width = length + 2
        
        # Tạo response
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name='danh-sach-san-pham.xlsx',
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        
    except Exception as e:
        current_app.logger.error(f"Lỗi export Excel: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi khi export Excel"}), 500

@export_api.get('/export/pdf')
@admin_required
def export_products_pdf():
    """Export danh sách sản phẩm ra PDF"""
    try:
        # Lấy dữ liệu sản phẩm
        result = SanPhamService.get_all_san_pham(page=1, per_page=1000)
        products = result.get('data', [])
        
        # Tạo PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Tiêu đề
        styles = getSampleStyleSheet()
        title = Paragraph("DANH SÁCH SẢN PHẨM", styles['Title'])
        elements.append(title)
        elements.append(Paragraph("<br/>", styles['Normal']))
        
        # Dữ liệu bảng
        data = [['Mã SP', 'Tên Sản Phẩm', 'Danh Mục', 'Thương Hiệu', 'Giá Thấp', 'Giá Cao', 'Tồn Kho']]
        
        for product in products:
            stats = get_product_stats(product)
            data.append([
                product['ma_san_pham'],
                product['ten_san_pham'],
                product['danh_muc']['ten_danh_muc'],
                product['thuong_hieu']['ten_thuong_hieu'],
                f"{stats['min_price']:,.0f}",
                f"{stats['max_price']:,.0f}",
                str(stats['total_stock'])
            ])
        
        # Tạo bảng
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#366092')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        doc.build(elements)
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name='danh-sach-san-pham.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        current_app.logger.error(f"Lỗi export PDF: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi khi export PDF"}), 500