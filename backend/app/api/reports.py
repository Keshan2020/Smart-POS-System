from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional
from datetime import datetime, date, timedelta
from ..database import get_db
from ..middleware.auth_middleware import get_current_user
from ..models import Sale, SaleItem, Product, User
from ..schemas.sale import SaleListResponse

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/sales-summary")
def sales_summary(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not start_date:
        start_date = (date.today() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = date.today().isoformat()

    sales = db.query(Sale).filter(
        Sale.business_id == current_user.business_id,
        func.date(Sale.created_at) >= start_date,
        func.date(Sale.created_at) <= end_date,
    ).all()

    total_sales = sum(s.total_amount for s in sales)
    total_transactions = len(sales)
    avg_transaction = total_sales / total_transactions if total_transactions > 0 else 0

    payment_methods = {}
    for s in sales:
        payment_methods[s.payment_method] = payment_methods.get(s.payment_method, 0) + s.total_amount

    return {
        "total_sales": round(total_sales, 2),
        "total_transactions": total_transactions,
        "average_transaction": round(avg_transaction, 2),
        "payment_methods": payment_methods,
        "start_date": start_date,
        "end_date": end_date,
    }


@router.get("/top-products")
def top_products(
    limit: int = Query(10),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not start_date:
        start_date = (date.today() - timedelta(days=30)).isoformat()
    if not end_date:
        end_date = date.today().isoformat()

    results = (
        db.query(
            Product.name,
            func.sum(SaleItem.quantity).label("total_quantity"),
            func.sum(SaleItem.total_price).label("total_revenue"),
        )
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(
            Sale.business_id == current_user.business_id,
            func.date(Sale.created_at) >= start_date,
            func.date(Sale.created_at) <= end_date,
        )
        .group_by(Product.id, Product.name)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "name": r[0],
            "total_quantity": int(r[1]),
            "total_revenue": round(float(r[2]), 2),
        }
        for r in results
    ]


@router.get("/daily-sales")
def daily_sales(
    days: int = Query(7),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start = date.today() - timedelta(days=days - 1)
    results = (
        db.query(
            func.date(Sale.created_at).label("sale_date"),
            func.count(Sale.id).label("count"),
            func.sum(Sale.total_amount).label("revenue"),
        )
        .filter(
            Sale.business_id == current_user.business_id,
            func.date(Sale.created_at) >= start,
        )
        .group_by(func.date(Sale.created_at))
        .order_by(func.date(Sale.created_at))
        .all()
    )

    return [
        {
            "date": str(r[0]),
            "count": int(r[1]),
            "revenue": round(float(r[2]), 2),
        }
        for r in results
    ]
