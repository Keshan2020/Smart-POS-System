from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import date
from ..database import get_db
from ..middleware.auth_middleware import get_current_user
from ..models import Sale, SaleItem, Product, Customer, User
from ..schemas.dashboard import DashboardStats
from ..schemas.sale import SaleListResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    business_id = current_user.business_id

    today_sales = db.query(func.coalesce(func.sum(Sale.total_amount), 0)).filter(
        Sale.business_id == business_id,
        func.date(Sale.created_at) == today,
    ).scalar() or 0

    today_count = db.query(func.count(Sale.id)).filter(
        Sale.business_id == business_id,
        func.date(Sale.created_at) == today,
    ).scalar() or 0

    total_products = db.query(func.count(Product.id)).filter(
        Product.business_id == business_id,
        Product.is_active == True,
    ).scalar() or 0

    low_stock = db.query(func.count(Product.id)).filter(
        Product.business_id == business_id,
        Product.is_active == True,
        Product.stock_quantity <= Product.min_stock_level,
    ).scalar() or 0

    total_customers = db.query(func.count(Customer.id)).filter(
        Customer.business_id == business_id,
        Customer.is_active == True,
    ).scalar() or 0

    payment_methods = (
        db.query(Sale.payment_method, func.coalesce(func.sum(Sale.total_amount), 0))
        .filter(Sale.business_id == business_id, func.date(Sale.created_at) == today)
        .group_by(Sale.payment_method)
        .all()
    )
    sales_by_payment = {pm: float(amt) for pm, amt in payment_methods}

    recent_sales_query = (
        db.query(Sale)
        .options(joinedload(Sale.cashier), joinedload(Sale.customer))
        .filter(Sale.business_id == business_id)
        .order_by(Sale.created_at.desc())
        .limit(5)
        .all()
    )
    recent = []
    for s in recent_sales_query:
        item = SaleListResponse.model_validate(s)
        item.cashier_name = s.cashier.full_name if s.cashier else None
        item.customer_name = s.customer.name if s.customer else None
        recent.append(item)

    top_products_query = (
        db.query(Product.name, func.sum(SaleItem.quantity).label("qty"))
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.business_id == business_id, func.date(Sale.created_at) == today)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(5)
        .all()
    )
    top = [{"name": name, "quantity": int(qty)} for name, qty in top_products_query]

    return DashboardStats(
        total_sales_today=float(today_sales),
        total_transactions_today=int(today_count),
        total_products=int(total_products),
        low_stock_count=int(low_stock),
        total_customers=int(total_customers),
        sales_by_payment_method=sales_by_payment,
        recent_sales=recent,
        top_products=top,
    )
