# migrations/versions/65f6318516d8_add_triggers_inventory_management.py

"""add_triggers_inventory_management"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '65f6318516d8' # ID của file này
down_revision = 'e4f5509b80c5' # ID của migration trước đó
branch_labels = None
depends_on = None

# --- SỬA LỖI: Tách mỗi trigger thành một biến riêng, BỎ DELIMITER ---

# Trigger 1: Trừ tồn kho khi có đơn hàng mới
CREATE_DECREASE_STOCK_TRIGGER = """
CREATE TRIGGER trg_after_order_detail_insert
AFTER INSERT ON chi_tiet_don_hang
FOR EACH ROW
BEGIN
    UPDATE bien_the_san_pham
    SET so_luong_ton = so_luong_ton - NEW.so_luong
    WHERE id = NEW.bien_the_san_pham_id;
END;
"""

# Trigger 2: Cộng trả tồn kho khi hủy đơn hàng
CREATE_INCREASE_STOCK_TRIGGER = """
CREATE TRIGGER trg_after_order_detail_delete
AFTER DELETE ON chi_tiet_don_hang
FOR EACH ROW
BEGIN
    UPDATE bien_the_san_pham
    SET so_luong_ton = so_luong_ton + OLD.so_luong
    WHERE id = OLD.bien_the_san_pham_id;
END;
"""

def upgrade():
    """Chạy khi `flask db upgrade`"""
    print("Creating trigger to decrease stock on new order...")
    op.execute(CREATE_DECREASE_STOCK_TRIGGER)
    
    print("Creating trigger to increase stock on order deletion...")
    op.execute(CREATE_INCREASE_STOCK_TRIGGER)
    
    print("Inventory management triggers created successfully.")


def downgrade():
    """Chạy khi `flask db downgrade`"""
    print("Dropping inventory management triggers...")
    op.execute("DROP TRIGGER IF EXISTS trg_after_order_detail_insert;")
    op.execute("DROP TRIGGER IF EXISTS trg_after_order_detail_delete;")
    print("Triggers dropped successfully.")