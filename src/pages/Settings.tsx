import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Save, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import './Settings.css';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [modelParams, setModelParams] = useState({
    estimators: 200,
    minSamplesSplit: 50,
    maxFeatures: 'auto',
    criterion: 'gini'
  });
  const [apiKey, setApiKey] = useState('');
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
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header">
            <h2>Model Parameters</h2>
            <div className="header-actions">
              <button className="btn btn-outline" onClick={resetModel}>
                <RefreshCw size={16} />
                Reset
              </button>
              <button className="btn btn-primary" onClick={saveSettings}>
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="setting-group">
              <label htmlFor="estimators">Number of Estimators</label>
              <input
                id="estimators"
                type="number"
                value={modelParams.estimators}
                onChange={(e) => setModelParams({...modelParams, estimators: parseInt(e.target.value)})}
                className="setting-input"
                min="10"
                max="1000"
              />
              <div className="setting-description">
                The number of trees in the random forest. Increasing this value generally improves model accuracy but increases computation time.
              </div>
            </div>

            <div className="setting-group">
              <label htmlFor="minSamplesSplit">Minimum Samples Split</label>
              <input
                id="minSamplesSplit"
                type="number"
                value={modelParams.minSamplesSplit}
                onChange={(e) => setModelParams({...modelParams, minSamplesSplit: parseInt(e.target.value)})}
                className="setting-input"
                min="2"
                max="100"
              />
              <div className="setting-description">
                The minimum number of samples required to split an internal node. Higher values prevent overfitting.
              </div>
            </div>

            <div className="setting-group">
              <label htmlFor="maxFeatures">Max Features</label>
              <select
                id="maxFeatures"
                value={modelParams.maxFeatures}
                onChange={(e) => setModelParams({...modelParams, maxFeatures: e.target.value})}
                className="setting-input"
              >
                <option value="auto">Auto</option>
                <option value="sqrt">Sqrt</option>
                <option value="log2">Log2</option>
                <option value="none">None</option>
              </select>
              <div className="setting-description">
                The number of features to consider when looking for the best split.
              </div>
            </div>

            <div className="setting-group">
              <label htmlFor="criterion">Split Criterion</label>
              <select
                id="criterion"
                value={modelParams.criterion}
                onChange={(e) => setModelParams({...modelParams, criterion: e.target.value})}
                className="setting-input"
              >
                <option value="gini">Gini</option>
                <option value="entropy">Entropy</option>
              </select>
              <div className="setting-description">
                The function to measure the quality of a split.
              </div>
            </div>
          </div>
        </div>

        <div className="settings-column">
          <div className="card">
            <div className="card-header">
              <h2>API Settings</h2>
            </div>
            <div className="card-body">
              <div className="setting-group">
                <label htmlFor="apiKey">Yahoo Finance API Key (Optional)</label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="setting-input"
                  placeholder="Enter your API key"
                />
                <div className="setting-description">
                  Using your own API key can increase request limits.
                </div>
              </div>

              <div className="api-info">
                <AlertTriangle size={16} className="warning-icon" />
                <p>The app can function without an API key, but request limits may apply.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Notifications</h2>
            </div>
            <div className="card-body">
              <div className="setting-toggle">
                <label htmlFor="emailAlerts">Email Alerts</label>
                <label className="toggle">
                  <input
                    id="emailAlerts"
                    type="checkbox"
                    checked={notifications.emailAlerts}
                    onChange={() => setNotifications({...notifications, emailAlerts: !notifications.emailAlerts})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-toggle">
                <label htmlFor="predictionNotifications">Prediction Notifications</label>
                <label className="toggle">
                  <input
                    id="predictionNotifications"
                    type="checkbox"
                    checked={notifications.predictionNotifications}
                    onChange={() => setNotifications({...notifications, predictionNotifications: !notifications.predictionNotifications})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-toggle">
                <label htmlFor="weeklyReports">Weekly Reports</label>
                <label className="toggle">
                  <input
                    id="weeklyReports"
                    type="checkbox"
                    checked={notifications.weeklyReports}
                    onChange={() => setNotifications({...notifications, weeklyReports: !notifications.weeklyReports})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-toggle">
                <label htmlFor="marketNews">Market News</label>
                <label className="toggle">
                  <input
                    id="marketNews"
                    type="checkbox"
                    checked={notifications.marketNews}
                    onChange={() => setNotifications({...notifications, marketNews: !notifications.marketNews})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Appearance</h2>
            </div>
            <div className="card-body">
              <div className="setting-toggle">
                <label htmlFor="darkMode">Dark Mode</label>
                <label className="toggle">
                  <input
                    id="darkMode"
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="danger-zone">
        <h2>Danger Zone</h2>
        <div className="danger-actions">
          <div className="danger-action">
            <div className="danger-info">
              <h3>Reset All Predictions</h3>
              <p>This will delete all your saved prediction data and results.</p>
            </div>
            <button className="btn btn-outline danger">
              <Trash2 size={16} />
              Reset
            </button>
          </div>
          
          <div className="danger-action">
            <div className="danger-info">
              <h3>Delete Account</h3>
              <p>Permanently delete your account and all associated data.</p>
            </div>
            <button className="btn btn-danger">
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;