from pydantic import BaseModel
from typing import Optional


class DashboardStats(BaseModel):
    total_sales_today: float = 0
    total_transactions_today: int = 0
    total_products: int = 0
    low_stock_count: int = 0
    total_customers: int = 0
    sales_by_payment_method: dict = {}
    recent_sales: list = []
    top_products: list = []
