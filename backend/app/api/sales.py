from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from datetime import datetime, date
from ..database import get_db
from ..schemas.sale import SaleCreate, SaleResponse, SaleListResponse
from ..middleware.auth_middleware import get_current_user
from ..models import Sale, SaleItem, Product, InventoryTransaction, User
from ..models.customer import Customer

router = APIRouter(prefix="/api/sales", tags=["Sales"])


def generate_invoice_number(db: Session, business_id: int) -> str:
    today = date.today()
    count = db.query(func.count(Sale.id)).filter(
        Sale.business_id == business_id,
        func.date(Sale.created_at) == today,
    ).scalar() or 0
    return f"INV-{business_id}-{today.strftime('%Y%m%d')}-{count + 1:04d}"


@router.get("/", response_model=List[SaleListResponse])
def list_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sales = db.query(Sale).options(
        joinedload(Sale.cashier),
        joinedload(Sale.customer),
    ).filter(
        Sale.business_id == current_user.business_id,
    ).order_by(Sale.created_at.desc()).limit(100).all()

    result = []
    for s in sales:
        item = SaleListResponse.model_validate(s)
        item.cashier_name = s.cashier.full_name if s.cashier else None
        item.customer_name = s.customer.name if s.customer else None
        result.append(item)
    return result


@router.post("/", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(
    request: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not request.items:
        raise HTTPException(status_code=400, detail="Sale must have at least one item")

    subtotal = 0.0
    sale_items = []

    for item_data in request.items:
        product = db.query(Product).filter(
            Product.id == item_data.product_id,
            Product.business_id == current_user.business_id,
        ).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_data.product_id} not found")
        if product.stock_quantity < item_data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}: available {product.stock_quantity}",
            )

        total_price = (item_data.unit_price * item_data.quantity) - item_data.discount
        subtotal += total_price

        sale_items.append({
            "product_id": product.id,
            "quantity": item_data.quantity,
            "unit_price": item_data.unit_price,
            "discount": item_data.discount,
            "total_price": total_price,
        })

    tax_amount = subtotal * 0.0
    total_amount = subtotal + tax_amount - request.discount_amount

    invoice_number = generate_invoice_number(db, current_user.business_id)

    sale = Sale(
        invoice_number=invoice_number,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=request.discount_amount,
        total_amount=total_amount,
        payment_method=request.payment_method,
        payment_status="paid",
        notes=request.notes,
        cashier_id=current_user.id,
        customer_id=request.customer_id,
        business_id=current_user.business_id,
    )
    db.add(sale)
    db.flush()

    for item_data in sale_items:
        sale_item = SaleItem(
            sale_id=sale.id,
            **item_data,
        )
        db.add(sale_item)

        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        product.stock_quantity -= item_data["quantity"]

        transaction = InventoryTransaction(
            product_id=item_data["product_id"],
            business_id=current_user.business_id,
            quantity_change=-item_data["quantity"],
            transaction_type="sale",
            reference=invoice_number,
        )
        db.add(transaction)

    db.commit()
    db.refresh(sale)

    sale = db.query(Sale).options(
        joinedload(Sale.items).joinedload(SaleItem.product),
        joinedload(Sale.cashier),
        joinedload(Sale.customer),
    ).filter(Sale.id == sale.id).first()

    resp = SaleResponse.model_validate(sale)
    resp.cashier_name = sale.cashier.full_name if sale.cashier else None
    resp.customer_name = sale.customer.name if sale.customer else None
    for item_resp, item in zip(resp.items, sale.items):
        item_resp.product_name = item.product.name if item.product else None
    return resp


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sale = db.query(Sale).options(
        joinedload(Sale.items).joinedload(SaleItem.product),
        joinedload(Sale.cashier),
        joinedload(Sale.customer),
    ).filter(
        Sale.id == sale_id,
        Sale.business_id == current_user.business_id,
    ).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    resp = SaleResponse.model_validate(sale)
    resp.cashier_name = sale.cashier.full_name if sale.cashier else None
    resp.customer_name = sale.customer.name if sale.customer else None
    for item_resp, item in zip(resp.items, sale.items):
        item_resp.product_name = item.product.name if item.product else None
    return resp
