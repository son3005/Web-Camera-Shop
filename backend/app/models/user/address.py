from extensions import db

class Address(db.Model):
    __tablename__ = "addresses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    receiver_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    line1 = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(120))
    province = db.Column(db.String(120))
    postal_code = db.Column(db.String(20))
    is_default = db.Column(db.Boolean, default=False)

    user = db.relationship("User", back_populates="addresses")