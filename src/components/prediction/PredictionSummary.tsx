import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import './Prediction.css';

const PredictionSummary: React.FC = () => {
  // Mock data - in a real app, this would be fetched from your backend
  const recentPredictions = [
    { symbol: '^GSPC', name: 'S&P 500', direction: 'up', actual: 'up', confidence: 72, date: '2025-05-20' },
    { symbol: 'AAPL', name: 'Apple Inc.', direction: 'up', actual: 'up', confidence: 68, date: '2025-05-19' },
    { symbol: '^DJI', name: 'Dow Jones', direction: 'down', actual: 'down', confidence: 62, date: '2025-05-16' },
    { symbol: 'MSFT', name: 'Microsoft', direction: 'up', actual: 'down', confidence: 54, date: '2025-05-15' },
    { symbol: 'AMZN', name: 'Amazon', direction: 'down', actual: 'up', confidence: 51, date: '2025-05-14' },
  ];

  const renderDirectionIcon = (direction: string, actual?: string) => {
    if (!actual) {
      if (direction === 'up') return <ArrowUpRight size={16} className="direction-icon up" />;
      if (direction === 'down') return <ArrowDownRight size={16} className="direction-icon down" />;
      return <Minus size={16} className="direction-icon neutral" />;
    }

    // For predictions with actual results
    if (direction === actual) {
      // Correct prediction
      return direction === 'up' 
        ? <ArrowUpRight size={16} className="direction-icon correct" />
        : <ArrowDownRight size={16} className="direction-icon correct" />;
    } else {
      // Incorrect prediction
      return direction === 'up'
        ? <ArrowUpRight size={16} className="direction-icon incorrect" />
        : <ArrowDownRight size={16} className="direction-icon incorrect" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="prediction-summary">
      <table className="predictions-table">
        <thead>
          <tr>
            <th>Stock</th>
            <th>Date</th>
            <th>Prediction</th>
            <th>Confidence</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {recentPredictions.map((prediction, index) => (
            <tr key={index}>
              <td>
                <div className="stock-cell">
                  <div className="stock-symbol">{prediction.symbol}</div>
                  <div className="stock-name">{prediction.name}</div>
                </div>
              </td>
              <td>{formatDate(prediction.date)}</td>
              <td>
                <div className="prediction-cell">
                  {renderDirectionIcon(prediction.direction)}
                  <span className={`prediction-text ${prediction.direction}`}>
                    {prediction.direction === 'up' ? 'Rise' : 'Fall'}
                  </span>
                </div>
              </td>
              <td>
                <div className="confidence-indicator" title={`${prediction.confidence}% confidence`}>
                  <div 
                    className={`confidence-bar ${prediction.confidence > 65 ? 'high' : prediction.confidence > 55 ? 'medium' : 'low'}`}
                    style={{ width: `${prediction.confidence}%` }}
                  ></div>
                </div>
              </td>
              <td>
                <div className="result-cell">
                  {prediction.actual === prediction.direction ? (
                    <span className="result correct">Correct</span>
                  ) : (
                    <span className="result incorrect">Incorrect</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="accuracy-summary">
        <div className="accuracy-metric">
          <div className="metric-label">Overall Accuracy</div>
          <div className="metric-value">57.4%</div>
        </div>
        <div className="accuracy-metric">
          <div className="metric-label">Up Predictions</div>
          <div className="metric-value">61.2%</div>
        </div>
        <div className="accuracy-metric">
          <div className="metric-label">Down Predictions</div>
          <div className="metric-value">52.8%</div>
        </div>
      </div>
    </div>
  );
};

export default PredictionSummary;