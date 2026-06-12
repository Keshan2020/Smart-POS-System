from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InventoryTransactionCreate(BaseModel):
    product_id: int
    quantity_change: int
    transaction_type: str
    reference: Optional[str] = None
    notes: Optional[str] = None


class InventoryTransactionResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    business_id: int
    quantity_change: int
    transaction_type: str
    reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
