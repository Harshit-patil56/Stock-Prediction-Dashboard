import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { MenuIcon, Moon, Sun, Search, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  toggleSidebar: () => void;
  isOpen: boolean;
}

interface SearchResult {
  symbol: string;
  name: string;
  type?: string;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, isOpen }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search state when location changes
  useEffect(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  }, [location.pathname]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const delayDebounceFn = setTimeout(async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/symbols?query=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();
          if (data.success) {
            setSearchResults(data.data);
            setShowResults(true);
          } else {
            setError(data.error || 'Failed to fetch results');
            setSearchResults([]);
          }
        } catch (error) {
          setError('Failed to fetch results');
          setSearchResults([]);
          console.error('Error fetching symbols:', error);
        } finally {
          setIsLoading(false);
        }
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setSelectedIndex(-1);
  };

  const handleResultClick = (result: SearchResult) => {
    // Add to search history first
    setSearchHistory(prev => {
      const newHistory = [result.symbol, ...prev.filter(item => item !== result.symbol)].slice(0, 5);
      return newHistory;
    });

    // Clear search state
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedIndex(-1);

    // Force a page refresh when navigating
    window.location.href = `/historical/${result.symbol}`;
  };

  const handleHistoryClick = (symbol: string) => {
    // Add to search history first
    setSearchHistory(prev => {
      const newHistory = [symbol, ...prev.filter(item => item !== symbol)].slice(0, 5);
      return newHistory;
    });

    // Clear search state
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedIndex(-1);

    // Force a page refresh when navigating
    window.location.href = `/historical/${symbol}`;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleResultClick(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        break;
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button 
          className="menu-button" 
          onClick={toggleSidebar} 
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
        <Link to="/" className="logo">
          <span className="logo-text">StockPredictAI</span>
        </Link>
      </div>
      
      <div className="navbar-search">
        <div className="search-container" ref={searchContainerRef}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for a stock..." 
            className="search-input"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery.length > 1 && setShowResults(true)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={clearSearch}>
              <X size={16} />
            </button>
          )}
          {isLoading && (
            <div className="search-loading">
              <Loader2 size={16} className="spinner" />
            </div>
          )}
          {showResults && (
            <div className="search-results-dropdown">
              {error ? (
                <div className="search-error">{error}</div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map((result, index) => (
                    <div
                      key={result.symbol}
                      className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="result-symbol">{result.symbol}</div>
                      <div className="result-name">{result.name}</div>
                      {result.type && <div className="result-type">{result.type}</div>}
                    </div>
                  ))}
                </>
              ) : searchQuery.length > 1 ? (
                <div className="no-results">No results found</div>
              ) : null}
              {searchHistory.length > 0 && (
                <>
                  <div className="search-history-header">Recent Searches</div>
                  {searchHistory.map((symbol) => (
                    <div
                      key={symbol}
                      className="search-history-item"
                      onClick={() => handleHistoryClick(symbol)}
                    >
                      <Search size={14} />
                      <span>{symbol}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="navbar-right">
        <button 
          onClick={toggleTheme} 
          className="theme-toggle" 
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;