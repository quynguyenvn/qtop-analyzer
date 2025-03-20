from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import User, Portfolio, PortfolioHolding
from app.schemas.portfolio import PortfolioCreate, PortfolioResponse, PortfolioHoldingCreate
from app.services import auth_service, portfolio_service
from app.core.config import settings

router = APIRouter()

@router.post("/", response_model=PortfolioResponse)
async def create_portfolio(
    portfolio: PortfolioCreate,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new portfolio"""
    return portfolio_service.create_portfolio(db, portfolio, current_user.id)

@router.get("/", response_model=List[PortfolioResponse])
async def get_user_portfolios(
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get all portfolios for the current user"""
    return portfolio_service.get_user_portfolios(db, current_user.id)

@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: int,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific portfolio"""
    portfolio = portfolio_service.get_portfolio(db, portfolio_id)
    if not portfolio or portfolio.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@router.post("/{portfolio_id}/holdings", response_model=PortfolioResponse)
async def add_holding(
    portfolio_id: int,
    holding: PortfolioHoldingCreate,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Add a stock holding to a portfolio"""
    portfolio = portfolio_service.get_portfolio(db, portfolio_id)
    if not portfolio or portfolio.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio_service.add_holding(db, portfolio_id, holding)

@router.delete("/{portfolio_id}/holdings/{holding_id}")
async def remove_holding(
    portfolio_id: int,
    holding_id: int,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a stock holding from a portfolio"""
    portfolio = portfolio_service.get_portfolio(db, portfolio_id)
    if not portfolio or portfolio.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio_service.remove_holding(db, portfolio_id, holding_id)

@router.get("/{portfolio_id}/analysis")
async def get_portfolio_analysis(
    portfolio_id: int,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed analysis of a portfolio"""
    if current_user.role == "free":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required for portfolio analysis"
        )
    
    portfolio = portfolio_service.get_portfolio(db, portfolio_id)
    if not portfolio or portfolio.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    return portfolio_service.analyze_portfolio(db, portfolio_id) 