// In a real app, this would communicate with your Python backend
// For this demo, we'll create a simple API module to simulate the backend calls

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Function to get historical stock data
export const getHistoricalData = async (symbol, period = '1y') => {
  try {
    const response = await fetch(`${API_BASE_URL}/historical?symbol=${symbol}&period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return {
      success: false,
      error: 'Failed to fetch historical data'
    };
  }
};

// Function to run stock prediction
export const runPrediction = async (params) => {
  try {
    const { symbol, period, modelParams } = params;
    
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol, period, modelParams }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error running prediction:', error);
    return {
      success: false,
      error: 'Failed to run prediction'
    };
  }
};

// Function to get market overview data
export const getMarketOverview = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/market-overview`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return {
      success: false,
      error: 'Failed to fetch market overview'
    };
  }
};

export default {
  getHistoricalData,
  runPrediction,
  getMarketOverview
};