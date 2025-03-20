import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StockAnalysis {
  current_price: number;
  daily_change: number;
  daily_change_percentage: number;
  volume: number;
  market_cap: number;
  price_history: Array<{
    date: string;
    price: number;
  }>;
  technical_indicators: {
    rsi: number;
    macd: number;
    moving_average_20: number;
    moving_average_50: number;
    bollinger_bands: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
  fundamental_analysis: {
    pe_ratio: number;
    dividend_yield: number;
    expense_ratio: number;
    holdings_count: number;
  };
  sentiment_analysis: {
    overall_sentiment: 'positive' | 'neutral' | 'negative';
    news_sentiment: number;
    social_sentiment: number;
  };
}

const StockAnalysis: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'1d' | '1w' | '1m' | '3m' | '1y'>('1m');

  const { data: analysisData, isLoading } = useQuery<StockAnalysis>(
    ['stock-analysis', timeframe],
    async () => {
      const response = await axios.get(`/api/stocks/qtop/analysis?timeframe=${timeframe}`);
      return response.data;
    }
  );

  const priceChartData = analysisData?.price_history ? {
    labels: analysisData.price_history.map(item => item.date),
    datasets: [
      {
        label: 'QTOP Price',
        data: analysisData.price_history.map(item => item.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      },
      {
        label: '20-Day MA',
        data: analysisData.price_history.map(() => analysisData.technical_indicators.moving_average_20),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderDash: [5, 5],
      },
      {
        label: '50-Day MA',
        data: analysisData.price_history.map(() => analysisData.technical_indicators.moving_average_50),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderDash: [5, 5],
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'QTOP Price History',
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">QTOP ETF Analysis</h2>
          <div className="flex space-x-2">
            {(['1d', '1w', '1m', '3m', '1y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeframe === tf
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Current Price</h3>
            <p className="text-2xl font-semibold text-gray-900">
              ${analysisData?.current_price?.toFixed(2) ?? '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Daily Change</h3>
            <p className={`text-2xl font-semibold ${analysisData?.daily_change && analysisData.daily_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${analysisData?.daily_change?.toFixed(2) ?? '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Volume</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {analysisData?.volume?.toLocaleString() ?? '0'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Market Cap</h3>
            <p className="text-2xl font-semibold text-gray-900">
              ${analysisData?.market_cap?.toLocaleString() ?? '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        {priceChartData && <Line data={priceChartData} options={chartOptions} />}
      </div>

      {/* Technical Analysis */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Technical Indicators</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">RSI</h4>
                <p className="text-xl font-semibold text-gray-900">
                  {analysisData?.technical_indicators?.rsi?.toFixed(2) ?? '0.00'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">MACD</h4>
                <p className="text-xl font-semibold text-gray-900">
                  {analysisData?.technical_indicators?.macd?.toFixed(2) ?? '0.00'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">20-Day MA</h4>
                <p className="text-xl font-semibold text-gray-900">
                  ${analysisData?.technical_indicators?.moving_average_20?.toFixed(2) ?? '0.00'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">50-Day MA</h4>
                <p className="text-xl font-semibold text-gray-900">
                  ${analysisData?.technical_indicators?.moving_average_50?.toFixed(2) ?? '0.00'}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Bollinger Bands</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Upper</h4>
                <p className="text-xl font-semibold text-gray-900">
                  ${analysisData?.technical_indicators?.bollinger_bands?.upper?.toFixed(2) ?? '0.00'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Middle</h4>
                <p className="text-xl font-semibold text-gray-900">
                  ${analysisData?.technical_indicators?.bollinger_bands?.middle?.toFixed(2) ?? '0.00'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Lower</h4>
                <p className="text-xl font-semibold text-gray-900">
                  ${analysisData?.technical_indicators?.bollinger_bands?.lower?.toFixed(2) ?? '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fundamental Analysis */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Fundamental Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">P/E Ratio</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {analysisData?.fundamental_analysis?.pe_ratio?.toFixed(2) ?? '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Dividend Yield</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {analysisData?.fundamental_analysis?.dividend_yield?.toFixed(2) ?? '0.00'}%
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Expense Ratio</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {analysisData?.fundamental_analysis?.expense_ratio?.toFixed(2) ?? '0.00'}%
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Holdings Count</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {analysisData?.fundamental_analysis?.holdings_count?.toLocaleString() ?? '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sentiment Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Overall Sentiment</h3>
            <p className={`text-2xl font-semibold ${
              analysisData?.sentiment_analysis?.overall_sentiment === 'positive'
                ? 'text-green-600'
                : analysisData?.sentiment_analysis?.overall_sentiment === 'negative'
                ? 'text-red-600'
                : 'text-gray-600'
            }`}>
              {analysisData?.sentiment_analysis?.overall_sentiment
                ? analysisData.sentiment_analysis.overall_sentiment.charAt(0).toUpperCase() +
                  analysisData.sentiment_analysis.overall_sentiment.slice(1)
                : 'Neutral'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">News Sentiment</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {analysisData?.sentiment_analysis?.news_sentiment?.toFixed(2) ?? '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Social Sentiment</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {analysisData?.sentiment_analysis?.social_sentiment?.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis; 