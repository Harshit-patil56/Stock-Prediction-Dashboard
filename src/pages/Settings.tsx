import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../App';
import { Save, RefreshCw, LogOut, LogIn, Settings as SettingsIcon, User, Bell, Key, Sliders, Moon, Sun, AlertCircle } from 'lucide-react';
import './Settings.css';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { isAuthenticated, logout } = useAuth();
  const [modelParams, setModelParams] = useState({
    estimators: 200,
    minSamplesSplit: 50,
    maxFeatures: 'auto',
    criterion: 'gini'
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    predictionNotifications: true,
    weeklyReports: false,
    marketNews: true
  });

  const saveSettings = () => {
    // Simulated saving settings
    alert('Settings saved successfully!');
  };

  const resetModel = () => {
    setModelParams({
      estimators: 200,
      minSamplesSplit: 50,
      maxFeatures: 'auto',
      criterion: 'gini'
    });
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1><SettingsIcon size={24} /> Settings</h1>
      </div>

      <div className="settings-content">
        <section className="settings-section">
          <div className="section-header">
            <h2>Account Settings</h2>
            <p>Manage your account preferences and settings</p>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <User size={20} />
              <h3>Profile</h3>
            </div>
            <div className="card-content">
              <div className="setting-group">
                <div className="setting-label">
                  <span>Authentication Status</span>
                  <span className={`status-badge ${isAuthenticated ? 'authenticated' : 'not-authenticated'}`}>
                    {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </span>
                </div>
                {isAuthenticated ? (
                  <button className="btn btn-danger" onClick={logout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => window.location.href = '/login'}>
                    <LogIn size={16} />
                    Sign in with Google
                  </button>
                )}
              </div>

              <div className="setting-group">
                <div className="setting-label">
                  <span>Theme</span>
                  <span className="setting-description">Choose your preferred theme</span>
                </div>
                <button 
                  className={`theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`}
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="section-header">
            <h2>Model Parameters</h2>
            <p>Configure your prediction model settings</p>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <Sliders size={20} />
              <h3>Model Configuration</h3>
            </div>
            <div className="card-content">
              <div className="setting-group">
                <div className="setting-label">
                  <span>Number of Estimators</span>
                  <span className="setting-description">The number of trees in the random forest</span>
                </div>
                <input
                  type="number"
                  value={modelParams.estimators}
                  onChange={(e) => setModelParams({ ...modelParams, estimators: parseInt(e.target.value) })}
                  min="1"
                  max="1000"
                  className="setting-input"
                />
              </div>

              <div className="setting-group">
                <div className="setting-label">
                  <span>Min Samples Split</span>
                  <span className="setting-description">Minimum samples required to split a node</span>
                </div>
                <input
                  type="number"
                  value={modelParams.minSamplesSplit}
                  onChange={(e) => setModelParams({ ...modelParams, minSamplesSplit: parseInt(e.target.value) })}
                  min="2"
                  max="100"
                  className="setting-input"
                />
              </div>

              <div className="setting-group">
                <div className="setting-label">
                  <span>Max Features</span>
                  <span className="setting-description">Number of features to consider for best split</span>
                </div>
                <select
                  value={modelParams.maxFeatures}
                  onChange={(e) => setModelParams({ ...modelParams, maxFeatures: e.target.value })}
                  className="setting-input"
                >
                  <option value="auto">Auto</option>
                  <option value="sqrt">Square Root</option>
                  <option value="log2">Log2</option>
                </select>
              </div>

              <div className="setting-group">
                <div className="setting-label">
                  <span>Criterion</span>
                  <span className="setting-description">Function to measure split quality</span>
                </div>
                <select
                  value={modelParams.criterion}
                  onChange={(e) => setModelParams({ ...modelParams, criterion: e.target.value })}
                  className="setting-input"
                >
                  <option value="gini">Gini</option>
                  <option value="entropy">Entropy</option>
                </select>
              </div>

              <div className="card-actions">
                <button className="btn btn-primary" onClick={saveSettings}>
                  <Save size={16} />
                  Save Changes
                </button>
                <button className="btn btn-secondary" onClick={resetModel}>
                  <RefreshCw size={16} />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="section-header">
            <h2>API Configuration</h2>
            <p>Manage your API keys and integration settings</p>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <Key size={20} />
              <h3>API Keys</h3>
            </div>
            <div className="card-content">
              <div className="setting-group">
                <div className="setting-label">
                  <span>Yahoo Finance API Key</span>
                  <span className="setting-description">Your API key for Yahoo Finance data</span>
                </div>
                <div className="api-key-group">
                  <input
                    type="password"
                    placeholder="Enter your API key"
                    className="setting-input"
                  />
                  <button className="btn btn-secondary">
                    Clear
                  </button>
                </div>
              </div>

              <div className="api-info">
                <AlertCircle size={16} />
                <p>The app can function without an API key, but request limits may apply.</p>
              </div>

              <div className="card-actions">
                <button className="btn btn-primary" onClick={saveSettings}>
                  <Save size={16} />
                  Save API Key
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="section-header">
            <h2>Notification Settings</h2>
            <p>Configure how you want to receive updates</p>
          </div>

          <div className="settings-card">
            <div className="card-header">
              <Bell size={20} />
              <h3>Notifications</h3>
            </div>
            <div className="card-content">
              <div className="setting-group">
                <div className="setting-label">
                  <span>Email Alerts</span>
                  <span className="setting-description">Receive email notifications for important updates</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.emailAlerts}
                    onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-group">
                <div className="setting-label">
                  <span>Prediction Notifications</span>
                  <span className="setting-description">Get notified when new predictions are available</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.predictionNotifications}
                    onChange={(e) => setNotifications({ ...notifications, predictionNotifications: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-group">
                <div className="setting-label">
                  <span>Weekly Reports</span>
                  <span className="setting-description">Receive weekly summary reports</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.weeklyReports}
                    onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-group">
                <div className="setting-label">
                  <span>Market News</span>
                  <span className="setting-description">Get updates about market news and trends</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications.marketNews}
                    onChange={(e) => setNotifications({ ...notifications, marketNews: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="card-actions">
                <button className="btn btn-primary" onClick={saveSettings}>
                  <Save size={16} />
                  Save Notification Settings
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;