import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface StockHolding {
  symbol: string;
  company_name: string;
  shares: number;
  current_price: number;
  total_value: number;
  return_value: number;
  return_percentage: number;
  cost_basis: number;
}

interface Transaction {
  id: number;
  symbol: string;
  transaction_type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total_amount: number;
  timestamp: string;
}

const Portfolio = () => {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [shares, setShares] = useState<number>(1);

  const { data: holdings, isLoading: holdingsLoading } = useQuery<StockHolding[]>(
    'holdings',
    async () => {
      const response = await api.get('/portfolio/holdings');
      return response.data;
    }
  );

  const { data: transactions, isLoading: transactionsLoading } = useQuery<
    Transaction[]
  >('transactions', async () => {
    const response = await api.get('/portfolio/transactions');
    return response.data;
  });

  const handleSell = async (symbol: string) => {
    try {
      await api.post('/portfolio/sell', {
        symbol,
        shares,
      });
      toast.success('Stock sold successfully!');
      setSelectedStock(null);
      setShares(1);
    } catch (error) {
      toast.error('Failed to sell stock');
    }
  };

  if (holdingsLoading || transactionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Holdings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Basis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holdings?.map((holding) => (
                <tr key={holding.symbol}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/stock/${holding.symbol}`}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <div className="font-medium">{holding.symbol}</div>
                      <div className="text-sm text-gray-500">
                        {holding.company_name}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {holding.shares}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${holding.current_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${holding.total_value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${holding.cost_basis.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        holding.return_percentage >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {holding.return_percentage >= 0 ? '+' : ''}
                      {holding.return_percentage.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {selectedStock === holding.symbol ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max={holding.shares}
                          value={shares}
                          onChange={(e) =>
                            setShares(Math.min(holding.shares, +e.target.value))
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                        />
                        <button
                          onClick={() => handleSell(holding.symbol)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Sell
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStock(null);
                            setShares(1);
                          }}
                          className="text-gray-500 hover:text-gray-600 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedStock(holding.symbol)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Sell
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Transactions
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions?.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.transaction_type === 'BUY'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/stock/${transaction.symbol}`}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      {transaction.symbol}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.shares}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${transaction.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${transaction.total_amount.toLocaleString()}
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

export default Portfolio; 