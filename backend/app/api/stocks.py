from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.models import User, Stock, StockView, StockRecommendation
from app.schemas.stock import StockResponse, StockRecommendationResponse
from app.services import auth_service, stock_service
from app.core.config import settings

router = APIRouter()

@router.get("/qtop-holdings", response_model=List[StockResponse])
async def get_qtop_holdings(
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get all stocks in QTOP ETF"""
    return stock_service.get_qtop_holdings(db)

@router.get("/stock/{symbol}", response_model=StockResponse)
async def get_stock_details(
    symbol: str,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific stock"""
    # Check if user has reached their free tier limit
    if current_user.role == "free":
        view_count = stock_service.get_user_stock_views_count(db, current_user.id)
        if view_count >= settings.MAX_FREE_STOCK_VIEWS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Free tier limit reached. Please upgrade to premium to view more stocks."
            )
    
    stock = stock_service.get_stock_by_symbol(db, symbol)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    # Record the view
    stock_service.record_stock_view(db, current_user.id, stock.id)
    
    return stock

@router.get("/stock/{symbol}/recommendation", response_model=StockRecommendationResponse)
async def get_stock_recommendation(
    symbol: str,
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered recommendation for a specific stock"""
    if current_user.role == "free":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required for stock recommendations"
        )
    
    stock = stock_service.get_stock_by_symbol(db, symbol)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    recommendation = stock_service.get_stock_recommendation(db, stock.id)
    if not recommendation:
        # Generate new recommendation if none exists
        recommendation = stock_service.generate_stock_recommendation(db, stock)
    
    return recommendation

@router.get("/portfolio-recommendation")
async def get_portfolio_recommendation(
    current_user: User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered portfolio recommendations"""
    if current_user.role == "free":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required for portfolio recommendations"
        )
    
    return stock_service.generate_portfolio_recommendation(db, current_user.id) 