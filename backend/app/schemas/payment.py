# /backend/app/schemas/payment.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime

class PaymentItem(BaseModel):
    name: str = Field(..., description="Tên sản phẩm")
    quantity: int = Field(..., description="Số lượng")
    price: Decimal = Field(..., description="Giá tiền")

class PaymentCreationRequest(BaseModel):
    orderCode: int = Field(..., description="Mã đơn hàng")
    amount: Decimal = Field(..., description="Tổng số tiền")
    description: str = Field(..., description="Mô tả đơn hàng")
    items: List[PaymentItem] = Field(..., description="Danh sách sản phẩm")
    cancelUrl: str = Field(..., description="URL hủy thanh toán")
    returnUrl: str = Field(..., description="URL trả về sau thanh toán")

    model_config = ConfigDict(from_attributes=True)

class PaymentCreationResponse(BaseModel):
    bin: str
    accountNumber: str
    accountName: str
    amount: Decimal
    description: str
    orderCode: int
    currency: str
    paymentLinkId: str
    status: str
    checkoutUrl: str
    qrCode: str

    model_config = ConfigDict(from_attributes=True)

class PaymentWebhookData(BaseModel):
    orderCode: int = Field(..., description="Mã đơn hàng")
    amount: Decimal = Field(..., description="Số tiền")
    description: str = Field(..., description="Mô tả")
    accountNumber: str = Field(..., description="Số tài khoản")
    reference: str = Field(..., description="Mã tham chiếu")
    transactionDateTime: str = Field(..., description="Thời gian giao dịch")
    currency: str = Field(..., description="Loại tiền tệ")
    paymentLinkId: str = Field(..., description="ID link thanh toán")
    code: str = Field(..., description="Mã kết quả")
    desc: str = Field(..., description="Mô tả kết quả")
    counterAccountBankId: Optional[str] = None
    counterAccountBankName: Optional[str] = None
    counterAccountName: Optional[str] = None
    counterAccountNumber: Optional[str] = None
    virtualAccountName: Optional[str] = None
    virtualAccountNumber: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PaymentWebhookRequest(BaseModel):
    data: PaymentWebhookData
    signature: str = Field(..., description="Chữ ký xác thực")

    model_config = ConfigDict(from_attributes=True)

class PaymentUpdateRequest(BaseModel):
    orderCode: int = Field(..., description="Mã đơn hàng")
    amount: Decimal = Field(..., description="Số tiền")
    description: str = Field(..., description="Mô tả")
    cancelUrl: str = Field(..., description="URL hủy")
    returnUrl: str = Field(..., description="URL trả về")

    model_config = ConfigDict(from_attributes=True)