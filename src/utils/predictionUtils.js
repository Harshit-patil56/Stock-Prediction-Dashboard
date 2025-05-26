// Utility functions for prediction operations

// Calculate simple moving average (SMA)
export const calculateSMA = (data, window) => {
  const result = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(null);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < window; j++) {
      sum += data[i - j];
    }
    
    result.push(sum / window);
  }
  
  return result;
};

// Calculate relative strength index (RSI)
export const calculateRSI = (data, window = 14) => {
  const result = [];
  const changes = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }
  
  // Calculate RSI
  for (let i = 0; i < data.length; i++) {
    if (i < window) {
      result.push(null);
      continue;
    }
    
    let gains = 0;
    let losses = 0;
    
    for (let j = i - window; j < i; j++) {
      if (changes[j - 1] > 0) {
        gains += changes[j - 1];
      } else {
        losses += Math.abs(changes[j - 1]);
      }
    }
    
    const avgGain = gains / window;
    const avgLoss = losses / window;
    
    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - (100 / (1 + rs)));
    }
  }
  
  return result;
};

// Calculate Bollinger Bands
export const calculateBollingerBands = (data, window = 20, numStdDev = 2) => {
  const sma = calculateSMA(data, window);
  const upperBand = [];
  const lowerBand = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      upperBand.push(null);
      lowerBand.push(null);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < window; j++) {
      sum += Math.pow(data[i - j] - sma[i], 2);
    }
    
    const stdDev = Math.sqrt(sum / window);
    
    upperBand.push(sma[i] + (numStdDev * stdDev));
    lowerBand.push(sma[i] - (numStdDev * stdDev));
  }
  
  return {
    middle: sma,
    upper: upperBand,
    lower: lowerBand
  };
};

// Calculate MACD (Moving Average Convergence Divergence)
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  const macdLine = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < slowPeriod - 1) {
      macdLine.push(null);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }
  
  const signalLine = calculateEMA(macdLine.filter(x => x !== null), signalPeriod);
  
  // Adjust the signal line to match the original data length
  const adjustedSignalLine = [];
  for (let i = 0; i < data.length; i++) {
    if (i < slowPeriod + signalPeriod - 2) {
      adjustedSignalLine.push(null);
    } else {
      adjustedSignalLine.push(signalLine[i - (slowPeriod + signalPeriod - 2)]);
    }
  }
  
  return {
    macdLine,
    signalLine: adjustedSignalLine
  };
};

// Calculate Exponential Moving Average (EMA)
export const calculateEMA = (data, window) => {
  const k = 2 / (window + 1);
  const ema = [];
  
  // Start with SMA for the first window elements
  let sum = 0;
  for (let i = 0; i < window; i++) {
    sum += data[i];
  }
  
  ema.push(sum / window);
  
  // Calculate EMA for the rest
  for (let i = window; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - window] * (1 - k));
  }
  
  // Pad the beginning with nulls to match the original data length
  const result = [];
  for (let i = 0; i < window - 1; i++) {
    result.push(null);
  }
  
  return result.concat(ema);
};

// Prepare data for prediction
export const prepareDataForPrediction = (stockData) => {
  // This would extract features from stockData that match your Python model
  // and format them for the prediction
  
  const closes = stockData.map(d => d.close);
  const volumes = stockData.map(d => d.volume);
  
  // Calculate technical indicators
  const sma5 = calculateSMA(closes, 5);
  const sma20 = calculateSMA(closes, 20);
  const rsi14 = calculateRSI(closes, 14);
  const macd = calculateMACD(closes);
  const bollingerBands = calculateBollingerBands(closes, 20, 2);
  
  // Combine all features
  const features = [];
  
  for (let i = 0; i < stockData.length; i++) {
    if (i < 26) continue; // Skip rows with insufficient data for indicators
    
    features.push({
      close: closes[i],
      volume: volumes[i],
      sma5: sma5[i],
      sma20: sma20[i],
      rsi14: rsi14[i],
      macd: macd.macdLine[i],
      macdSignal: macd.signalLine[i],
      bollingerUpper: bollingerBands.upper[i],
      bollingerLower: bollingerBands.lower[i],
      date: stockData[i].date
    });
  }
  
  return features;
};

export default {
  calculateSMA,
  calculateRSI,
  calculateBollingerBands,
  calculateMACD,
  calculateEMA,
  prepareDataForPrediction
};