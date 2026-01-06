import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Store, Calendar, DollarSign, Users, Package } from 'lucide-react';

const SalesForecastDashboard = () => {
  const [selectedStore, setSelectedStore] = useState('1');
  const [forecastHorizon, setForecastHorizon] = useState('7');
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  const API_URL = 'https://artificial-intelligence-1kg9.onrender.com/';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      setApiStatus(data.status === 'healthy' ? 'online' : 'offline');
    } catch (err) {
      setApiStatus('offline');
      console.log('API offline, using simulated data');
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
      console.error('API fetch failed:', err);
      throw err;
    }
  };

  const generateSimulatedData = (storeId, days) => {
    const today = new Date();
    const historical = [];
    const forecast = [];
    
    for (let i = 30; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const baseValue = 5000 + Math.sin(i / 7) * 1000;
      historical.push({
        date: date.toISOString().split('T')[0],
        actual: Math.round(baseValue + Math.random() * 500),
        type: 'historical'
      });
    }
    
    const lastHistorical = historical[historical.length - 1].actual;
    for (let i = 1; i <= parseInt(days); i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const trend = lastHistorical + (i * 50);
      const seasonal = Math.sin((30 + i) / 7) * 800;
      const predicted = trend + seasonal;
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        predicted: Math.round(predicted),
        lower_bound: Math.round(predicted * 0.85),
        upper_bound: Math.round(predicted * 1.15),
        type: 'forecast'
      });
    }
    
    const avgForecast = Math.round(forecast.reduce((a, b) => a + b.predicted, 0) / forecast.length);
    const totalForecast = forecast.reduce((a, b) => a + b.predicted, 0);
    
    return {
      historical,
      forecast,
      metrics: {
        avgForecast,
        totalForecast,
        trend: forecast[forecast.length - 1].predicted > forecast[0].predicted ? 'up' : 'down',
        confidence: 0.87
      }
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data;
        if (apiStatus === 'online') {
          data = await fetchForecastData(selectedStore, forecastHorizon);
        } else {
          await new Promise(resolve => setTimeout(resolve, 500));
          data = generateSimulatedData(selectedStore, forecastHorizon);
        }
        
        setForecastData(data);
      } catch (err) {
        setError(err.message);
        const simulatedData = generateSimulatedData(selectedStore, forecastHorizon);
        setForecastData(simulatedData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Sales Forecasting System</h1>
              <p className="text-slate-600">Multi-step ahead XGBoost forecasting with confidence intervals</p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              apiStatus === 'online' ? 'bg-green-100 text-green-800' : 
              apiStatus === 'offline' ? 'bg-amber-100 text-amber-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              <div className="text-sm font-semibold">
                API: {apiStatus === 'online' ? 'Live' : apiStatus === 'offline' ? 'Demo Mode' : 'Checking...'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Store className="inline w-4 h-4 mr-1" />
                Store Number
              </label>
              <select 
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 5, 10, 15, 25, 50, 100].map(n => (
                  <option key={n} value={n}>Store {n}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Forecast Horizon
              </label>
              <select 
                value={forecastHorizon}
                onChange={(e) => setForecastHorizon(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">7 days (1 week)</option>
                <option value="14">14 days (2 weeks)</option>
                <option value="30">30 days (1 month)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Sales Forecast with Confidence Intervals</h2>
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-slate-400">Loading forecast data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Date (MM/DD)', position: 'insideBottom', offset: -25, style: { fill: '#475569', fontWeight: 600 } }}
                />
                <YAxis 
                  stroke="#64748b" 
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Sales ($)', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontWeight: 600 } }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => `${value?.toLocaleString()}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '35px', fontSize: '11px' }}
                  iconSize={8}
                  layout="horizontal"
                  align="center"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Historical"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
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

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Turning Forecasting Insights Into Action</h2>
          
          {metrics && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center mb-3">
                  <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="font-bold text-slate-800 text-lg">Reallocate Resources</h3>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-slate-700">
                    <strong>Signal:</strong> The sales for Store {selectedStore} are {metrics.trend === 'up' ? 'forecasted to increase' : 'forecasted to decrease'} by ~${Math.abs(Math.round((metrics.avgForecast - (forecastData.historical.slice(-7).reduce((a, b) => a + b.actual, 0) / Math.min(7, forecastData.historical.length))) / 100) * 100)}/day on average.
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-2">Decision Trigger:</p>
                <p className="text-sm text-slate-700 mb-3">
                  {metrics.trend === 'up' 
                    ? `If average daily sales increase by $${Math.abs(Math.round((metrics.avgForecast - (forecastData.historical.slice(-7).reduce((a, b) => a + b.actual, 0) / Math.min(7, forecastData.historical.length))) / 100) * 100)}+ then increase staffing budget by 10-15% and reallocate marketing spend to capitalize on growth momentum.`
                    : `If average daily sales decrease by $${Math.abs(Math.round((metrics.avgForecast - (forecastData.historical.slice(-7).reduce((a, b) => a + b.actual, 0) / Math.min(7, forecastData.historical.length))) / 100) * 100)}+ then reduce operational costs by 8-12% and shift promotional budget to underperforming product lines.`}
                </p>
                <p className="text-sm font-semibold text-slate-800 mb-2 mt-3">To Achieve:</p>
                <p className="text-sm text-slate-700">
                  {metrics.trend === 'up'
                    ? `Maximize revenue capture during high-demand period and prevent stockouts.`
                    : `Maintain profitability while stimulating demand through targeted interventions.`}
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="font-bold text-slate-800 text-lg">Change Sales Behavior</h3>
                </div>
                <div className="bg-green-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-slate-700">
                    <strong>Signal:</strong> The {forecastHorizon}-day forecast for Store {selectedStore} shows {metrics.trend === 'up' ? 'upward momentum' : 'declining sales'} with total projected revenue of ~${Math.round(metrics.totalForecast / 1000)}K.
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-2">Decision Trigger:</p>
                <p className="text-sm text-slate-700 mb-3">
                  {metrics.trend === 'up'
                    ? `If revenue trend increases by 15%+ then launch premium product bundles and upsell campaigns to existing customers while maintaining pricing power.`
                    : `If revenue trend decreases by 10%+ then deploy 15-20% discounts on slow-moving inventory and escalate deals in negotiation to close before period end.`}
                </p>
                <p className="text-sm font-semibold text-slate-800 mb-2 mt-3">To Achieve:</p>
                <p className="text-sm text-slate-700">
                  {metrics.trend === 'up'
                    ? `Increase average transaction value by 20-25% and maximize margin during peak demand.`
                    : `Hit minimum revenue targets and clear inventory before forecast period ends.`}
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center mb-3">
                  <Package className="w-6 h-6 text-purple-600 mr-2" />
                  <h3 className="font-bold text-slate-800 text-lg">Adjust Operations</h3>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg mb-3">
                  <p className="text-sm text-slate-700">
                    <strong>Signal:</strong> Store {selectedStore} is projected to generate ~${Math.round(metrics.totalForecast / 1000)}K over the next {forecastHorizon} days.
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-2">Decision Trigger:</p>
                <p className="text-sm text-slate-700 mb-3">
                  {metrics.trend === 'up'
                    ? `If projected revenue greater than or equal to $${Math.round(metrics.totalForecast / 1000)}K then increase inventory levels by 25-30% and schedule additional delivery windows to prevent stockouts.`
                    : `If projected revenue less than or equal to $${Math.round(metrics.totalForecast / 1000)}K then reduce next week's order by 20% and reallocate warehouse space to faster-moving SKUs.`}
                </p>
                <p className="text-xs text-slate-600 italic mb-3">
                  Forecast confidence: {(metrics.confidence * 100).toFixed(0)}% (±{Math.round((1 - metrics.confidence) * 100)}%)
                </p>
                <p className="text-sm font-semibold text-slate-800 mb-2">To Achieve:</p>
                <p className="text-sm text-slate-700">
                  {metrics.trend === 'up'
                    ? `Meet customer demand without service disruptions and maintain 95%+ in-stock rate.`
                    : `Minimize carrying costs and avoid dead inventory buildup while maintaining service levels.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesForecastDashboard;