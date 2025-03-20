import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to QTOP ETF Analysis
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your intelligent portfolio management and stock analysis platform for the QTOP ETF
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Portfolio Management
          </h3>
          <p className="text-gray-600">
            Track and manage your QTOP ETF investments with real-time updates and performance metrics.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Stock Analysis
          </h3>
          <p className="text-gray-600">
            Get detailed analysis and insights for individual stocks within the QTOP ETF.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Smart Recommendations
          </h3>
          <p className="text-gray-600">
            Receive personalized investment recommendations based on your goals and risk profile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home; 