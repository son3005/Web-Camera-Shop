# migrations/versions/c849936e2fac_add_trigger_enforce_single_default_.py

"""add_trigger_enforce_single_default_address"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c849936e2fac' # ID của file này
down_revision = '65f6318516d8' # ID của migration trước đó
branch_labels = None
depends_on = None


# --- SỬA LỖI: Bỏ DELIMITER và đặt trigger vào một biến riêng ---
CREATE_TRIGGER_SQL = """
CREATE TRIGGER trg_before_dia_chi_update
BEFORE UPDATE ON dia_chi
FOR EACH ROW
BEGIN
    -- Chỉ chạy logic nếu địa chỉ mới được set là mặc định
    -- và nó thực sự là một sự thay đổi (từ false -> true)
    IF NEW.la_mac_dinh = TRUE AND OLD.la_mac_dinh = FALSE THEN
        -- Cập nhật tất cả các địa chỉ khác của cùng người dùng về False
        UPDATE dia_chi
        SET la_mac_dinh = FALSE
        WHERE nguoi_dung_id = NEW.nguoi_dung_id AND id != NEW.id;
    END IF;
END;
"""

# Lưu ý: Trigger này chỉ xử lý cho lệnh UPDATE.
# Để hoàn thiện, bạn cần thêm một trigger tương tự cho BEFORE INSERT.
# Dưới đây là ví dụ cho trigger đó.
CREATE_INSERT_TRIGGER_SQL = """
CREATE TRIGGER trg_before_dia_chi_insert
BEFORE INSERT ON dia_chi
FOR EACH ROW
BEGIN
    -- Chỉ chạy khi địa chỉ mới được thêm vào đã là mặc định
    IF NEW.la_mac_dinh = TRUE THEN
        UPDATE dia_chi
        SET la_mac_dinh = FALSE
        WHERE nguoi_dung_id = NEW.nguoi_dung_id;
    END IF;
END;
"""


def upgrade():
    """Chạy khi `flask db upgrade`"""
    print("Creating trigger to enforce single default address on UPDATE...")
    op.execute(CREATE_TRIGGER_SQL)
    
    print("Creating trigger to enforce single default address on INSERT...")
    op.execute(CREATE_INSERT_TRIGGER_SQL)
    
    print("Address triggers created successfully.")


def downgrade():
    """Chạy khi `flask db downgrade`"""
    print("Dropping address triggers...")
    op.execute("DROP TRIGGER IF EXISTS trg_before_dia_chi_update;")
    op.execute("DROP TRIGGER IF EXISTS trg_before_dia_chi_insert;")
    print("Address triggers dropped.")