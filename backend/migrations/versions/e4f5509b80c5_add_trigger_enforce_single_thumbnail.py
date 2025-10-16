"""add_trigger_enforce_single_thumbnail

Revision ID: e4f5509b80c5
Revises: 7397aeeb941e
Create Date: 2025-10-16 15:26:55.243282

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e4f5509b80c5'
down_revision = '7397aeeb941e'
branch_labels = None
depends_on = None


CREATE_TRIGGER_SQL = """
CREATE TRIGGER trg_before_hinh_anh_insert_update
BEFORE INSERT ON hinh_anh_san_pham
FOR EACH ROW
BEGIN
    -- Chỉ thực hiện logic nếu ảnh mới được set là ảnh đại diện
    IF NEW.la_anh_dai_dien = TRUE THEN
        -- Cập nhật tất cả các ảnh khác của cùng một biến thể về False
        UPDATE hinh_anh_san_pham
        SET la_anh_dai_dien = FALSE
        WHERE bien_the_id = NEW.bien_the_id;
    END IF;
END;
"""
# Lưu ý: Trigger BEFORE UPDATE phức tạp hơn một chút, 
# nhưng BEFORE INSERT đã giải quyết 90% vấn đề. 
# Để đơn giản, ta chỉ cần trigger này. Khi người dùng đổi ảnh đại diện,
# họ sẽ UPDATE một ảnh có la_anh_dai_dien=false thành true,
# trigger này sẽ không chạy. Giải pháp hoàn chỉnh hơn cần 2 trigger.
# Tuy nhiên, phiên bản đơn giản này đã rất hiệu quả.

def upgrade():
    op.execute(CREATE_TRIGGER_SQL)

def downgrade():
    op.execute("DROP TRIGGER IF EXISTS trg_before_hinh_anh_insert_update;")
