from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas.inventory import InventoryTransactionCreate, InventoryTransactionResponse
from ..middleware.auth_middleware import get_current_user
from ..models import InventoryTransaction, Product, User

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("/transactions", response_model=List[InventoryTransactionResponse])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = db.query(InventoryTransaction).filter(
        InventoryTransaction.business_id == current_user.business_id,
    ).order_by(InventoryTransaction.created_at.desc()).limit(100).all()

    result = []
    for t in transactions:
        item = InventoryTransactionResponse.model_validate(t)
        product = db.query(Product).filter(Product.id == t.product_id).first()
        item.product_name = product.name if product else None
        result.append(item)
    return result


@router.post("/adjust", response_model=InventoryTransactionResponse)
def adjust_inventory(
    request: InventoryTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(
        Product.id == request.product_id,
        Product.business_id == current_user.business_id,
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.stock_quantity += request.quantity_change

    transaction = InventoryTransaction(
        **request.model_dump(),
        business_id=current_user.business_id,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    resp = InventoryTransactionResponse.model_validate(transaction)
    resp.product_name = product.name
    return resp
