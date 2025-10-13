import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaWallet,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEyeSlash,
  FaPiggyBank,
  FaRocket,
  FaShieldAlt,
  FaBalanceScale
} from 'react-icons/fa';
import {
  TrendingUp,
  PieChart,
  DollarSign,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';
import { fetchPortfolio } from "../../slices/portfolioSlice";
import { RootState, AppDispatch } from "../../store";

// Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Doughnut, Bar, Line, Radar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

// Chart configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#9CA3AF',
        font: {
          size: 11
        },
        usePointStyle: true,
        padding: 20
      }
    }
  }
};

const doughnutOptions = {
  ...chartOptions,
  cutout: '70%',
  plugins: {
    ...chartOptions.plugins,
    legend: {
      position: 'right' as const,
      labels: {
        color: '#9CA3AF',
        font: {
          size: 11
        },
        usePointStyle: true,
        padding: 15
      }
    }
  }
};

// Performance metrics card component
const MetricCard = ({ title, value, change, icon, color, subtitle }) => (
  <div className="bg-[#222629] rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-[1.02]">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        {icon}
      </div>
      <div className={`flex items-center text-sm font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {change >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
        {Math.abs(change)}%
      </div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
    <p className="text-gray-400 text-sm font-medium">{title}</p>
    {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
  </div>
);

// Asset type icon mapping
const getAssetTypeIcon = (type) => {
  const icons = {
    single: <FaRocket className="text-purple-400" />,
    basket: <FaBalanceScale className="text-blue-400" />,
    crypto: <Activity className="text-orange-400" />,
    stock: <TrendingUp className="text-green-400" />,
    real_estate: <FaPiggyBank className="text-yellow-400" />,
    default: <FaShieldAlt className="text-gray-400" />
  };
  return icons[type] || icons.default;
};

export default function PortfolioDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { portfolio, loading } = useSelector((state: RootState) => state.portfolio);
  const [showBalance, setShowBalance] = useState(true);
  const [timeframe, setTimeframe] = useState('1m');

  useEffect(() => {
    dispatch(fetchPortfolio());
  }, [dispatch]);

  // Safe value handling
  const totalValue = portfolio?.total_value || 0;
  const items = portfolio?.items || [];

  // Format currency
  const formatCurrency = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Calculate comprehensive portfolio metrics
  const portfolioMetrics = items.reduce((acc, item) => {
    const currentValue = Number(item.current_value) || 0;
    const purchaseValue = Number(item.purchase_price) * Number(item.quantity);
    const gainLoss = currentValue - purchaseValue;
    const gainLossPercent = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;

    // ROI analysis based on current ROI percentage
    const assetROI = Number(item.asset?.current_roi_percent) || 0;
    const projectedValue = purchaseValue * (1 + assetROI / 100);
    const projectedGain = projectedValue - purchaseValue;

    acc.totalValue += currentValue;
    acc.totalPurchaseValue += purchaseValue;
    acc.totalGainLoss += gainLoss;
    acc.totalProjectedGain += projectedGain;
    acc.highestROI = Math.max(acc.highestROI, assetROI);
    acc.lowestROI = Math.min(acc.lowestROI, assetROI);
    acc.assetCount += 1;

    // Risk analysis
    const riskRating = item.asset?.risk_rating;
    if (riskRating) {
      if (!acc.riskDistribution[riskRating]) {
        acc.riskDistribution[riskRating] = 0;
      }
      acc.riskDistribution[riskRating] += currentValue;
    }

    return acc;
  }, {
    totalValue: 0,
    totalPurchaseValue: 0,
    totalGainLoss: 0,
    totalProjectedGain: 0,
    highestROI: -Infinity,
    lowestROI: Infinity,
    assetCount: 0,
    riskDistribution: {}
  });

  // Calculate allocation with ROI analysis
  const allocation = items.reduce((acc, item) => {
    const type = item.asset_type || 'other';
    const currentValue = Number(item.current_value) || 0;
    const purchaseValue = Number(item.purchase_price) * Number(item.quantity);
    const assetROI = Number(item.asset?.current_roi_percent) || 0;

    if (!acc[type]) {
      acc[type] = {
        value: 0,
        count: 0,
        totalROI: 0,
        purchaseValue: 0,
        bestPerformer: null,
        worstPerformer: null
      };
    }

    acc[type].value += currentValue;
    acc[type].count += 1;
    acc[type].totalROI += assetROI;
    acc[type].purchaseValue += purchaseValue;

    // Track best and worst performers
    if (!acc[type].bestPerformer || assetROI > acc[type].bestPerformer.roi) {
      acc[type].bestPerformer = { item, roi: assetROI };
    }
    if (!acc[type].worstPerformer || assetROI < acc[type].worstPerformer.roi) {
      acc[type].worstPerformer = { item, roi: assetROI };
    }

    return acc;
  }, {});

  // Chart data functions
  const getAllocationChartData = () => {
    const labels = Object.keys(allocation);
    const values = Object.values(allocation).map((a: any) => a.value);
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
      '#F97316', '#6366F1'
    ];

    return {
      labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
      datasets: [
        {
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color + '80'),
          borderWidth: 2,
          hoverOffset: 15
        }
      ]
    };
  };

  const getROIAnalysisChartData = () => {
    const types = Object.keys(allocation);
    const avgROIs = types.map(type => {
      const data = allocation[type];
      return data.count > 0 ? data.totalROI / data.count : 0;
    });

    return {
      labels: types.map(type => type.charAt(0).toUpperCase() + type.slice(1)),
      datasets: [
        {
          label: 'Average ROI %',
          data: avgROIs,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  };

  const getPerformanceChartData = () => {
    // Mock performance data - in real app, this would come from historical data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const performance = months.map((_, index) => {
      const base = portfolioMetrics.totalPurchaseValue;
      const growth = base * (1 + (index * 0.05)); // Simulated growth
      return growth + (Math.random() * base * 0.1); // Add some variance
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Portfolio Value',
          data: performance,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  const getRiskDistributionData = () => {
    const riskData = portfolioMetrics.riskDistribution;
    const labels = Object.keys(riskData);
    const values = Object.values(riskData);

    return {
      labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
      datasets: [
        {
          label: 'Risk Distribution',
          data: values,
          backgroundColor: [
            'rgba(34, 197, 94, 0.6)',  // Low - Green
            'rgba(234, 179, 8, 0.6)',  // Medium - Yellow
            'rgba(239, 68, 68, 0.6)'   // High - Red
          ],
          borderColor: [
            '#22C55E',
            '#EAB308',
            '#EF4444'
          ],
          borderWidth: 2
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading your portfolio...</div>
        </div>
      </div>
    );
  }

  const totalGainLossPercent = portfolioMetrics.totalPurchaseValue > 0
    ? (portfolioMetrics.totalGainLoss / portfolioMetrics.totalPurchaseValue) * 100
    : 0;

  const avgROI = Object.values(allocation).reduce((sum: number, data: any) => {
    return sum + (data.count > 0 ? data.totalROI / data.count : 0);
  }, 0) / (Object.keys(allocation).length || 1);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 bg-[#222629] bg-opacity-50 backdrop-blur-sm rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FaWallet className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Portfolio Dashboard</h1>
              <p className="text-gray-400 text-sm">Real-time investment performance</p>
            </div>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showBalance ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
            <span className="text-gray-300 text-sm">
              {showBalance ? 'Hide Values' : 'Show Values'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Portfolio Value"
            value={showBalance ? formatCurrency(totalValue) : '••••••'}
            change={totalGainLossPercent}
            icon={<DollarSign className="text-blue-400" size={24} />}
            color="text-blue-400"
            subtitle="Based on current market prices"
          />

          <MetricCard
            title="Total Return"
            value={showBalance ? formatCurrency(portfolioMetrics.totalGainLoss) : '••••••'}
            change={totalGainLossPercent}
            icon={<TrendingUp className="text-green-400" size={24} />}
            color="text-green-400"
            subtitle="All-time performance"
          />

          <MetricCard
            title="Average ROI"
            value={showBalance ? `${avgROI.toFixed(1)}%` : '•••%'}
            change={avgROI}
            icon={<Target className="text-purple-400" size={24} />}
            color="text-purple-400"
            subtitle="Across all assets"
          />

          <MetricCard
            title="Active Investments"
            value={portfolioMetrics.assetCount.toString()}
            change={10}
            icon={<PieChart className="text-orange-400" size={24} />}
            color="text-orange-400"
            subtitle="Diversified portfolio"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allocation Chart */}
          <div className="bg-[#222629] rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Portfolio Allocation</h3>
              <PieChart className="text-gray-400" size={20} />
            </div>
            <div className="h-80">
              <Doughnut data={getAllocationChartData()} options={doughnutOptions} />
            </div>
          </div>

          {/* ROI Analysis */}
          <div className="bg-[#222629] to-gray-900 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">ROI Analysis by Type</h3>
              <BarChart3 className="text-gray-400" size={20} />
            </div>
            <div className="h-80">
              <Bar data={getROIAnalysisChartData()} options={chartOptions} />
            </div>
          </div>

          {/* Performance Trend */}
          <div className="bg-[#222629] rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Performance Trend</h3>
              <FaChartLine className="text-gray-400" size={20} />
            </div>
            <div className="h-80">
              <Line data={getPerformanceChartData()} options={chartOptions} />
            </div>
          </div>

          {/* Risk Distribution */}
          {/* <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Risk Distribution</h3>
              <Activity className="text-gray-400" size={20} />
            </div>
            <div className="h-80">
              <Doughnut data={getRiskDistributionData()} options={doughnutOptions} />
            </div>
          </div> */}
        </div>

        {/* Detailed Asset Analysis */}
        <div className="bg-[#222629] rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-6">Asset Performance Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(allocation).map(([type, data]: [string, any]) => {
              const avgROI = data.count > 0 ? data.totalROI / data.count : 0;
              const allocationPercent = totalValue > 0 ? (data.value / totalValue) * 100 : 0;

              return (
                <div key={type} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-600 rounded-lg">
                        {getAssetTypeIcon(type)}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold capitalize">
                          {type.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-gray-400 text-sm">{data.count} assets</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{formatCurrency(data.value)}</div>
                      <div className="text-gray-400 text-sm">{allocationPercent.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg ROI</span>
                      <span className={`font-medium ${avgROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {avgROI.toFixed(1)}%
                      </span>
                    </div>

                    {data.bestPerformer && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Best Performer</span>
                        <span className="text-green-400 font-medium">
                          {data.bestPerformer.roi.toFixed(1)}%
                        </span>
                      </div>
                    )}

                    {data.worstPerformer && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Lowest ROI</span>
                        <span className="text-red-400 font-medium">
                          {data.worstPerformer.roi.toFixed(1)}%
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-600">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Projected Growth</span>
                        <span className="text-blue-400">
                          +{formatCurrency(data.value * (avgROI / 100))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}