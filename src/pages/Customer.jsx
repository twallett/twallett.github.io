import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, DollarSign, Clock, BarChart3, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL_CUSTOMER_SEGMENTATION || 'http://localhost:8000';

const CustomerSegmentation = () => {
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 200, height: 100 });
  
  const [form, setForm] = useState({
    recency: '',
    frequency: '',
    monetary: ''
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modelRes = await fetch(`${API_BASE_URL}/model/info`);
        const modelData = await modelRes.json();
        setModelInfo(modelData);
        
        const vizRes = await fetch(`${API_BASE_URL}/visualization/data`);
        const vizData = await vizRes.json();
        setVisualizationData(vizData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    
    fetchData();
  }, []);

  const handlePredict = async () => {
    if (!form.recency || !form.frequency || !form.monetary) return;

    setLoading(true);
    setResult(null);

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recency: parseFloat(form.recency),
        frequency: parseFloat(form.frequency),
        monetary: parseFloat(form.monetary)
      })
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const dx = (e.clientX - dragStart.x) * 0.1;
    const dy = (e.clientY - dragStart.y) * 0.1;
    
    setViewBox(prev => ({
      ...prev,
      x: prev.x - dx,
      y: prev.y - dy
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getSegmentColor = (cluster) => {
    const segmentNames = visualizationData?.cluster_centers.reduce((acc, center) => {
      acc[center.cluster] = center.segment_name;
      return acc;
    }, {}) || {};
    
    const colorsByName = {
      'Champions': '#22c55e',
      'Loyal Customers': '#3b82f6',
      'Potential Loyalists': '#f97316',
      'At Risk': '#ef4444',
      'Hibernating': '#8b5cf6'
    };
    
    return colorsByName[segmentNames[cluster]] || '#6b7280';
  };

  const getSegmentBadgeColor = (segmentName) => {
    const colors = {
      'Champions': 'bg-green-100 text-green-800 border-green-300',
      'Loyal Customers': 'bg-blue-100 text-blue-800 border-blue-300',
      'Potential Loyalists': 'bg-orange-100 text-orange-800 border-orange-300',
      'At Risk': 'bg-red-100 text-red-800 border-red-300',
      'Hibernating': 'bg-purple-100 text-purple-800 border-purple-300',
      'Lost': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[segmentName] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getMarketingInsight = (segmentName) => {
    const insights = {
      'Champions': {
        title: 'VIP Treatment Strategy',
        description: 'Your most valuable customers! Focus on retention through exclusive perks, early access to new products, and personalized experiences.',
        actions: ['Loyalty rewards program', 'Exclusive previews', 'Personal account manager']
      },
      'Loyal Customers': {
        title: 'Engagement & Upsell',
        description: 'Highly engaged customers with strong potential. Encourage increased spending through targeted upsells and premium offerings.',
        actions: ['Product recommendations', 'Bundle offers', 'Premium tier upgrades']
      },
      'Potential Loyalists': {
        title: 'Nurture & Convert',
        description: 'Recent customers showing promise. Build loyalty through engagement campaigns and incentivize repeat purchases.',
        actions: ['Welcome series', 'Loyalty program invitation', 'Next purchase discount']
      },
      'At Risk': {
        title: 'Win-Back Campaign',
        description: 'Previously active customers showing declining engagement. Re-engage with personalized offers and feedback requests.',
        actions: ['Win-back email campaign', 'Special discount offer', 'Survey for feedback']
      },
      'Hibernating': {
        title: 'Reactivation Required',
        description: 'Dormant customers who haven\'t purchased recently. Aggressive re-engagement needed with compelling offers.',
        actions: ['Flash sale notification', 'We miss you campaign', 'Product updates']
      },
      'Lost': {
        title: 'Last Chance Recovery',
        description: 'Long-inactive customers at risk of permanent churn. Final attempt with strong incentives or sunset gracefully.',
        actions: ['Major discount offer', 'What did we miss survey', 'Preference center update']
      }
    };
    return insights[segmentName] || insights['Potential Loyalists'];
  };

  if (!modelInfo || !visualizationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading Customer Segmentation...</p>
        </div>
      </div>
    );
  }

  const renderVisualization = () => {
    const width = viewBox.width;
    const height = viewBox.height;
    const padding = 5;
    
    const allX = visualizationData.all_customers.map(c => c.pca_component_1);
    const allY = visualizationData.all_customers.map(c => c.pca_component_2);
    
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    
    const xScale = (val) => padding + ((val - minX) / (maxX - minX)) * (width - 2 * padding);
    const yScale = (val) => height - padding - ((val - minY) / (maxY - minY)) * (height - 2 * padding);

    return (
      <>
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-800">Customer Segmentation Map</h3>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 relative flex items-center justify-center touch-none">
          <svg 
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            className="w-full h-full cursor-grab active:cursor-grabbing select-none" 
            preserveAspectRatio="xMidYMid meet"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
            }}
            onTouchEnd={handleMouseUp}
          >
            <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1,1" />
            <line x1={width/2} y1={padding} x2={width/2} y2={height-padding} stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1,1" />
            
            <text x={width/2} y={height-4} textAnchor="middle" className="text-[2px] font-semibold fill-gray-700">
              PCA Component 1
            </text>
            <text x={4} y={height/2} textAnchor="middle" transform={`rotate(-90 4 ${height/2})`} className="text-[2px] font-semibold fill-gray-700">
              PCA Component 2
            </text>
            
            {visualizationData.all_customers.map((customer, idx) => (
              <circle
                key={idx}
                cx={xScale(customer.pca_component_1)}
                cy={yScale(customer.pca_component_2)}
                r="0.6"
                fill={getSegmentColor(customer.cluster)}
                opacity="0.6"
              />
            ))}
            
            {visualizationData.cluster_centers.map((center) => (
              <g key={center.cluster}>
                <circle
                  cx={xScale(center.pca_component_1)}
                  cy={yScale(center.pca_component_2)}
                  r="4"
                  fill={getSegmentColor(center.cluster)}
                  opacity="0.1"
                />
                <circle
                  cx={xScale(center.pca_component_1)}
                  cy={yScale(center.pca_component_2)}
                  r="1.2"
                  fill={getSegmentColor(center.cluster)}
                  stroke="white"
                  strokeWidth="0.3"
                />
              </g>
            ))}
            
            {result && (
              <g>
                <circle
                  cx={xScale(result.pca_component_1)}
                  cy={yScale(result.pca_component_2)}
                  r="3.5"
                  fill={getSegmentColor(result.cluster)}
                  opacity="0.2"
                >
                  <animate attributeName="r" values="3.5;4.2;3.5" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={xScale(result.pca_component_1)}
                  cy={yScale(result.pca_component_2)}
                  r="1.5"
                  fill={getSegmentColor(result.cluster)}
                  stroke="white"
                  strokeWidth="0.4"
                />
              </g>
            )}
          </svg>
        </div>

        <div className="flex-shrink-0 mt-2 pt-2 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 sm:gap-2">
            {Array.from(new Map(visualizationData.cluster_centers.map(center => [center.segment_name, center])).values()).map((center) => (
              <div key={center.cluster} className="flex items-center gap-1.5 bg-gray-50 p-1.5 sm:p-2 rounded">
                <div 
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getSegmentColor(center.cluster) }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] sm:text-xs font-medium text-gray-700 truncate">{center.segment_name}</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500">{center.count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2 sm:p-4 pb-6 sm:pb-10 overflow-hidden pt-16 sm:pt-4">
      <div className="h-full max-w-7xl mx-auto flex flex-col gap-2 sm:gap-3 mt-0 sm:mt-12 mb-4">
        {/* Main Content */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-3 gap-2 sm:gap-3">
          {/* Left Panel - Input Form */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 flex flex-col flex-shrink-0 lg:flex-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-gray-900 rounded-lg flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                  Customer Segmentation
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-600">RFM Analysis • K-Means</p>
              </div>
            </div>

            <div className="flex gap-2 mb-3 sm:mb-4">
              <div className="bg-green-50 px-2 py-1 rounded border border-green-200 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-800">API Live</span>
              </div>
            </div>
            
            <h2 className="text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3">Analyze Customer</h2>
            
            <div className="space-y-2 sm:space-y-3 flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Recency (days)
                </label>
                <input
                  type="number"
                  value={form.recency}
                  onChange={(e) => setForm({ ...form, recency: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  Frequency
                </label>
                <input
                  type="number"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  Monetary Value
                </label>
                <input
                  type="number"
                  value={form.monetary}
                  onChange={(e) => setForm({ ...form, monetary: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1500"
                />
              </div>

              <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>

              {result && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-2 border border-blue-200">
                  <p className="text-[10px] font-semibold text-gray-600 mb-1">Result</p>
                  <div className={`px-2 py-1 rounded-lg border ${getSegmentBadgeColor(result.segment_name)}`}>
                    <p className="text-xs font-bold">{result.segment_name}</p>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <p className="text-[10px] font-bold text-gray-800 mb-1">{getMarketingInsight(result.segment_name).title}</p>
                    <p className="text-[10px] text-gray-700 leading-snug">
                      {getMarketingInsight(result.segment_name).description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Visualization */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-3 sm:p-4 flex flex-col min-h-0 flex-1">
            {renderVisualization()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentation;