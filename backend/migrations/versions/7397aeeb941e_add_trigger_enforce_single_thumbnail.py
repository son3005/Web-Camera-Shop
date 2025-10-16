"""add_trigger_enforce_single_thumbnail

Revision ID: 7397aeeb941e
Revises: 2fccf8bc24eb
Create Date: 2025-10-16 15:23:03.826860

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7397aeeb941e'
down_revision = '2fccf8bc24eb'
branch_labels = None
depends_on = None


# Một thủ tục (procedure) tái sử dụng để cập nhật
# Giúp code trigger gọn gàng hơn
PROCEDURE_UPDATE_RATING_SQL = """
CREATE PROCEDURE sp_UpdateAverageRating(IN product_id INT)
BEGIN
    DECLARE avg_rating FLOAT;
    DECLARE count_rating INT;

    -- Tính toán điểm trung bình và số lượt đánh giá
    SELECT IFNULL(AVG(diem_danh_gia), 0), COUNT(id)
    INTO avg_rating, count_rating
    FROM danh_gia
    WHERE san_pham_id = product_id AND trang_thai = 'DA_DUYET';

    -- Cập nhật vào bảng san_pham
    UPDATE san_pham
    SET diem_trung_binh = avg_rating, luot_danh_gia = count_rating
    WHERE id = product_id;
END;
"""

# Trigger khi có đánh giá mới
TRIGGER_AFTER_INSERT_SQL = """
CREATE TRIGGER trg_danh_gia_after_insert
AFTER INSERT ON danh_gia
FOR EACH ROW
BEGIN
    -- Gọi procedure để cập nhật
    CALL sp_UpdateAverageRating(NEW.san_pham_id);
END;
"""

# Trigger khi đánh giá bị xóa
TRIGGER_AFTER_DELETE_SQL = """
CREATE TRIGGER trg_danh_gia_after_delete
AFTER DELETE ON danh_gia
FOR EACH ROW
BEGIN
    -- Dùng OLD vì bản ghi đã bị xóa
    CALL sp_UpdateAverageRating(OLD.san_pham_id);
END;
"""

# Trigger khi đánh giá được cập nhật (ví dụ admin đổi trạng thái)
TRIGGER_AFTER_UPDATE_SQL = """
CREATE TRIGGER trg_danh_gia_after_update
AFTER UPDATE ON danh_gia
FOR EACH ROW
BEGIN
    -- Cập nhật cho cả sản phẩm cũ và mới nếu san_pham_id thay đổi (hiếm)
    CALL sp_UpdateAverageRating(OLD.san_pham_id);
    IF OLD.san_pham_id != NEW.san_pham_id THEN
        CALL sp_UpdateAverageRating(NEW.san_pham_id);
    END IF;
END;
"""


def upgrade():
    op.execute(PROCEDURE_UPDATE_RATING_SQL)
    op.execute(TRIGGER_AFTER_INSERT_SQL)
    op.execute(TRIGGER_AFTER_DELETE_SQL)
    op.execute(TRIGGER_AFTER_UPDATE_SQL)

def downgrade():
    op.execute("DROP TRIGGER IF EXISTS trg_danh_gia_after_insert;")
    op.execute("DROP TRIGGER IF EXISTS trg_danh_gia_after_delete;")
    op.execute("DROP TRIGGER IF EXISTS trg_danh_gia_after_update;")
    op.execute("DROP PROCEDURE IF EXISTS sp_UpdateAverageRating;")