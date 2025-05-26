import React, { useContext, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { 
  Home, 
  LineChart, 
  BarChart2, 
  Settings, 
  X,
  Briefcase,
  Clock,
  Users
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { theme } = useContext(ThemeContext);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        if (isOpen) {
          toggleSidebar();
        }
      }
    };

    // Add event listener when sidebar is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      // Clean up event listener when sidebar is closed
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleSidebar]); // Re-run effect if isOpen or toggleSidebar changes

  return (
    <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''} ${theme}-theme`}>
      <div className="sidebar-header">
        <button className="close-sidebar" onClick={toggleSidebar}>
          <X size={24} />
        </button>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => window.innerWidth < 768 && toggleSidebar()}>
            <Home size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/predictions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => window.innerWidth < 768 && toggleSidebar()}>
            <LineChart size={20} />
            <span>Predictions</span>
          </NavLink>
          
          <NavLink to="/historical" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => window.innerWidth < 768 && toggleSidebar()}>
            <BarChart2 size={20} />
            <span>Historical Data</span>
          </NavLink>
          
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => window.innerWidth < 768 && toggleSidebar()}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>
        
        <div className="sidebar-section">
          <h3 className="sidebar-heading">Watchlist</h3>
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <Briefcase size={16} />
              <span>S&P 500</span>
              <span className="item-value up">+1.2%</span>
            </li>
            <li className="sidebar-item">
              <Briefcase size={16} />
              <span>AAPL</span>
              <span className="item-value up">+0.8%</span>
            </li>
            <li className="sidebar-item">
              <Briefcase size={16} />
              <span>MSFT</span>
              <span className="item-value down">-0.3%</span>
            </li>
            <li className="sidebar-item">
              <Briefcase size={16} />
              <span>GOOGL</span>
              <span className="item-value up">+1.5%</span>
            </li>
          </ul>
        </div>
        
        <div className="sidebar-section">
          <h3 className="sidebar-heading">Recent Activity</h3>
          <ul className="sidebar-list">
            <li className="sidebar-item">
              <Clock size={16} />
              <span>S&P 500 Prediction</span>
            </li>
            <li className="sidebar-item">
              <Clock size={16} />
              <span>AAPL Analysis</span>
            </li>
            <li className="sidebar-item">
              <Clock size={16} />
              <span>TSLA Forecast</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            <Users size={20} />
          </div>
          <div className="user-details">
            <div className="user-name">User Account</div>
            <div className="user-plan">Pro Plan</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;