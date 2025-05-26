import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { TrendingUp, TrendingDown, DollarSign, Zap, AlertTriangle, Info } from 'lucide-react';
import StockChart from '../components/charts/StockChart';
import PredictionSummary from '../components/prediction/PredictionSummary';
import MarketOverview from '../components/market/MarketOverview';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const navigate = useNavigate();

  const timeframes = [
    { value: '1w', label: '1W' },
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: '1y', label: '1Y' },
    { value: '5y', label: '5Y' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={() => navigate('/predictions')}>
            <Zap size={16} />
            Run Prediction
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className={`stat-card ${theme}-theme`}>
          <div className="stat-icon up">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <h3>S&P 500 Prediction</h3>
            <div className="stat-value up">+1.2%</div>
            <div className="stat-description">Predicted to rise tomorrow</div>
          </div>
        </div>

        <div className={`stat-card ${theme}-theme`}>
          <div className="stat-icon down">
            <TrendingDown size={20} />
          </div>
          <div className="stat-content">
            <h3>NASDAQ Prediction</h3>
            <div className="stat-value down">-0.5%</div>
            <div className="stat-description">Predicted to fall tomorrow</div>
          </div>
        </div>

        <div className={`stat-card ${theme}-theme`}>
          <div className="stat-icon neutral">
            <DollarSign size={20} />
          </div>
          <div className="stat-content">
            <h3>Dow Jones</h3>
            <div className="stat-value neutral">0.1%</div>
            <div className="stat-description">Minimal change expected</div>
          </div>
        </div>

        <div className={`stat-card ${theme}-theme`}>
          <div className="stat-icon warning">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <h3>Model Confidence</h3>
            <div className="stat-value">57.4%</div>
            <div className="stat-description">Based on historical accuracy</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>S&P 500 Performance</h2>
          <div className="timeframe-selector">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.value}
                className={`timeframe-button ${selectedTimeframe === timeframe.value ? 'active' : ''}`}
                onClick={() => setSelectedTimeframe(timeframe.value)}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <StockChart ticker="^GSPC" timeframe={selectedTimeframe} />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Prediction Summary</h2>
            <button className="info-button">
              <Info size={16} />
            </button>
          </div>
          <div className="card-body">
            <PredictionSummary />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Market Overview</h2>
          </div>
          <div className="card-body">
            <MarketOverview />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;