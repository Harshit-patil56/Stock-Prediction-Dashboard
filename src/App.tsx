import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Predictions from './pages/Predictions';
import HistoricalData from './pages/HistoricalData';
import Settings from './pages/Settings';
import Login from './components/Auth/Login';
import './App.css';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const sessionAuth = sessionStorage.getItem('isAuthenticated');
    return savedAuth === 'true' || sessionAuth === 'true';
  });

  const login = (token: string) => {
    console.log("User logged in with token:", token);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log("User logged out");
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="app">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/"
                element={
                  <ProtectedRoute 
                    element={
                      <>
                        <Navbar toggleSidebar={toggleSidebar} isOpen={sidebarOpen} />
                        <div className="content-container">
                          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                          <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                            <Dashboard />
                          </main>
                        </div>
                      </>
                    }
                  />
                }
              />
              <Route 
                path="/predictions" 
                element={<ProtectedRoute element={<>
                  <Navbar toggleSidebar={toggleSidebar} isOpen={sidebarOpen} />
                  <div className="content-container">
                    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                    <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                      <Predictions />
                    </main>
                  </div>
                  </>} />}
              />
              <Route 
                path="/historical/:symbol" 
                element={<ProtectedRoute element={<>
                  <Navbar toggleSidebar={toggleSidebar} isOpen={sidebarOpen} />
                  <div className="content-container">
                    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                    <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                      <HistoricalData />
                    </main>
                  </div>
                  </>} />}
              />
              <Route 
                path="/historical" 
                element={<ProtectedRoute element={<>
                  <Navbar toggleSidebar={toggleSidebar} isOpen={sidebarOpen} />
                  <div className="content-container">
                    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                    <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                      <HistoricalData />
                    </main>
                  </div>
                  </>} />}
              />
              <Route 
                path="/settings" 
                element={<ProtectedRoute element={<>
                  <Navbar toggleSidebar={toggleSidebar} isOpen={sidebarOpen} />
                  <div className="content-container">
                    <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                    <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                      <Settings />
                    </main>
                  </div>
                  </>} />}
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;