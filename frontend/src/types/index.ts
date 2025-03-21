export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export interface PortfolioSummary {
  total_value: number;
  daily_change: number;
  daily_change_percentage: number;
  holdings: Array<{
    symbol: string;
    shares: number;
    average_cost: number;
    current_price: number;
    value: number;
    change_percentage: number;
  }>;
  transactions: Array<{
    id: string;
    date: string;
    type: 'buy' | 'sell';
    symbol: string;
    shares: number;
    price: number;
  }>;
}

export interface StockHolding {
  symbol: string;
  shares: number;
  value: number;
  average_cost: number;
  current_price: number;
  change_percentage: number;
}

export interface Transaction {
  id: number;
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  date: string;
}

export interface QTOPAnalysis {
  current_price: number;
  daily_change: number;
  volume: number;
  market_cap: number;
  price_history: PricePoint[];
  technical_indicators: TechnicalIndicators;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  moving_average_20: number;
  moving_average_50: number;
  bollinger_bands: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface StockData {
  symbol: string;
  current_price: number;
  daily_change: number;
  volume: number;
  market_cap: number;
  price_history: Array<{
    date: string;
    price: number;
  }>;
  technical_indicators: Array<{
    name: string;
    value: number;
    signal: 'buy' | 'sell' | 'hold';
  }>;
  fundamental_metrics: Array<{
    name: string;
    value: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    confidence: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
} 