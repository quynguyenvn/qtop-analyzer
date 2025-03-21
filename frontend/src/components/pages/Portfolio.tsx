import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { Line, Doughnut } from 'react-chartjs-2';
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
import axiosInstance from '../../api/axios';
import { PortfolioSummary, ApiResponse } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Portfolio {
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
  transactions: Array<{
    id: string;
    type: 'buy' | 'sell';
    symbol: string;
    shares: number;
    price: number;
    date: string;
  }>;
}

interface TransactionForm {
  type: 'buy' | 'sell';
  shares: number;
  price: number;
}

const Portfolio: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState<TransactionForm>({
    type: 'buy',
    shares: 0,
    price: 0,
  });
  const queryClient = useQueryClient();

  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<PortfolioSummary>>('/portfolio');
      return response.data.data;
    }
  });

  const addTransactionMutation = useMutation(
    async (formData: TransactionForm) => {
      const response = await axios.post('/api/portfolio/transactions', formData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('portfolio');
        setIsModalOpen(false);
        setTransactionForm({ type: 'buy', shares: 0, price: 0 });
      },
    }
  );

  const chartData = portfolioData?.holdings ? {
    labels: portfolioData.holdings.map((holding) => holding.symbol),
    datasets: [
      {
        data: portfolioData.holdings.map((holding) => holding.value),
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
        ],
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
        text: 'Portfolio Holdings Distribution',
      },
    },
  };

  if (portfolioData === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Portfolio</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Portfolio Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-gray-600">Total Value</p>
              <p className="text-2xl font-semibold">
                ${portfolioData?.total_value.toLocaleString()}
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

        {/* Portfolio Composition */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio Composition</h2>
          {chartData && (
            <div className="h-64">
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
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

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-6">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolioData?.transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${transaction.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.symbol}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.shares}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${transaction.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(transaction.shares * transaction.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Transaction</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              addTransactionMutation.mutate(transactionForm);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'buy' | 'sell' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Shares</label>
                  <input
                    type="number"
                    value={transactionForm.shares}
                    onChange={(e) => setTransactionForm({ ...transactionForm, shares: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Share</label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.price}
                    onChange={(e) => setTransactionForm({ ...transactionForm, price: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addTransactionMutation.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {addTransactionMutation.isLoading ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio; 