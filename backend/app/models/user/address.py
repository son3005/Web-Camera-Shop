from app.extensions import db

class Address(db.Model):
    __tablename__ = 'addresses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    recipient_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    street_address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20), nullable=True)
    is_default = db.Column(db.Boolean, default=False, nullable=False)
    
    def __repr__(self):
        return f'<Address {self.id} for User ID {self.user_id}>'