import React, { useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { ArrowRight, Info, Settings } from 'lucide-react';
import PredictionChart from '../components/charts/PredictionChart';
import PredictionForm from '../components/prediction/PredictionForm';
import PredictionResults from '../components/prediction/PredictionResults';
import './Predictions.css';

const Predictions: React.FC = () => {
  const [stockSymbol, setStockSymbol] = useState('^GSPC');
  const [isRunning, setIsRunning] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const runPrediction = () => {
    setIsRunning(true);
    setIsResultsVisible(false); // Hide previous results
    
    // Simulate API call and prediction logic
    setTimeout(() => {
      // Generate simulated prediction data based on stockSymbol
      const simulatedData = {
        direction: Math.random() > 0.5 ? 'up' : 'down', // Randomly predict up or down
        confidence: parseFloat((Math.random() * (75 - 50) + 50).toFixed(1)), // Confidence between 50% and 75%
        nextDayChange: parseFloat((Math.random() * 2).toFixed(1)), // Change up to 2%
        symbol: stockSymbol,
        date: new Date().toLocaleDateString(),
        features: [
          { name: 'Previous Close', importance: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)) },
          { name: 'Volume', importance: parseFloat((Math.random() * 0.2 + 0.1).toFixed(2)) },
          { name: 'Trend (5 days)', importance: parseFloat((Math.random() * 0.2 + 0.05).toFixed(2)) },
          { name: 'Volatility', importance: parseFloat((Math.random() * 0.15 + 0.05).toFixed(2)) },
          { name: 'RSI', importance: parseFloat((Math.random() * 0.1 + 0.05).toFixed(2)) },
          { name: 'Other factors', importance: parseFloat((Math.random() * 0.1).toFixed(2)) }
        ],
        confidenceInterval: {
          lower: parseFloat((Math.random() * 0.5).toFixed(1)),
          upper: parseFloat((Math.random() * 1.5 + 1).toFixed(1))
        },
        modelMetrics: {
          accuracy: parseFloat((Math.random() * 20 + 60).toFixed(1)), // Between 60% and 80%
          precision: parseFloat((Math.random() * 15 + 65).toFixed(1)), // Between 65% and 80%
          recall: parseFloat((Math.random() * 15 + 65).toFixed(1)), // Between 65% and 80%
          f1Score: parseFloat((Math.random() * 15 + 65).toFixed(1)) // Between 65% and 80%
        },
        reliabilityScore: parseFloat((Math.random() * 20 + 60).toFixed(1)), // Between 60% and 80%
        lastUpdated: new Date().toLocaleString()
      };
      
      // Normalize feature importance to sum to 1
      const totalImportance = simulatedData.features.reduce((sum, feature) => sum + feature.importance, 0);
      simulatedData.features.forEach(feature => feature.importance = feature.importance / totalImportance);

      setPredictionResult(simulatedData);
      setIsRunning(false);
      setIsResultsVisible(true);
    }, 2000);
  };

  return (
    <div className="predictions-page">
      <div className="page-header">
        <h1>Stock Predictions</h1>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic
        </button>
        <button 
          className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced
        </button>
      </div>

      <div className="prediction-container">
        <div className="card">
          <div className="card-header">
            <h2>Configure Prediction</h2>
            <button className="settings-button">
              <Settings size={18} />
            </button>
          </div>
          <div className="card-body">
            <PredictionForm 
              stockSymbol={stockSymbol} 
              setStockSymbol={setStockSymbol}
              runPrediction={runPrediction}
              isRunning={isRunning}
              activeTab={activeTab}
            />
          </div>
        </div>

        {stockSymbol && (
          <div className="card">
            <div className="card-header">
              <h2>Historical Data</h2>
              <div className="help-text">
                <Info size={16} />
                <span>Used for prediction input</span>
              </div>
            </div>
            <div className="card-body">
              <PredictionChart symbol={stockSymbol} />
            </div>
          </div>
        )}

        {isResultsVisible && predictionResult && (
          <div className="card results-card">
            <div className="card-header">
              <h2>Prediction Results</h2>
              <div className="model-info">
                <span className="model-badge">RandomForest</span>
                <span className="accuracy-badge">Accuracy: 57.4%</span>
              </div>
            </div>
            <div className="card-body">
              <PredictionResults predictionData={predictionResult} />
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2>How It Works</h2>
          </div>
          <div className="card-body">
            <div className="how-it-works">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Data Collection</h3>
                  <p>Historical stock data is gathered using the yfinance API, including price and volume information.</p>
                </div>
              </div>
              <ArrowRight className="step-arrow" size={20} />
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Feature Engineering</h3>
                  <p>Technical indicators and features are created from raw data, including moving averages and momentum metrics.</p>
                </div>
              </div>
              <ArrowRight className="step-arrow" size={20} />
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Model Training</h3>
                  <p>A Random Forest classifier is trained on historical data patterns to predict price movement direction.</p>
                </div>
              </div>
              <ArrowRight className="step-arrow" size={20} />
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Prediction</h3>
                  <p>The model predicts whether the price will go up or down the next day, with a confidence score.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;