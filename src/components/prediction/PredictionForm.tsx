import React, { useState } from 'react';
import { Play, AlertTriangle } from 'lucide-react';
import './Prediction.css';

interface PredictionFormProps {
  stockSymbol: string;
  setStockSymbol: (symbol: string) => void;
  runPrediction: () => void;
  isRunning: boolean;
  activeTab: string;
}

const PredictionForm: React.FC<PredictionFormProps> = ({
  stockSymbol,
  setStockSymbol,
  runPrediction,
  isRunning,
  activeTab
}) => {
  const [trainingPeriod, setTrainingPeriod] = useState('1y');
  const [advancedSettings, setAdvancedSettings] = useState({
    nEstimators: 200,
    minSamplesSplit: 50,
    maxDepth: 10,
    featureImportance: true,
    horizons: [1, 5, 30]
  });

  const stockOptions = [
    { value: '^GSPC', label: 'S&P 500' },
    { value: '^DJI', label: 'Dow Jones' },
    { value: '^IXIC', label: 'NASDAQ' },
    { value: 'AAPL', label: 'Apple Inc.' },
    { value: 'MSFT', label: 'Microsoft' },
    { value: 'GOOGL', label: 'Alphabet Inc.' },
    { value: 'AMZN', label: 'Amazon' },
    { value: 'META', label: 'Meta Platforms' },
    { value: 'TSLA', label: 'Tesla' },
    { value: 'NVDA', label: 'NVIDIA' }
  ];

  const periodOptions = [
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '2y', label: '2 Years' },
    { value: '5y', label: '5 Years' },
    { value: 'max', label: 'Max Available' },
  ];

  return (
    <div className="prediction-form">
      <div className="form-group">
        <label htmlFor="stockSymbol">Stock Symbol</label>
        <select
          id="stockSymbol"
          value={stockSymbol}
          onChange={(e) => setStockSymbol(e.target.value)}
          className="form-select"
        >
          {stockOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="trainingPeriod">Training Period</label>
        <select
          id="trainingPeriod"
          value={trainingPeriod}
          onChange={(e) => setTrainingPeriod(e.target.value)}
          className="form-select"
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {activeTab === 'advanced' && (
        <div className="advanced-settings">
          <div className="form-group">
            <label htmlFor="nEstimators">Number of Estimators</label>
            <input
              id="nEstimators"
              type="number"
              value={advancedSettings.nEstimators}
              onChange={(e) => setAdvancedSettings({...advancedSettings, nEstimators: parseInt(e.target.value)})}
              className="form-input"
              min="10"
              max="1000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="minSamplesSplit">Min Samples Split</label>
            <input
              id="minSamplesSplit"
              type="number"
              value={advancedSettings.minSamplesSplit}
              onChange={(e) => setAdvancedSettings({...advancedSettings, minSamplesSplit: parseInt(e.target.value)})}
              className="form-input"
              min="2"
              max="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxDepth">Max Depth</label>
            <input
              id="maxDepth"
              type="number"
              value={advancedSettings.maxDepth}
              onChange={(e) => setAdvancedSettings({...advancedSettings, maxDepth: parseInt(e.target.value)})}
              className="form-input"
              min="1"
              max="100"
            />
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="featureImportance">
              <input
                id="featureImportance"
                type="checkbox"
                checked={advancedSettings.featureImportance}
                onChange={(e) => setAdvancedSettings({...advancedSettings, featureImportance: e.target.checked})}
                className="form-checkbox"
              />
              Calculate Feature Importance
            </label>
          </div>

          <div className="form-group">
            <label>Prediction Horizons (Days)</label>
            <div className="horizon-toggles">
              {[1, 5, 10, 30, 60].map((days) => (
                <label key={days} className="horizon-toggle">
                  <input
                    type="checkbox"
                    checked={advancedSettings.horizons.includes(days)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAdvancedSettings({
                          ...advancedSettings,
                          horizons: [...advancedSettings.horizons, days].sort((a, b) => a - b)
                        });
                      } else {
                        setAdvancedSettings({
                          ...advancedSettings,
                          horizons: advancedSettings.horizons.filter(h => h !== days)
                        });
                      }
                    }}
                  />
                  <span>{days}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="form-alert">
        <AlertTriangle size={16} />
        <span>Predictions are based on historical patterns and should not be used as the sole basis for financial decisions.</span>
      </div>

      <button 
        className="btn btn-primary full-width" 
        onClick={runPrediction}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <div className="loading-spinner-small"></div>
            Running Prediction...
          </>
        ) : (
          <>
            <Play size={16} />
            Run Prediction
          </>
        )}
      </button>
    </div>
  );
};

export default PredictionForm;