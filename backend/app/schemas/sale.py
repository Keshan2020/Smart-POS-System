from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    discount: float = 0.0


class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    payment_method: str = "cash"
    notes: Optional[str] = None
    discount_amount: float = 0.0
    items: List[SaleItemCreate]


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: int
    unit_price: float
    discount: float
    total_price: float

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    invoice_number: str
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    payment_method: str
    payment_status: str
    notes: Optional[str] = None
    cashier_id: int
    cashier_name: Optional[str] = None
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    business_id: int
    items: List[SaleItemResponse] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SaleListResponse(BaseModel):
    id: int
    invoice_number: str
    total_amount: float
    payment_method: str
    payment_status: str
    cashier_name: Optional[str] = None
    customer_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
