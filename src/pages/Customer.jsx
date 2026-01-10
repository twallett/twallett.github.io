import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Clock, BarChart3, AlertCircle, CheckCircle, Loader2, Target, TrendingDown, Mail, Gift, AlertTriangle, Zap } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const CustomerSegmentation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [modelInfo, setModelInfo] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  
  const [singleForm, setSingleForm] = useState({
    recency: '',
    frequency: '',
    monetary: ''
  });
  const [singleResult, setSingleResult] = useState(null);

  useEffect(() => {
    setDebugInfo('Component mounted, fetching data...');
    fetchModelInfo();
    fetchVisualizationData();
  }, []);

  const fetchModelInfo = async () => {
    try {
      setDebugInfo(prev => prev + '\nFetching model info...');
      const response = await fetch(`${API_BASE_URL}/model/info`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setModelInfo(data);
      setDebugInfo(prev => prev + '\n✓ Model info loaded');
    } catch (err) {
      const errorMsg = `Model info error: ${err.message}`;
      setDebugInfo(prev => prev + `\n✗ ${errorMsg}`);
      setError(errorMsg);
    }
  };

  const fetchVisualizationData = async () => {
    try {
      setDebugInfo(prev => prev + '\nFetching visualization data...');
      const response = await fetch(`${API_BASE_URL}/visualization/data`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setVisualizationData(data);
      setDebugInfo(prev => prev + `\n✓ Loaded ${data.all_customers.length} customers`);
    } catch (err) {
      const errorMsg = `Visualization error: ${err.message}`;
      setDebugInfo(prev => prev + `\n✗ ${errorMsg}`);
      setError(errorMsg);
    }
  };

  const handleSinglePredict = async () => {
    if (!singleForm.recency || !singleForm.frequency || !singleForm.monetary) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSingleResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recency: parseFloat(singleForm.recency),
          frequency: parseFloat(singleForm.frequency),
          monetary: parseFloat(singleForm.monetary)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Prediction failed');
      }

      const result = await response.json();
      setSingleResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSegmentColor = (segmentName) => {
    const colors = {
      'Champions': '#9333ea',
      'Loyal Customers': '#3b82f6',
      'Potential Loyalists': '#22c55e',
      'At Risk': '#f97316',
      'Lost': '#ef4444',
      'Hibernating': '#6b7280'
    };
    return colors[segmentName] || '#6b7280';
  };

  const getSegmentBadgeColor = (segmentName) => {
    const colors = {
      'Champions': 'bg-purple-100 text-purple-800 border-purple-300',
      'Loyal Customers': 'bg-blue-100 text-blue-800 border-blue-300',
      'Potential Loyalists': 'bg-green-100 text-green-800 border-green-300',
      'At Risk': 'bg-orange-100 text-orange-800 border-orange-300',
      'Lost': 'bg-red-100 text-red-800 border-red-300',
      'Hibernating': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[segmentName] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Debug panel to show what's happening
  if (!modelInfo && !visualizationData && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800">Loading Customer Segmentation...</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {debugInfo || 'Initializing...'}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            If this takes too long, check that your API is running at {API_BASE_URL}
          </p>
        </div>
      </div>
    );
  }

  const renderPCAVisualization = () => {
    if (!visualizationData) {
      return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading visualization data...</p>
          </div>
        </div>
      );
    }

    const width = 700;
    const height = 500;
    const padding = 70;
    
    const allX = visualizationData.all_customers.map(c => c.pca_component_1);
    const allY = visualizationData.all_customers.map(c => c.pca_component_2);
    
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    
    const xScale = (val) => padding + ((val - minX) / rangeX) * (width - 2 * padding);
    const yScale = (val) => height - padding - ((val - minY) / rangeY) * (height - 2 * padding);

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Customer Segmentation Map (PCA)</h3>
        <p className="text-sm text-gray-600 mb-4">
          All {visualizationData.all_customers.length} customers visualized in 2D space with {visualizationData.n_clusters} clusters
        </p>
        
        <div className="overflow-x-auto">
          <svg width={width} height={height} className="mx-auto">
            <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
            <line x1={width/2} y1={padding} x2={width/2} y2={height-padding} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
            
            <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#374151" strokeWidth="2" />
            <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#374151" strokeWidth="2" />
            
            <text x={width/2} y={height-20} textAnchor="middle" className="text-sm font-semibold fill-gray-700">
              PCA Component 1
            </text>
            <text x={25} y={height/2} textAnchor="middle" transform={`rotate(-90 25 ${height/2})`} className="text-sm font-semibold fill-gray-700">
              PCA Component 2
            </text>
            
            {visualizationData.all_customers.map((customer, idx) => (
              <circle
                key={idx}
                cx={xScale(customer.pca_component_1)}
                cy={yScale(customer.pca_component_2)}
                r="3"
                fill={getSegmentColor(customer.segment_name)}
                opacity="0.5"
              />
            ))}
            
            {visualizationData.cluster_centers.map((center, idx) => (
              <g key={idx}>
                <circle
                  cx={xScale(center.pca_component_1)}
                  cy={yScale(center.pca_component_2)}
                  r="30"
                  fill={getSegmentColor(center.segment_name)}
                  opacity="0.1"
                />
                <circle
                  cx={xScale(center.pca_component_1)}
                  cy={yScale(center.pca_component_2)}
                  r="8"
                  fill={getSegmentColor(center.segment_name)}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={xScale(center.pca_component_1)}
                  y={yScale(center.pca_component_2) - 40}
                  textAnchor="middle"
                  className="text-xs font-bold"
                  fill={getSegmentColor(center.segment_name)}
                >
                  {center.segment_name}
                </text>
                <text
                  x={xScale(center.pca_component_1)}
                  y={yScale(center.pca_component_2) - 28}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#6b7280"
                >
                  ({center.count} customers)
                </text>
              </g>
            ))}
            
            {singleResult && (
              <g>
                <circle
                  cx={xScale(singleResult.pca_component_1)}
                  cy={yScale(singleResult.pca_component_2)}
                  r="25"
                  fill={getSegmentColor(singleResult.segment_name)}
                  opacity="0.2"
                >
                  <animate attributeName="r" values="25;30;25" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={xScale(singleResult.pca_component_1)}
                  cy={yScale(singleResult.pca_component_2)}
                  r="10"
                  fill={getSegmentColor(singleResult.segment_name)}
                  stroke="white"
                  strokeWidth="3"
                />
                <text
                  x={xScale(singleResult.pca_component_1)}
                  y={yScale(singleResult.pca_component_2) + 45}
                  textAnchor="middle"
                  className="text-sm font-bold"
                  fill={getSegmentColor(singleResult.segment_name)}
                >
                  ⬆ Your Customer
                </text>
              </g>
            )}
          </svg>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          {visualizationData.cluster_centers.map((center, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getSegmentColor(center.segment_name) }}
              />
              <span className="text-sm font-medium text-gray-700">{center.segment_name}</span>
              <span className="text-xs text-gray-500">({center.count})</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Customer Segmentation Intelligence
              </h1>
              <p className="text-gray-600 mt-1">RFM Analysis • K-Means Clustering • Strategic Insights</p>
            </div>
          </div>

          {modelInfo && (
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Model Active</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {modelInfo.n_clusters} Clusters
                </span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  {modelInfo.training_samples} Customers
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <p className="text-sm text-red-600 mt-2">
                  Make sure the API is running at {API_BASE_URL}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          {renderPCAVisualization()}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Analyze New Customer</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Recency (days)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={singleForm.recency}
                  onChange={(e) => setSingleForm({ ...singleForm, recency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">Days since last purchase</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Frequency
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={singleForm.frequency}
                  onChange={(e) => setSingleForm({ ...singleForm, frequency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">Number of purchases</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Monetary Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={singleForm.monetary}
                  onChange={(e) => setSingleForm({ ...singleForm, monetary: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1500.00"
                />
                <p className="text-xs text-gray-500 mt-1">Total lifetime spend</p>
              </div>
            </div>

            <button
              onClick={handleSinglePredict}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Customer Profile...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  Generate Strategic Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {singleResult && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Customer Segment Classification</p>
                <div className={`inline-block px-6 py-3 rounded-xl border-2 ${getSegmentBadgeColor(singleResult.segment_name)}`}>
                  <p className="text-3xl font-bold">{singleResult.segment_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Cluster Assignment</p>
                <p className="text-2xl font-bold text-gray-800">Cluster {singleResult.cluster}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSegmentation;