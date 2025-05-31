import React, { useContext, useState, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { TrendingUp, TrendingDown, DollarSign, Zap, AlertTriangle, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import StockChart from '../components/charts/StockChart';
import PredictionSummary from '../components/prediction/PredictionSummary';
import MarketOverview from '../components/market/MarketOverview';
import { SentimentAnalysis } from '../components/SentimentAnalysis';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [selectedPerformanceStock, setSelectedPerformanceStock] = useState('^GSPC');
  const [highlightSentiment, setHighlightSentiment] = useState(false);
  const sentimentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const timeframes = [
    { value: '1w', label: '1W' },
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: '1y', label: '1Y' },
    { value: '5y', label: '5Y' },
  ];

  const availableStocks = [
    { value: '^GSPC', label: 'S&P 500' },
    { value: 'AAPL', label: 'Apple' },
    { value: 'GOOGL', label: 'Alphabet' },
    { value: 'MSFT', label: 'Microsoft' },
    { value: 'AMZN', label: 'Amazon' },
  ];

  const handleScrollToSentiment = () => {
    if (sentimentRef.current) {
      sentimentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightSentiment(true);
      setTimeout(() => setHighlightSentiment(false), 1500);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={() => navigate('/predictions')}>
            <Zap size={16} />
            Run Prediction
          </button>
          <button className="btn btn-secondary" onClick={handleScrollToSentiment}>
            View Market Sentiment
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
            <div className="stat-value up">
              +1.2%
              <ArrowUpRight size={16} className="trend-icon" />
            </div>
            <div className="stat-description">Predicted to rise tomorrow</div>
          </div>
        </div>

        <div className={`stat-card ${theme}-theme`}>
          <div className="stat-icon down">
            <TrendingDown size={20} />
          </div>
          <div className="stat-content">
            <h3>NASDAQ Prediction</h3>
            <div className="stat-value down">
              -0.5%
              <ArrowDownRight size={16} className="trend-icon" />
            </div>
            <div className="stat-description">Predicted to fall tomorrow</div>
          </div>
        </div>

        <div className={`stat-card ${theme}-theme`}>
          <div className="stat-icon neutral">
            <DollarSign size={20} />
          </div>
          <div className="stat-content">
            <h3>Dow Jones</h3>
            <div className="stat-value neutral">
              0.1%
              <ArrowUpRight size={16} className="trend-icon" />
            </div>
            <div className="stat-description">Minimal change expected</div>
          </div>
        </div>

        <div className={`stat-card ${theme}-theme`}>
          <div className="stat-icon warning">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <h3>Model Confidence</h3>
            <div className="stat-value">
              57.4%
              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: '57.4%' }}></div>
              </div>
            </div>
            <div className="stat-description">Based on historical accuracy</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{availableStocks.find(stock => stock.value === selectedPerformanceStock)?.label || 'Stock'} Performance</h2>
          <div className="card-header-controls">
            <div className="timeframe-selector">
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="timeframe-dropdown"
              >
                {timeframes.map((timeframe) => (
                  <option key={timeframe.value} value={timeframe.value}>
                    {timeframe.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="stock-selector">
              <select 
                value={selectedPerformanceStock}
                onChange={(e) => setSelectedPerformanceStock(e.target.value)}
                className="stock-dropdown"
              >
                {availableStocks.map((stock) => (
                  <option key={stock.value} value={stock.value}>
                    {stock.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="card-body">
          <StockChart ticker={selectedPerformanceStock} timeframe={selectedTimeframe} />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Prediction Summary</h2>
            <button className="info-button" title="View detailed prediction information">
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

        <div
          className={`card${highlightSentiment ? ' highlight-sentiment' : ''}`}
          ref={sentimentRef}
        >
          <div className="card-header">
            <h2>Market Sentiment</h2>
          </div>
          <div className="card-body">
            <SentimentAnalysis symbol="^GSPC" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;