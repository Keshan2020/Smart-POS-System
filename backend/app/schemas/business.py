from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BusinessCreate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tax_id: Optional[str] = None
    currency: str = "USD"


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tax_id: Optional[str] = None
    currency: Optional[str] = None


class BusinessResponse(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tax_id: Optional[str] = None
    currency: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
