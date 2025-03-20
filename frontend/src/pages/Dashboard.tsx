import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Portfolio {
  id: number;
  total_value: number;
  total_return: number;
  return_percentage: number;
}

interface StockHolding {
  symbol: string;
  company_name: string;
  shares: number;
  current_price: number;
  total_value: number;
  return_value: number;
  return_percentage: number;
}

const Dashboard = () => {
  const { user } = useAuth();

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<Portfolio>(
    'portfolio',
    async () => {
      const response = await api.get('/portfolio/summary');
      return response.data;
    }
  );

  const { data: holdings, isLoading: holdingsLoading } = useQuery<StockHolding[]>(
    'holdings',
    async () => {
      const response = await api.get('/portfolio/holdings');
      return response.data;
    }
  );

  if (portfolioLoading || holdingsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.full_name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Portfolio Value
            </h3>
            <p className="text-2xl font-bold text-blue-900">
              ${portfolio?.total_value.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 mb-1">
              Total Return
            </h3>
            <p className="text-2xl font-bold text-green-900">
              ${portfolio?.total_return.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800 mb-1">
              Return Percentage
            </h3>
            <p className="text-2xl font-bold text-purple-900">
              {portfolio?.return_percentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Holdings</h2>
          <Link
            to="/portfolio"
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            View All
          </Link>
        </div>
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
                  Return
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