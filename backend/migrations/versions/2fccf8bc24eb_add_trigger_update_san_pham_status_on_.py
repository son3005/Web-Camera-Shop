"""add trigger update san pham status on inventory change

Revision ID: 2fccf8bc24eb
Revises: 883a600829d4
Create Date: 2025-10-16 15:11:23.229578

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2fccf8bc24eb'
down_revision = '883a600829d4'
branch_labels = None
depends_on = None


CREATE_TRIGGER_SQL = """
CREATE TRIGGER trg_after_bien_the_update
AFTER UPDATE ON bien_the_san_pham
FOR EACH ROW
BEGIN
    -- Khai báo biến để lưu tổng số lượng tồn kho
    DECLARE total_stock INT;
    
    -- Lấy ID của sản phẩm gốc
    DECLARE root_product_id INT;
    SET root_product_id = NEW.san_pham_goc_id;
    
    -- Tính tổng số lượng tồn kho của tất cả các biến thể thuộc sản phẩm gốc
    SELECT SUM(so_luong_ton) INTO total_stock
    FROM bien_the_san_pham
    WHERE san_pham_goc_id = root_product_id;
    
    -- Logic cập nhật trạng thái
    IF total_stock <= 0 THEN
        -- Nếu hết hàng, cập nhật trạng thái sản phẩm gốc thành 'hết hàng'
        UPDATE san_pham
        SET trang_thai = 'het_hang'
        WHERE id = root_product_id;
    ELSE
        -- Nếu còn hàng, kiểm tra xem sản phẩm gốc có đang 'hết hàng' không
        -- Nếu có thì chuyển lại thành 'đang bán'
        UPDATE san_pham
        SET trang_thai = 'dang_ban'
        WHERE id = root_product_id AND trang_thai = 'het_hang';
    END IF;
END;
"""

# SQL để xóa trigger
DROP_TRIGGER_SQL = "DROP TRIGGER IF EXISTS trg_after_bien_the_update;"

def upgrade():
    """Chạy khi `flask db upgrade`"""
    print("Creating trigger to update product status based on inventory...")
    op.execute(CREATE_TRIGGER_SQL)
    print("Trigger created.")

def downgrade():
    """Chạy khi `flask db downgrade`"""
    print("Dropping trigger for product status...")
    op.execute(DROP_TRIGGER_SQL)
    print("Trigger dropped.")
