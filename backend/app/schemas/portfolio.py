from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PortfolioBase(BaseModel):
    name: str
    description: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioResponse(PortfolioBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    holdings: List['PortfolioHoldingResponse'] = []

    class Config:
        from_attributes = True

class PortfolioHoldingBase(BaseModel):
    stock_id: int
    quantity: float
    average_price: float

class PortfolioHoldingCreate(PortfolioHoldingBase):
    pass

class PortfolioHoldingResponse(PortfolioHoldingBase):
    id: int
    portfolio_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    stock: 'StockResponse'

    class Config:
        from_attributes = True

class PortfolioAnalysis(BaseModel):
    total_value: float
    daily_change: float
    daily_change_percentage: float
    sector_allocation: dict
    risk_metrics: dict
    performance_metrics: dict
    recommendations: List[str] 