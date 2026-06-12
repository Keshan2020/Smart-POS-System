from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas.business import BusinessCreate, BusinessUpdate, BusinessResponse
from ..middleware.auth_middleware import get_current_user, require_role
from ..models import Business, User

router = APIRouter(prefix="/api/businesses", tags=["Businesses"])


@router.get("/", response_model=List[BusinessResponse])
def list_businesses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    businesses = db.query(Business).filter(Business.is_active == True).all()
    return [BusinessResponse.model_validate(b) for b in businesses]


@router.post("/", response_model=BusinessResponse, status_code=status.HTTP_201_CREATED)
def create_business(
    request: BusinessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    business = Business(**request.model_dump())
    db.add(business)
    db.commit()
    db.refresh(business)
    return BusinessResponse.model_validate(business)


@router.get("/{business_id}", response_model=BusinessResponse)
def get_business(
    business_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return BusinessResponse.model_validate(business)


@router.put("/{business_id}", response_model=BusinessResponse)
def update_business(
    business_id: int,
    request: BusinessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(business, key, value)
    db.commit()
    db.refresh(business)
    return BusinessResponse.model_validate(business)
