import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Briefcase, Plus, X, Star, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Watchlist.css';

interface WatchlistItem {
  symbol: string;
  name: string;
  added_at: string;
  change?: number;
}

const Watchlist: React.FC = () => {
  const { theme } = useContext(ThemeContext);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/watchlist');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Fetch current price changes for each stock
        const watchlistWithChanges = await Promise.all(
          data.data.map(async (item: WatchlistItem) => {
            try {
              const priceResponse = await fetch(`/api/historical/${item.symbol}/latest`);
              if (!priceResponse.ok) {
                return item;
              }
              const priceData = await priceResponse.json();
              if (priceData.success && priceData.data && priceData.data.change) {
                return {
                  ...item,
                  change: priceData.data.change
                };
              }
              return item;
            } catch (error) {
              console.error(`Error fetching price for ${item.symbol}:`, error);
              return item;
            }
          })
        );
        setWatchlist(watchlistWithChanges);
        setRetryCount(0);
      } else {
        setError(data.error || 'Failed to fetch watchlist');
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      if (error instanceof SyntaxError) {
        setError('Invalid response from server. Please try again.');
      } else {
        setError('Failed to fetch watchlist. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    
    // Listen for storage events (when watchlist is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'watchlist') {
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchWatchlist();
  };

  const handleRemoveItem = async (symbol: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/watchlist/${symbol}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setWatchlist(data.data);
        // Trigger a page refresh after removing an item
        window.location.reload();
      } else {
        setError(data.error || 'Failed to remove item');
      }
    } catch (error) {
      setError('Failed to remove item');
      console.error('Error removing item:', error);
    }
  };

  const handleItemClick = (symbol: string) => {
    // Force a page refresh when navigating
    window.location.href = `/historical/${symbol}`;
  };

  if (isLoading) {
    return (
      <div className="watchlist-container">
        <div className="watchlist-loading">
          <div className="loading-spinner"></div>
          <p>Loading watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watchlist-container">
        <div className="watchlist-error">
          <p>{error}</p>
          <button 
            className="btn btn-primary retry-button"
            onClick={handleRetry}
            disabled={retryCount >= 3}
          >
            <RefreshCw size={16} />
            {retryCount >= 3 ? 'Max retries reached' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <h3>Watchlist</h3>
        <button 
          className="add-to-watchlist"
          onClick={() => navigate('/historical')}
        >
          <Plus size={16} />
          Add Stock
        </button>
      </div>
      
      {watchlist.length === 0 ? (
        <div className="watchlist-empty">
          <Star size={24} />
          <p>Your watchlist is empty</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/historical')}
          >
            Add Stocks
          </button>
        </div>
      ) : (
        <ul className="watchlist-items">
          {watchlist.map((item) => (
            <li key={item.symbol} className="watchlist-item">
              <div 
                className="item-content"
                onClick={() => handleItemClick(item.symbol)}
              >
                <Briefcase size={16} />
                <div className="item-info">
                  <span className="item-symbol">{item.symbol}</span>
                  <span className="item-name">{item.name}</span>
                </div>
                {item.change !== undefined && (
                  <div className="item-change-container">
                    {item.change >= 0 ? (
                      <TrendingUp size={14} className="trend-icon up" />
                    ) : (
                      <TrendingDown size={14} className="trend-icon down" />
                    )}
                    <span className={`item-change ${item.change >= 0 ? 'up' : 'down'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
              <button 
                className="remove-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem(item.symbol);
                }}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Watchlist; 