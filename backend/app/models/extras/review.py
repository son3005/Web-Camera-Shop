from datetime import datetime
from app.extensions import db

class Review(db.Model):
    __tablename__ = 'reviews' # Tương ứng với DanhGia

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) # Thêm cột rating (1-5 sao)
    comment = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # --- Relationships ---
    product = db.relationship('Product', back_populates='reviews')
    user = db.relationship('User', back_populates='reviews')

    def __repr__(self):
        return f'<Review by User ID {self.user_id} for Product ID {self.product_id}>'
        
    def create_review(self, review_data):
        """Tạo một đánh giá mới"""
        pass

    def update_review(self, update_data):
        """Chỉnh sửa đánh giá"""
        pass

    def delete_review(self):
        """Xóa đánh giá"""
        pass