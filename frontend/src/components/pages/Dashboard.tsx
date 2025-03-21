import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import axiosInstance from '../../api/axios';
import { PortfolioSummary, StockData, ApiResponse } from '../../types';

const Dashboard: React.FC = () => {
  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<PortfolioSummary>>('/portfolio');
      return response.data.data;
    }
  });

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Portfolio Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Total Value</p>
            <p className="text-2xl font-semibold">
              ${portfolioData?.total_value?.toLocaleString() ?? '0'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Daily Change</p>
            <p className={`text-2xl font-semibold ${portfolioData?.daily_change && portfolioData.daily_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${portfolioData?.daily_change?.toLocaleString() ?? '0'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Daily Change %</p>
            <p className={`text-2xl font-semibold ${portfolioData?.daily_change_percentage && portfolioData.daily_change_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioData?.daily_change_percentage?.toFixed(2) ?? '0.00'}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Price History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Price History</h2>
          {chartData && (
            <div className="h-64">
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

        {/* Technical Indicators */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Technical Indicators</h2>
          <div className="space-y-4">
            {stockData?.technical_indicators.map((indicator) => (
              <div key={indicator.name} className="flex justify-between items-center">
                <span className="text-gray-600">{indicator.name}</span>
                <div>
                  <span className="text-gray-600 mr-4">{indicator.value}</span>
                  <span className={`font-semibold ${
                    indicator.signal === 'buy' ? 'text-green-600' :
                    indicator.signal === 'sell' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {indicator.signal.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Holdings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolioData?.holdings.map((holding) => (
                <tr key={holding.symbol}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{holding.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{holding.shares}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${holding.average_cost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${holding.current_price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${holding.value.toLocaleString()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${holding.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {holding.change_percentage >= 0 ? '+' : ''}{holding.change_percentage.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 