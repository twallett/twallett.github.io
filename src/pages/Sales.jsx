import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Store, Calendar, DollarSign, Package, Loader2 } from 'lucide-react';

const SalesForecastDashboard = () => {
  const [selectedStore, setSelectedStore] = useState('1');
  const [forecastHorizon, setForecastHorizon] = useState('7');
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState('resource');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const init = async () => {
      await checkApiHealth();
      setInitializing(false);
    };
    init();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      setApiStatus(data.status === 'healthy' ? 'online' : 'offline');
    } catch (err) {
      setApiStatus('offline');
    }
  };

  const fetchForecastData = async (storeId, days) => {
    try {
      const response = await fetch(`${API_URL}/forecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: parseInt(storeId),
          forecast_horizon: parseInt(days),
          date: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (apiStatus !== 'online') return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchForecastData(selectedStore, forecastHorizon);
        setForecastData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (apiStatus === 'online') {
      loadData();
    }
  }, [selectedStore, forecastHorizon, apiStatus]);

  const combinedData = forecastData ? [
    ...forecastData.historical.slice(-14).map(d => ({ 
      ...d, 
      date: d.date.split('-').slice(1).join('/') 
    })),
    ...forecastData.forecast.map(d => ({ 
      ...d, 
      date: d.date.split('-').slice(1).join('/') 
    }))
  ] : [];

  const metrics = forecastData?.metrics;

  if (initializing || apiStatus !== 'online' || !forecastData || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading Sales Forecast...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2 sm:p-4 pb-6 sm:pb-10 overflow-hidden pt-16 sm:pt-4">
      <div className="h-full max-w-7xl mx-auto flex flex-col gap-2 sm:gap-3 mt-0 sm:mt-12 mb-4">
        
        {/* Main Content */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-3 gap-2 sm:gap-3">
          
          {/* Left Panel - Controls */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 flex flex-col flex-shrink-0 lg:flex-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-gray-900 rounded-lg flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                  Sales Forecasting
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-600">XGBoost • Multi-step</p>
              </div>
            </div>

            <div className="flex gap-2 mb-3 sm:mb-4">
              <div className="bg-green-50 px-2 py-1 rounded border border-green-200 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-800">API Live</span>
              </div>
            </div>
            
            <h2 className="text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3">Forecast Settings</h2>
            
            <div className="space-y-2 sm:space-y-3 flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  <Store className="w-3 h-3 inline mr-1" />
                  Store Number
                </label>
                <select 
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 5, 10, 15, 25, 50, 100].map(n => (
                    <option key={n} value={n}>Store {n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Forecast Horizon
                </label>
                <select 
                  value={forecastHorizon}
                  onChange={(e) => setForecastHorizon(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">7 days (1 week)</option>
                  <option value="14">14 days (2 weeks)</option>
                  <option value="30">30 days (1 month)</option>
                </select>
              </div>

              {metrics && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-2 border border-blue-200 mt-4">
                  <p className="text-[10px] font-semibold text-gray-600 mb-2">Business Actions</p>
                  
                  <div className="flex gap-1 mb-3">
                    <button
                      onClick={() => setSelectedInsight('resource')}
                      className={`flex-1 px-2 py-1 rounded text-[9px] font-semibold transition-colors ${
                        selectedInsight === 'resource'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Resources
                    </button>
                    <button
                      onClick={() => setSelectedInsight('sales')}
                      className={`flex-1 px-2 py-1 rounded text-[9px] font-semibold transition-colors ${
                        selectedInsight === 'sales'
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Sales
                    </button>
                    <button
                      onClick={() => setSelectedInsight('operations')}
                      className={`flex-1 px-2 py-1 rounded text-[9px] font-semibold transition-colors ${
                        selectedInsight === 'operations'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Operations
                    </button>
                  </div>

                  {selectedInsight === 'resource' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <DollarSign className="w-3 h-3 text-blue-600" />
                        <h3 className="font-bold text-gray-800 text-xs">Reallocate Resources</h3>
                      </div>
                      <div className="bg-blue-100 p-2 rounded">
                        <p className="text-[10px] text-gray-700 mb-1">
                          <strong>Signal:</strong> The sales for Store {selectedStore} are {metrics.trend === 'up' ? 'forecasted to increase' : 'forecasted to decrease'} by ~${Math.abs(Math.round((metrics.avgForecast - (forecastData.historical.slice(-7).reduce((a, b) => a + b.actual, 0) / Math.min(7, forecastData.historical.length))) / 100) * 100)}/day on average.
                        </p>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-800">Decision Trigger:</p>
                      <p className="text-[10px] text-gray-700 leading-relaxed">
                        {metrics.trend === 'up' 
                          ? `If average daily sales increase by ${Math.abs(Math.round((metrics.avgForecast - (forecastData.historical.slice(-7).reduce((a, b) => a + b.actual, 0) / Math.min(7, forecastData.historical.length))) / 100) * 100)}+ then increase staffing budget by 10-15% and reallocate marketing spend to capitalize on growth momentum.`
                          : `If average daily sales decrease by ${Math.abs(Math.round((metrics.avgForecast - (forecastData.historical.slice(-7).reduce((a, b) => a + b.actual, 0) / Math.min(7, forecastData.historical.length))) / 100) * 100)}+ then reduce operational costs by 8-12% and shift promotional budget to underperforming product lines.`}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-800 mt-2">To Achieve:</p>
                      <p className="text-[10px] text-gray-700 leading-relaxed">
                        {metrics.trend === 'up'
                          ? `Maximize revenue capture during high-demand period and prevent stockouts.`
                          : `Maintain profitability while stimulating demand through targeted interventions.`}
                      </p>
                    </div>
                  )}

                  {selectedInsight === 'sales' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <h3 className="font-bold text-gray-800 text-xs">Change Sales Behavior</h3>
                      </div>
                      <div className="bg-green-100 p-2 rounded">
                        <p className="text-[10px] text-gray-700 mb-1">
                          <strong>Signal:</strong> The {forecastHorizon}-day forecast for Store {selectedStore} shows {metrics.trend === 'up' ? 'upward momentum' : 'declining sales'} with total projected revenue of ~${Math.round(metrics.totalForecast / 1000)}K.
                        </p>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-800">Decision Trigger:</p>
                      <p className="text-[10px] text-gray-700 leading-relaxed">
                        {metrics.trend === 'up'
                          ? `If revenue trend increases by 15%+ then launch premium product bundles and upsell campaigns to existing customers while maintaining pricing power.`
                          : `If revenue trend decreases by 10%+ then deploy 15-20% discounts on slow-moving inventory and escalate deals in negotiation to close before period end.`}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-800 mt-2">To Achieve:</p>
                      <p className="text-[10px] text-gray-700 leading-relaxed">
                        {metrics.trend === 'up'
                          ? `Increase average transaction value by 20-25% and maximize margin during peak demand.`
                          : `Hit minimum revenue targets and clear inventory before forecast period ends.`}
                      </p>
                    </div>
                  )}

                  {selectedInsight === 'operations' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Package className="w-3 h-3 text-purple-600" />
                        <h3 className="font-bold text-gray-800 text-xs">Adjust Operations</h3>
                      </div>
                      <div className="bg-purple-100 p-2 rounded">
                        <p className="text-[10px] text-gray-700 mb-1">
                          <strong>Signal:</strong> Store {selectedStore} is projected to generate ~${Math.round(metrics.totalForecast / 1000)}K over the next {forecastHorizon} days.
                        </p>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-800">Decision Trigger:</p>
                      <p className="text-[10px] text-gray-700 leading-relaxed">
                        {metrics.trend === 'up'
                          ? `If projected revenue greater than or equal to ${Math.round(metrics.totalForecast / 1000)}K then increase inventory levels by 25-30% and schedule additional delivery windows to prevent stockouts.`
                          : `If projected revenue less than or equal to ${Math.round(metrics.totalForecast / 1000)}K then reduce next week's order by 20% and reallocate warehouse space to faster-moving SKUs.`}
                      </p>
                      <p className="text-[9px] text-gray-600 italic my-1">
                        Forecast confidence: {(metrics.confidence * 100).toFixed(0)}% (±{Math.round((1 - metrics.confidence) * 100)}%)
                      </p>
                      <p className="text-[10px] font-semibold text-gray-800">To Achieve:</p>
                      <p className="text-[10px] text-gray-700 leading-relaxed">
                        {metrics.trend === 'up'
                          ? `Meet customer demand without service disruptions and maintain 95%+ in-stock rate.`
                          : `Minimize carrying costs and avoid dead inventory buildup while maintaining service levels.`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Visualization */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-3 sm:p-4 flex flex-col min-h-0 flex-1">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800">Sales Forecast</h3>
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      style={{ fontSize: '10px' }}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      style={{ fontSize: '10px' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: 'none', 
                        borderRadius: '8px', 
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [`$${value?.toLocaleString()}`, '']}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                      iconSize={8}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      name="Historical"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3 }}
                      name="Forecast"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="upper_bound" 
                      stroke="#6366f1" 
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      dot={false}
                      name="Upper 90%"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lower_bound" 
                      stroke="#6366f1" 
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      dot={false}
                      name="Lower 90%"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesForecastDashboard;