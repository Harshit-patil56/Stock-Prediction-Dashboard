import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import './Market.css';

const MarketOverview: React.FC = () => {
  // Mock data - in a real app, this would be fetched from your backend
  const marketData = [
    { symbol: '^GSPC', name: 'S&P 500', value: 5963.60, change: 0.38, trend: 'up' },
    { symbol: '^DJI', name: 'Dow Jones', value: 39069.59, change: 0.12, trend: 'up' },
    { symbol: '^IXIC', name: 'NASDAQ', value: 19704.18, change: 0.53, trend: 'up' },
    { symbol: '^RUT', name: 'Russell 2000', value: 2198.96, change: -0.27, trend: 'down' },
    { symbol: '^VIX', name: 'VIX', value: 12.36, change: -2.84, trend: 'down' },
    { symbol: 'AAPL', name: 'Apple Inc.', value: 198.73, change: 1.21, trend: 'up' },
    { symbol: 'MSFT', name: 'Microsoft', value: 415.56, change: 0.88, trend: 'up' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', value: 176.44, change: 0.62, trend: 'up' },
    { symbol: 'AMZN', name: 'Amazon', value: 182.81, change: -0.34, trend: 'down' },
    { symbol: 'META', name: 'Meta Platforms', value: 508.19, change: 1.56, trend: 'up' },
  ];

  return (
    <div className="market-overview">
      <div className="market-summary">
        <div className="summary-item">
          <div className="summary-icon">
            <Activity size={20} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Market Sentiment</div>
            <div className="summary-value">Bullish</div>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon">
            <DollarSign size={20} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Trading Volume</div>
            <div className="summary-value">4.2B</div>
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-icon">
            <TrendingUp size={20} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Advancing Stocks</div>
            <div className="summary-value">68%</div>
          </div>
        </div>
      </div>

      <div className="market-table-container">
        <table className="market-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Last Price</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {marketData.map((stock, index) => (
              <tr key={index}>
                <td>
                  <div className="market-symbol">
                    <span className="symbol">{stock.symbol}</span>
                    <span className="name">{stock.name}</span>
                  </div>
                </td>
                <td className="price">${stock.value.toLocaleString()}</td>
                <td>
                  <div className={`change ${stock.trend}`}>
                    {stock.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{stock.change.toFixed(2)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketOverview;