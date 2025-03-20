import React from 'react';
import { useQuery } from 'react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../api/axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PortfolioSummary {
  total_value: number;
  daily_change: number;
  daily_change_percentage: number;
  holdings: Array<{
    symbol: string;
    shares: number;
    value: number;
    change: number;
    change_percentage: number;
  }>;
}

interface QTOPAnalysis {
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
    macd_signal: number;
    macd_histogram: number;
    sma_20: number;
    sma_50: number;
  };
}

const Dashboard: React.FC = () => {
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery<PortfolioSummary>(
    'portfolio',
    async () => {
      const response = await api.get('/api/portfolio');
      return response.data;
    }
  );

  const { data: qtopData, isLoading: qtopLoading } = useQuery<QTOPAnalysis>(
    'qtop-analysis',
    async () => {
      const response = await api.get('/api/stocks/qtop/analysis');
      return response.data;
    }
  );

  const chartData = qtopData?.price_history ? {
    labels: qtopData.price_history.map(point => new Date(point.date).toLocaleDateString()),
    datasets: [
      {
        label: 'QTOP Price',
        data: qtopData.price_history.map(point => point.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
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
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  if (portfolioLoading || qtopLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
            <p className="text-2xl font-semibold text-gray-900">
              ${portfolioData?.total_value.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Daily Change</h3>
            <p className={`text-2xl font-semibold ${portfolioData?.daily_change && portfolioData.daily_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${portfolioData?.daily_change?.toLocaleString() ?? '0'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Daily Change %</h3>
            <p className={`text-2xl font-semibold ${portfolioData?.daily_change_percentage && portfolioData.daily_change_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioData?.daily_change_percentage?.toFixed(2) ?? '0.00'}%
            </p>
          </div>
        </div>
      </div>

      {/* QTOP ETF Analysis */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">QTOP ETF Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Current Price</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  ${qtopData?.current_price.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Daily Change</h3>
                <p className={`text-2xl font-semibold ${qtopData?.daily_change && qtopData.daily_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${qtopData?.daily_change?.toFixed(2) ?? '0.00'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Volume</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {qtopData?.volume.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Market Cap</h3>
                <p className="text-2xl font-semibold text-gray-900">
                  ${qtopData?.market_cap.toLocaleString()}
                </p>
              </div>
            </div>
            {chartData && <Line data={chartData} options={chartOptions} />}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Indicators</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">RSI</h4>
                <p className="text-xl font-semibold text-gray-900">
                  {qtopData?.technical_indicators.rsi.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">MACD</h4>
                <p className="text-xl font-semibold text-gray-900">
                  {qtopData?.technical_indicators.macd.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">SMA 20</h4>
                <p className="text-xl font-semibold text-gray-900">
                  ${qtopData?.technical_indicators.sma_20.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">SMA 50</h4>
                <p className="text-xl font-semibold text-gray-900">
                  ${qtopData?.technical_indicators.sma_50.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Holdings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolioData?.holdings.map((holding) => (
                <tr key={holding.symbol}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {holding.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {holding.shares}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${holding.value.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${holding.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${holding.change.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${holding.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {holding.change_percentage.toFixed(2)}%
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