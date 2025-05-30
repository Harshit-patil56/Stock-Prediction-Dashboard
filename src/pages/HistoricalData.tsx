import React, { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Download, Filter, RefreshCw, Star } from 'lucide-react';
import HistoricalChart from '../components/charts/HistoricalChart';
import HistoricalTable from '../components/tables/HistoricalTable';
import { useParams } from 'react-router-dom';
import './HistoricalData.css';

const HistoricalData: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const { symbol } = useParams<{ symbol: string }>();
  const initialStock = symbol || '^GSPC';
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [selectedStock, setSelectedStock] = useState(initialStock);
  const [dateRange, setDateRange] = useState('1y');
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);

  const dateRanges = [
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '5y', label: '5 Years' },
    { value: 'max', label: 'Max' },
  ];

  const stockOptions = [
    { value: '^GSPC', label: 'S&P 500' },
    { value: '^DJI', label: 'Dow Jones' },
    { value: '^IXIC', label: 'NASDAQ' },
    { value: 'AAPL', label: 'Apple Inc.' },
    { value: 'MSFT', label: 'Microsoft' },
    { value: 'GOOGL', label: 'Alphabet Inc.' },
    { value: 'AMZN', label: 'Amazon' },
    { value: 'META', label: 'Meta Platforms' },
  ];

  const handleAddToWatchlist = async () => {
    const stock = stockOptions.find(s => s.value === selectedStock);
    if (!stock) return;

    setIsAddingToWatchlist(true);
    setWatchlistError(null);

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: stock.value,
          name: stock.label,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setWatchlistError('Successfully added to watchlist');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setWatchlistError(data.error || 'Failed to add to watchlist');
      }
    } catch (error) {
      setWatchlistError('Failed to add to watchlist');
      console.error('Error adding to watchlist:', error);
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  return (
    <div className="historical-data-page">
      <div className="page-header">
        <h1>Historical Data</h1>
        <div className="view-toggle">
          <button 
            className={`view-button ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
          >
            Chart
          </button>
          <button 
            className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>Stock</label>
          <select 
            className="filter-select"
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
          >
            {stockOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Time Period</label>
          <select 
            className="filter-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button 
            className="btn btn-primary"
            onClick={handleAddToWatchlist}
            disabled={isAddingToWatchlist}
          >
            {isAddingToWatchlist ? (
              <>
                <div className="loading-spinner-small"></div>
                Adding...
              </>
            ) : (
              <>
                <Star size={16} />
                Add to Watchlist
              </>
            )}
          </button>
        </div>
      </div>

      {watchlistError && (
        <div className={`alert ${watchlistError.includes('Successfully') ? 'alert-success' : 'alert-error'}`}>
          {watchlistError}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>{stockOptions.find(s => s.value === selectedStock)?.label} Historical Data</h2>
          <div className="data-info">
            <span>Last updated: Today, 4:00 PM ET</span>
          </div>
        </div>
        <div className="card-body">
          {viewMode === 'chart' ? (
            <HistoricalChart symbol={selectedStock} period={dateRange} />
          ) : (
            <HistoricalTable symbol={selectedStock} period={dateRange} />
          )}
        </div>
      </div>

      <div className="data-summary">
        <div className="summary-card">
          <h3>Summary Statistics</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span className="item-label">Average Daily Return</span>
              <span className="item-value">0.03%</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Volatility</span>
              <span className="item-value">1.2%</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Highest Close</span>
              <span className="item-value">4,796.56</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Lowest Close</span>
              <span className="item-value">3,577.03</span>
            </div>
            <div className="summary-item">
              <span className="item-label">Total Trading Days</span>
              <span className="item-value">252</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3>Data Sources</h3>
          <div className="summary-content">
            <p>Historical stock data is provided by Yahoo Finance via the yfinance Python library. The data includes Open, High, Low, Close prices and Volume for each trading day.</p>
            <p>Data may be adjusted for stock splits and dividends. Last trading day data may be delayed by up to 15 minutes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalData;