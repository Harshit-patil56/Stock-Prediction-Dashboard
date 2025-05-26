import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { MenuIcon, Moon, Sun, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.length > 1) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const response = await fetch(`/api/symbols?query=${searchQuery}`);
          const data = await response.json();
          if (data.success) {
            setSearchResults(data.data);
            setShowResults(true);
          } else {
            setSearchResults([]);
            setShowResults(false);
            console.error('Error fetching symbols:', data.error);
          }
        } catch (error) {
          setSearchResults([]);
          setShowResults(false);
          console.error('Error fetching symbols:', error);
        }
      }, 500); // Debounce for 500ms

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleResultClick = (symbol: string) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    navigate(`/historical/${symbol}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-button" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <MenuIcon size={24} />
        </button>
        <Link to="/" className="logo">
          <span className="logo-text">StockPredictAI</span>
        </Link>
      </div>
      
      <div className="navbar-search">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for a stock..." 
            className="search-input"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onBlur={() => setTimeout(() => setShowResults(false), 100)}
          />
          {showResults && searchResults.length > 0 && (
            <ul className="search-results-dropdown">
              {searchResults.map((result) => (
                <li key={result.symbol} onClick={() => handleResultClick(result.symbol)}>
                  {result.name} ({result.symbol})
                </li>
              ))}
            </ul>
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