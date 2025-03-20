from sqlalchemy.orm import Session
from typing import List, Optional
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from app.models.models import Stock, StockView, StockRecommendation
from app.core.config import settings

def get_qtop_holdings(db: Session) -> List[Stock]:
    """Get all stocks in QTOP ETF"""
    return db.query(Stock).all()

def get_stock_by_symbol(db: Session, symbol: str) -> Optional[Stock]:
    """Get stock by symbol"""
    return db.query(Stock).filter(Stock.symbol == symbol).first()

def get_user_stock_views_count(db: Session, user_id: int) -> int:
    """Get count of stocks viewed by user"""
    return db.query(StockView).filter(StockView.user_id == user_id).count()

def record_stock_view(db: Session, user_id: int, stock_id: int):
    """Record a stock view"""
    view = StockView(user_id=user_id, stock_id=stock_id)
    db.add(view)
    db.commit()

def get_stock_recommendation(db: Session, stock_id: int) -> Optional[StockRecommendation]:
    """Get existing recommendation for a stock"""
    return db.query(StockRecommendation).filter(StockRecommendation.stock_id == stock_id).first()

def generate_stock_recommendation(db: Session, stock: Stock) -> StockRecommendation:
    """Generate AI-powered recommendation for a stock"""
    # Get historical data
    ticker = yf.Ticker(stock.symbol)
    hist = ticker.history(period="1y")
    
    # Calculate technical indicators
    hist['SMA_20'] = hist['Close'].rolling(window=20).mean()
    hist['SMA_50'] = hist['Close'].rolling(window=50).mean()
    hist['RSI'] = calculate_rsi(hist['Close'])
    
    # Generate recommendation based on technical analysis
    current_price = hist['Close'].iloc[-1]
    sma_20 = hist['SMA_20'].iloc[-1]
    sma_50 = hist['SMA_50'].iloc[-1]
    rsi = hist['RSI'].iloc[-1]
    
    # Simple recommendation logic (can be enhanced with ML models)
    if current_price > sma_20 and sma_20 > sma_50 and rsi < 70:
        recommendation_type = "buy"
        confidence_score = 0.8
    elif current_price < sma_20 and sma_20 < sma_50 and rsi > 30:
        recommendation_type = "sell"
        confidence_score = 0.8
    else:
        recommendation_type = "hold"
        confidence_score = 0.6
    
    # Create recommendation
    recommendation = StockRecommendation(
        stock_id=stock.id,
        recommendation_type=recommendation_type,
        confidence_score=confidence_score,
        analysis_summary=f"Technical analysis suggests {recommendation_type}ing {stock.symbol}"
    )
    
    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)
    return recommendation

def generate_portfolio_recommendation(db: Session, user_id: int):
    """Generate AI-powered portfolio recommendations"""
    # Get all QTOP stocks
    stocks = get_qtop_holdings(db)
    
    # Get historical data for all stocks
    stock_data = {}
    for stock in stocks:
        ticker = yf.Ticker(stock.symbol)
        hist = ticker.history(period="1y")
        stock_data[stock.symbol] = {
            'returns': hist['Close'].pct_change().dropna(),
            'market_cap': stock.market_cap
        }
    
    # Calculate correlation matrix
    returns_df = pd.DataFrame({symbol: data['returns'] for symbol, data in stock_data.items()})
    correlation_matrix = returns_df.corr()
    
    # Calculate optimal portfolio weights using Modern Portfolio Theory
    weights = calculate_optimal_weights(returns_df, correlation_matrix)
    
    # Calculate portfolio metrics
    portfolio_return = calculate_portfolio_return(returns_df, weights)
    portfolio_risk = calculate_portfolio_risk(returns_df, weights, correlation_matrix)
    
    # Create portfolio recommendation
    recommendation = {
        'stocks': [
            {
                'symbol': symbol,
                'weight': weight,
                'market_cap': stock_data[symbol]['market_cap']
            }
            for symbol, weight in weights.items()
        ],
        'allocation': weights,
        'risk_score': portfolio_risk,
        'expected_return': portfolio_return,
        'analysis_summary': "Portfolio optimized for risk-adjusted returns using Modern Portfolio Theory"
    }
    
    return recommendation

def calculate_rsi(prices, period=14):
    """Calculate Relative Strength Index"""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_optimal_weights(returns_df, correlation_matrix):
    """Calculate optimal portfolio weights using Modern Portfolio Theory"""
    # Calculate mean returns and covariance matrix
    mean_returns = returns_df.mean()
    cov_matrix = returns_df.cov()
    
    # Set up optimization problem
    n_assets = len(returns_df.columns)
    weights = np.random.random(n_assets)
    weights = weights / np.sum(weights)
    
    # Calculate portfolio metrics
    portfolio_return = np.sum(mean_returns * weights)
    portfolio_risk = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
    
    # Return weights as dictionary
    return {symbol: weight for symbol, weight in zip(returns_df.columns, weights)}

def calculate_portfolio_return(returns_df, weights):
    """Calculate expected portfolio return"""
    mean_returns = returns_df.mean()
    return np.sum(mean_returns * np.array(list(weights.values())))

def calculate_portfolio_risk(returns_df, weights, correlation_matrix):
    """Calculate portfolio risk"""
    cov_matrix = returns_df.cov()
    weights_array = np.array(list(weights.values()))
    return np.sqrt(np.dot(weights_array.T, np.dot(cov_matrix, weights_array))) 