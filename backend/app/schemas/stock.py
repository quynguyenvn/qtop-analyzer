from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class StockBase(BaseModel):
    symbol: str
    name: str
    sector: str
    industry: str
    market_cap: float

class StockCreate(StockBase):
    pass

class StockResponse(StockBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StockRecommendationBase(BaseModel):
    recommendation_type: str
    confidence_score: float
    analysis_summary: str

class StockRecommendationCreate(StockRecommendationBase):
    stock_id: int

class StockRecommendationResponse(StockRecommendationBase):
    id: int
    stock_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PortfolioRecommendation(BaseModel):
    stocks: List[dict]
    allocation: dict
    risk_score: float
    expected_return: float
    analysis_summary: str 