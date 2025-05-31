import React from 'react';
import { TrendingUp, TrendingDown, Info, ArrowRight, BarChart, AlertTriangle, Shield } from 'lucide-react';
import './Prediction.css';

interface FeatureImportance {
  name: string;
  importance: number;
}

interface PredictionData {
  direction: 'up' | 'down';
  confidence: number;
  nextDayChange: number;
  symbol: string;
  date: string;
  features: FeatureImportance[];
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  modelMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  reliabilityScore: number;
  lastUpdated: string;
}

interface PredictionResultsProps {
  predictionData: PredictionData;
}

const PredictionResults: React.FC<PredictionResultsProps> = ({ predictionData }) => {
  const getReliabilityColor = (score: number) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  return (
    <div className="prediction-results">
      <div className="prediction-header">
        <div className={`prediction-icon ${predictionData.direction}`}>
          {predictionData.direction === 'up' ? (
            <TrendingUp size={24} />
          ) : (
            <TrendingDown size={24} />
          )}
        </div>
        <div className="prediction-main">
          <h3 className={`prediction-direction ${predictionData.direction}`}>
            {predictionData.direction === 'up' ? 'Predicted to Rise' : 'Predicted to Fall'}
          </h3>
          <div className="prediction-details">
            <div className="prediction-stat">
              <span className="stat-label">Expected Change</span>
              <span className={`stat-value ${predictionData.direction}`}>
                {predictionData.direction === 'up' ? '+' : '-'}{Math.abs(predictionData.nextDayChange)}%
              </span>
              <span className="confidence-interval">
                ({predictionData.confidenceInterval.lower}% to {predictionData.confidenceInterval.upper}%)
              </span>
            </div>
            <div className="prediction-stat">
              <span className="stat-label">Confidence</span>
              <span className="stat-value">{predictionData.confidence}%</span>
            </div>
            <div className="prediction-stat">
              <span className="stat-label">Prediction Date</span>
              <span className="stat-value">{predictionData.date}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reliability-indicator">
        <div className="reliability-header">
          <Shield size={16} />
          <span>Prediction Reliability</span>
        </div>
        <div className={`reliability-score ${getReliabilityColor(predictionData.reliabilityScore)}`}>
          {predictionData.reliabilityScore}%
        </div>
        <div className="reliability-metrics">
          <div className="metric">
            <span className="metric-label">Accuracy</span>
            <span className="metric-value">{predictionData.modelMetrics.accuracy}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Precision</span>
            <span className="metric-value">{predictionData.modelMetrics.precision}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Recall</span>
            <span className="metric-value">{predictionData.modelMetrics.recall}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">F1 Score</span>
            <span className="metric-value">{predictionData.modelMetrics.f1Score}%</span>
          </div>
        </div>
      </div>

      <div className="prediction-interpretation">
        <h4>
          <Info size={16} />
          Interpretation
        </h4>
        <p>
          Our model predicts that {predictionData.symbol === '^GSPC' ? 'S&P 500' : predictionData.symbol} will 
          <span className={predictionData.direction}>
            {predictionData.direction === 'up' ? ' rise ' : ' fall '}
            by approximately {Math.abs(predictionData.nextDayChange)}%
          </span> 
          in the next trading day. The model has a confidence level of {predictionData.confidence}% in this prediction.
          The expected range of movement is between {predictionData.confidenceInterval.lower}% and {predictionData.confidenceInterval.upper}%.
        </p>
      </div>

      <div className="feature-importance">
        <h4>
          <BarChart size={16} />
          Feature Importance
        </h4>
        <div className="feature-bars">
          {predictionData.features.map((feature, index) => (
            <div className="feature-item" key={index}>
              <div className="feature-label">{feature.name}</div>
              <div className="feature-bar-container">
                <div 
                  className="feature-bar" 
                  style={{ width: `${feature.importance * 100}%` }}
                ></div>
                <span className="feature-value">{(feature.importance * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="prediction-disclaimer">
        <AlertTriangle size={16} />
        <p>
          This prediction was generated on {predictionData.lastUpdated}. Past performance is not indicative of future results.
          Always conduct your own research and consider multiple factors before making investment decisions.
        </p>
      </div>

      <div className="next-steps">
        <h4>Next Steps</h4>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-content">
              <h5>Review Historical Performance</h5>
              <p>Check how the model has performed in similar market conditions</p>
            </div>
            <ArrowRight size={16} />
          </div>
          <div className="step-item">
            <div className="step-content">
              <h5>Adjust Model Parameters</h5>
              <p>Fine-tune the prediction model for better accuracy</p>
            </div>
            <ArrowRight size={16} />
          </div>
          <div className="step-item">
            <div className="step-content">
              <h5>Set Up Alerts</h5>
              <p>Get notified when prediction thresholds are reached</p>
            </div>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResults;