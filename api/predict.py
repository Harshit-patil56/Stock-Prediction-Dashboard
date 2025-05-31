"""
Stock Prediction API for Stock Prediction Dashboard

This module implements a serverless API endpoint for predicting stock prices
using a simple moving average crossover strategy.

Features:
- Simple moving average crossover prediction
- Technical indicator calculation
- Expected price change calculation

Author: Harshit Patil
Date: 2024
"""

from http.server import BaseHTTPRequestHandler
import json
import yfinance as yf
from urllib.parse import urlparse, parse_qs

def calculate_moving_average(data, window):
    """
    Calculate simple moving average for a given window.
    
    Args:
        data (list): List of prices
        window (int): Window size for moving average
        
    Returns:
        list: Moving average values
    """
    return [sum(data[i:i+window])/window for i in range(len(data)-window+1)]

def predict_price(data, short_window=20, long_window=50):
    """
    Predict price movement using moving average crossover.
    
    Args:
        data (list): List of closing prices
        short_window (int): Short-term moving average window
        long_window (int): Long-term moving average window
        
    Returns:
        dict: Prediction results
    """
    # Calculate moving averages
    short_ma = calculate_moving_average(data, short_window)
    long_ma = calculate_moving_average(data, long_window)
    
    # Get latest values
    current_short_ma = short_ma[-1]
    current_long_ma = long_ma[-1]
    previous_short_ma = short_ma[-2]
    previous_long_ma = long_ma[-2]
    
    # Determine prediction
    prediction = "up" if current_short_ma > current_long_ma else "down"
    
    # Calculate confidence based on the difference between moving averages
    difference = abs(current_short_ma - current_long_ma)
    max_difference = max(data) * 0.1  # 10% of max price as reference
    confidence = min(100, (difference / max_difference) * 100)
    
    # Calculate expected change
    if prediction == "up":
        expected_change = (current_short_ma - current_long_ma) / current_long_ma * 100
    else:
        expected_change = (current_long_ma - current_short_ma) / current_short_ma * 100
    
    return {
        "prediction": prediction,
        "confidence": confidence,
        "expectedChange": expected_change,
        "features": [
            {"name": "Short MA", "importance": 0.6},
            {"name": "Long MA", "importance": 0.4}
        ]
    }

class handler(BaseHTTPRequestHandler):
    """
    HTTP request handler for the stock prediction API.
    Implements POST method for making predictions.
    """
    
    def do_POST(self):
        """
        Handle POST requests for stock price prediction.
        
        Expected JSON body:
            {
                "symbol": "AAPL",
                "period": "1y"
            }
            
        Returns:
            JSON response with prediction results
        """
        try:
            # Parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            # Get parameters
            symbol = data.get('symbol', '^GSPC')
            period = data.get('period', '1y')
            
            # Fetch historical data
            stock_data = yf.download(symbol, period=period)
            closing_prices = stock_data['Close'].tolist()
            
            # Make prediction
            result = predict_price(closing_prices)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'success': True,
                'data': result
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            # Handle errors
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                'success': False,
                'error': str(e)
            }
            
            self.wfile.write(json.dumps(error_response).encode()) 