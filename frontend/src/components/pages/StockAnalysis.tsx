import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import axiosInstance from '../../api/axios';
import { StockData, ApiResponse } from '../../types';

const StockAnalysis: React.FC = () => {
  const { data: stockData } = useQuery({
    queryKey: ['stock-analysis'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<StockData>>('/stock-analysis');
      return response.data.data;
    }
  });

  const chartData = stockData?.price_history ? {
    labels: stockData.price_history.map(point => new Date(point.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Stock Price',
        data: stockData.price_history.map(point => point.price),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      }
    ]
  } : null;

  if (!stockData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stock Analysis</h1>

      {/* Stock Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Stock Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600">Current Price</p>
            <p className="text-2xl font-semibold">${stockData.current_price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Daily Change</p>
            <p className={`text-2xl font-semibold ${stockData.daily_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stockData.daily_change >= 0 ? '+' : ''}{stockData.daily_change.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-600">Volume</p>
            <p className="text-2xl font-semibold">{stockData.volume.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Market Cap</p>
            <p className="text-2xl font-semibold">${stockData.market_cap.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Price History</h2>
        {chartData && (
          <div className="h-96">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false,
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Technical Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Technical Analysis</h2>
          <div className="space-y-4">
            {stockData.technical_indicators.map((indicator) => (
              <div key={indicator.name} className="flex justify-between items-center">
                <span className="text-gray-600">{indicator.name}</span>
                <span className={`font-semibold ${
                  indicator.signal === 'buy' ? 'text-green-600' :
                  indicator.signal === 'sell' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {indicator.signal.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fundamental Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Fundamental Analysis</h2>
          <div className="grid grid-cols-2 gap-4">
            {stockData.fundamental_metrics.map((metric) => (
              <div key={metric.name}>
                <p className="text-gray-600">{metric.name}</p>
                <p className="text-lg font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
        <div className="space-y-4">
          {stockData.recommendations.map((recommendation, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold">{recommendation.title}</p>
              <p className="text-gray-600 mt-1">{recommendation.description}</p>
              <div className="flex items-center mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  recommendation.confidence >= 0.7 ? 'bg-green-100 text-green-800' :
                  recommendation.confidence >= 0.4 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Confidence: {(recommendation.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis; 