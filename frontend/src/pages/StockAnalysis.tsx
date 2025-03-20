import { useParams } from 'react-router-dom';
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
import { api } from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockData {
  symbol: string;
  company_name: string;
  current_price: number;
  change_percent: number;
  market_cap: number;
  pe_ratio: number;
  dividend_yield: number;
  volume: number;
  historical_prices: {
    date: string;
    price: number;
  }[];
  analysis: {
    recommendation: string;
    target_price: number;
    risk_level: string;
    summary: string;
  };
}

const StockAnalysis = () => {
  const { symbol } = useParams<{ symbol: string }>();

  const { data: stockData, isLoading } = useQuery<StockData>(
    ['stock', symbol],
    async () => {
      const response = await api.get(`/stocks/${symbol}`);
      return response.data;
    }
  );

  const handleBuy = async () => {
    try {
      await api.post(`/portfolio/buy`, {
        symbol,
        shares: 1, // You might want to add a quantity input
      });
      toast.success('Stock purchased successfully!');
    } catch (error) {
      toast.error('Failed to purchase stock');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="text-center text-gray-600">
        No data available for this stock
      </div>
    );
  }

  const chartData = {
    labels: stockData.historical_prices.map((item) => item.date),
    datasets: [
      {
        label: 'Stock Price',
        data: stockData.historical_prices.map((item) => item.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {stockData.company_name} ({stockData.symbol})
            </h1>
            <div className="mt-2 flex items-center space-x-4">
              <span className="text-2xl font-bold">
                ${stockData.current_price.toFixed(2)}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  stockData.change_percent >= 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {stockData.change_percent >= 0 ? '+' : ''}
                {stockData.change_percent.toFixed(2)}%
              </span>
            </div>
          </div>
          <button
            onClick={handleBuy}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Buy Stock
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Market Cap</h3>
            <p className="text-lg font-semibold">
              ${(stockData.market_cap / 1e9).toFixed(2)}B
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">P/E Ratio</h3>
            <p className="text-lg font-semibold">
              {stockData.pe_ratio.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Dividend Yield</h3>
            <p className="text-lg font-semibold">
              {stockData.dividend_yield.toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Volume</h3>
            <p className="text-lg font-semibold">
              {(stockData.volume / 1e6).toFixed(2)}M
            </p>
          </div>
        </div>

        <div className="h-96 mb-8">
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Recommendation
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {stockData.analysis.recommendation}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Target Price
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                ${stockData.analysis.target_price.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Risk Level
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {stockData.analysis.risk_level}
              </p>
            </div>
          </div>
          <p className="text-gray-600">{stockData.analysis.summary}</p>
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis; 