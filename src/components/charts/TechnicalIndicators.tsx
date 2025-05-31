import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TechnicalIndicatorsProps {
  data: any[];
  symbol: string;
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ data, symbol }) => {
  const [selectedIndicator, setSelectedIndicator] = useState('RSI');

  // Calculate RSI
  const calculateRSI = (data: any[], period: number = 14) => {
    const changes = data.map((item, index) => {
      if (index === 0) return 0;
      return item.Close - data[index - 1].Close;
    });

    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? -change : 0);

    const avgGain = gains.slice(period).map((_, i) => {
      const sum = gains.slice(i, i + period).reduce((a, b) => a + b, 0);
      return sum / period;
    });

    const avgLoss = losses.slice(period).map((_, i) => {
      const sum = losses.slice(i, i + period).reduce((a, b) => a + b, 0);
      return sum / period;
    });

    const rsi = avgGain.map((gain, i) => {
      const loss = avgLoss[i];
      if (loss === 0) return 100;
      const rs = gain / loss;
      return 100 - (100 / (1 + rs));
    });

    return data.slice(period).map((item, i) => ({
      ...item,
      RSI: rsi[i]
    }));
  };

  // Calculate Moving Averages
  const calculateMA = (data: any[], period: number) => {
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, [`MA${period}`]: null };
      const sum = data.slice(index - period + 1, index + 1).reduce((acc, curr) => acc + curr.Close, 0);
      return { ...item, [`MA${period}`]: sum / period };
    });
  };

  // Calculate MACD
  const calculateMACD = (data: any[]) => {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    const macdLine = ema12.map((item, i) => item.EMA12 - ema26[i].EMA26);
    const signalLine = calculateEMA(macdLine.map((macd, i) => ({ ...data[i], Close: macd })), 9);
    
    return data.map((item, i) => ({
      ...item,
      MACD: macdLine[i],
      Signal: signalLine[i]?.EMA9 || null,
      Histogram: macdLine[i] - (signalLine[i]?.EMA9 || 0)
    }));
  };

  // Helper function to calculate EMA
  const calculateEMA = (data: any[], period: number) => {
    const k = 2 / (period + 1);
    const ema = [data[0].Close];
    
    for (let i = 1; i < data.length; i++) {
      ema.push(data[i].Close * k + ema[i - 1] * (1 - k));
    }
    
    return data.map((item, i) => ({
      ...item,
      [`EMA${period}`]: ema[i]
    }));
  };

  const getIndicatorData = () => {
    switch (selectedIndicator) {
      case 'RSI':
        return calculateRSI(data);
      case 'MA':
        return calculateMA(data, 20);
      case 'MACD':
        return calculateMACD(data);
      default:
        return data;
    }
  };

  const indicatorData = getIndicatorData();

  return (
    <div className="technical-indicators">
      <div className="indicator-controls">
        <button 
          className={`indicator-button ${selectedIndicator === 'RSI' ? 'active' : ''}`}
          onClick={() => setSelectedIndicator('RSI')}
        >
          RSI
        </button>
        <button 
          className={`indicator-button ${selectedIndicator === 'MA' ? 'active' : ''}`}
          onClick={() => setSelectedIndicator('MA')}
        >
          Moving Averages
        </button>
        <button 
          className={`indicator-button ${selectedIndicator === 'MACD' ? 'active' : ''}`}
          onClick={() => setSelectedIndicator('MACD')}
        >
          MACD
        </button>
      </div>

      <div className="indicator-chart">
        <LineChart width={800} height={400} data={indicatorData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" />
          <YAxis />
          <Tooltip />
          <Legend />
          
          {selectedIndicator === 'RSI' && (
            <Line type="monotone" dataKey="RSI" stroke="#8884d8" />
          )}
          
          {selectedIndicator === 'MA' && (
            <>
              <Line type="monotone" dataKey="Close" stroke="#82ca9d" />
              <Line type="monotone" dataKey="MA20" stroke="#8884d8" />
            </>
          )}
          
          {selectedIndicator === 'MACD' && (
            <>
              <Line type="monotone" dataKey="MACD" stroke="#8884d8" />
              <Line type="monotone" dataKey="Signal" stroke="#82ca9d" />
              <Line type="monotone" dataKey="Histogram" stroke="#ffc658" />
            </>
          )}
        </LineChart>
      </div>
    </div>
  );
};

export default TechnicalIndicators; 