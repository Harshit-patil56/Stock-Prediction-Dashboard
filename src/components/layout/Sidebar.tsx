import React, { useContext, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import { 
  Home, 
  LineChart, 
  BarChart2, 
  Settings, 
  X
} from 'lucide-react';
import Watchlist from '../watchlist/Watchlist';
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
        toggleSidebar();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, toggleSidebar]);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''} ${theme}`} ref={sidebarRef}>
      <div className="sidebar-header">
        <h2>Stock Predictor</h2>
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
          <Watchlist />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;