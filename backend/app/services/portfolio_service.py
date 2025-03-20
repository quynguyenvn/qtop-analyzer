from sqlalchemy.orm import Session
from typing import List, Optional
import yfinance as yf
import pandas as pd
import numpy as np
from app.models.models import Portfolio, PortfolioHolding, Stock
from app.schemas.portfolio import PortfolioCreate, PortfolioHoldingCreate

def create_portfolio(db: Session, portfolio: PortfolioCreate, user_id: int) -> Portfolio:
    """Create a new portfolio"""
    db_portfolio = Portfolio(
        name=portfolio.name,
        description=portfolio.description,
        user_id=user_id
    )
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

def get_user_portfolios(db: Session, user_id: int) -> List[Portfolio]:
    """Get all portfolios for a user"""
    return db.query(Portfolio).filter(Portfolio.user_id == user_id).all()

def get_portfolio(db: Session, portfolio_id: int) -> Optional[Portfolio]:
    """Get a specific portfolio"""
    return db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()

def add_holding(db: Session, portfolio_id: int, holding: PortfolioHoldingCreate) -> Portfolio:
    """Add a stock holding to a portfolio"""
    portfolio = get_portfolio(db, portfolio_id)
    if not portfolio:
        raise ValueError("Portfolio not found")
    
    db_holding = PortfolioHolding(
        portfolio_id=portfolio_id,
        stock_id=holding.stock_id,
        quantity=holding.quantity,
        average_price=holding.average_price
    )
    db.add(db_holding)
    db.commit()
    db.refresh(portfolio)
    return portfolio

def remove_holding(db: Session, portfolio_id: int, holding_id: int) -> Portfolio:
    """Remove a stock holding from a portfolio"""
    portfolio = get_portfolio(db, portfolio_id)
    if not portfolio:
        raise ValueError("Portfolio not found")
    
    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id,
        PortfolioHolding.portfolio_id == portfolio_id
    ).first()
    
    if holding:
        db.delete(holding)
        db.commit()
        db.refresh(portfolio)
    
    return portfolio

def analyze_portfolio(db: Session, portfolio_id: int):
    """Analyze a portfolio's performance and provide recommendations"""
    portfolio = get_portfolio(db, portfolio_id)
    if not portfolio:
        raise ValueError("Portfolio not found")
    
    # Get current prices for all holdings
    holdings_data = []
    for holding in portfolio.holdings:
        ticker = yf.Ticker(holding.stock.symbol)
        current_price = ticker.info.get('regularMarketPrice', 0)
        holdings_data.append({
            'symbol': holding.stock.symbol,
            'quantity': holding.quantity,
            'average_price': holding.average_price,
            'current_price': current_price,
            'sector': holding.stock.sector
        })
    
    # Calculate portfolio metrics
    total_value = sum(h['quantity'] * h['current_price'] for h in holdings_data)
    total_cost = sum(h['quantity'] * h['average_price'] for h in holdings_data)
    daily_change = sum(h['quantity'] * (h['current_price'] - h['average_price']) for h in holdings_data)
    daily_change_percentage = (daily_change / total_cost) * 100 if total_cost > 0 else 0
    
    # Calculate sector allocation
    sector_allocation = {}
    for holding in holdings_data:
        sector = holding['sector']
        value = holding['quantity'] * holding['current_price']
        sector_allocation[sector] = sector_allocation.get(sector, 0) + value
    
    # Normalize sector allocation to percentages
    total = sum(sector_allocation.values())
    sector_allocation = {k: (v / total) * 100 for k, v in sector_allocation.items()}
    
    # Calculate risk metrics
    returns = []
    for holding in holdings_data:
        ticker = yf.Ticker(holding['symbol'])
        hist = ticker.history(period="1y")
        returns.append(hist['Close'].pct_change().dropna())
    
    if returns:
        returns_df = pd.DataFrame(returns).T
        risk_metrics = {
            'volatility': returns_df.std().mean() * np.sqrt(252),  # Annualized volatility
            'sharpe_ratio': (returns_df.mean() * 252) / (returns_df.std() * np.sqrt(252)),
            'beta': calculate_beta(returns_df)
        }
    else:
        risk_metrics = {
            'volatility': 0,
            'sharpe_ratio': 0,
            'beta': 1
        }
    
    # Calculate performance metrics
    performance_metrics = {
        'total_return': ((total_value - total_cost) / total_cost) * 100 if total_cost > 0 else 0,
        'daily_return': daily_change_percentage,
        'cost_basis': total_cost,
        'market_value': total_value
    }
    
    # Generate recommendations
    recommendations = generate_recommendations(holdings_data, sector_allocation, risk_metrics)
    
    return {
        'total_value': total_value,
        'daily_change': daily_change,
        'daily_change_percentage': daily_change_percentage,
        'sector_allocation': sector_allocation,
        'risk_metrics': risk_metrics,
        'performance_metrics': performance_metrics,
        'recommendations': recommendations
    }

def calculate_beta(returns_df):
    """Calculate portfolio beta"""
    # Get market returns (using S&P 500 as proxy)
    market = yf.Ticker("^GSPC")
    market_returns = market.history(period="1y")['Close'].pct_change().dropna()
    
    # Align dates
    aligned_returns = returns_df.join(market_returns, how='inner')
    portfolio_returns = aligned_returns.iloc[:, :-1].mean(axis=1)
    market_returns = aligned_returns.iloc[:, -1]
    
    # Calculate beta
    covariance = portfolio_returns.cov(market_returns)
    market_variance = market_returns.var()
    beta = covariance / market_variance if market_variance != 0 else 1
    
    return beta

def generate_recommendations(holdings_data, sector_allocation, risk_metrics):
    """Generate portfolio recommendations"""
    recommendations = []
    
    # Check sector concentration
    max_sector_weight = max(sector_allocation.values())
    if max_sector_weight > 50:
        recommendations.append("Consider reducing exposure to concentrated sectors for better diversification")
    
    # Check risk metrics
    if risk_metrics['volatility'] > 0.2:  # 20% annualized volatility threshold
        recommendations.append("Portfolio volatility is high. Consider adding more defensive stocks")
    
    if risk_metrics['beta'] > 1.2:
        recommendations.append("Portfolio beta is high. Consider adding more defensive positions")
    
    # Check individual holdings
    for holding in holdings_data:
        if holding['current_price'] < holding['average_price'] * 0.8:  # 20% loss threshold
            recommendations.append(f"Consider reviewing {holding['symbol']} position due to significant loss")
    
    return recommendations 