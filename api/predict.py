"""
Stock Prediction API for Stock Prediction Dashboard

This module implements a serverless API endpoint for predicting stock prices
using machine learning. It uses historical data from Yahoo Finance and
a Random Forest model for predictions.

Features:
- Stock price prediction using Random Forest
- Technical indicator calculation
- Feature importance analysis
- Expected price change calculation

Author: Harshit Patil
Date: 2024
"""

from http.server import BaseHTTPRequestHandler
import json
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score
from urllib.parse import urlparse, parse_qs

def process_data_for_prediction(data):
    """
    Process stock data for machine learning prediction.
    
    Args:
        data (pd.DataFrame): Raw stock data from Yahoo Finance
        
    Returns:
        pd.DataFrame: Processed data with technical indicators and target variable
    """
    data = data.copy()
    
    # Calculate daily returns
    data['Return'] = data['Close'].pct_change()
    
    # Add moving averages and their ratios
    for window in [2, 5, 60, 250, 1000]:
        data[f'Close_Ratio_{window}'] = data['Close'] / data['Close'].rolling(window=window).mean()
        data[f'Trend_{window}'] = data['Return'].rolling(window=window).sum()
    
    # Add target variable - whether tomorrow's price is higher than today's
    data['Tomorrow'] = data['Close'].shift(-1)
    data['Target'] = (data['Tomorrow'] > data['Close']).astype(int)
    
    # Remove rows with missing values
    data = data.dropna()
    
    return data

def train_model(data, model_params=None):
    """
    Train a Random Forest model for stock price prediction.
    
    Args:
        data (pd.DataFrame): Processed stock data
        model_params (dict, optional): Parameters for the Random Forest model
        
    Returns:
        tuple: (trained model, list of predictor column names)
    """
    if model_params is None:
        model_params = {
            'n_estimators': 200,
            'min_samples_split': 50,
            'random_state': 1
        }
    
    # Select features for prediction
    predictors = ['Close', 'Volume', 'Open', 'High', 'Low']
    predictors += [col for col in data.columns if 'Ratio' in col or 'Trend' in col]
    
    # Split data into training and testing sets
    train_size = int(0.8 * len(data))
    train = data.iloc[:train_size]
    test = data.iloc[train_size:]
    
    # Train the model
    model = RandomForestClassifier(**model_params)
    model.fit(train[predictors], train['Target'])
    
    return model, predictors

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
                "period": "1y",
                "modelParams": {
                    "n_estimators": 200,
                    "min_samples_split": 50
                }
            }
            
        Returns:
            JSON response with prediction results including:
                - prediction: "up" or "down"
                - confidence: prediction probability
                - expectedChange: expected price change percentage
                - accuracy: model accuracy
                - features: top 6 important features
        """
        try:
            # Parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            # Get parameters
            symbol = data.get('symbol', '^GSPC')
            period = data.get('period', '1y')
            model_params = data.get('modelParams', {})
            
            # Fetch historical data
            stock_data = yf.download(symbol, period=period)
            
            # Process data and train model
            processed_data = process_data_for_prediction(stock_data)
            model, predictors = train_model(processed_data, model_params)
            
            # Make prediction for latest data point
            latest_data = processed_data.iloc[-1:][predictors]
            prediction = model.predict(latest_data)[0]
            probability = model.predict_proba(latest_data)[0][1]
            
            # Calculate feature importance
            feature_importance = [
                {"name": predictors[i], "importance": float(imp)} 
                for i, imp in enumerate(model.feature_importances_)
            ]
            feature_importance = sorted(feature_importance, key=lambda x: x["importance"], reverse=True)[:6]
            
            # Calculate expected price change
            avg_up_change = processed_data[processed_data['Target'] == 1]['Return'].mean()
            avg_down_change = processed_data[processed_data['Target'] == 0]['Return'].mean()
            expected_change = avg_up_change if prediction == 1 else avg_down_change
            
            # Calculate model accuracy
            predictions = model.predict(processed_data[predictors])
            accuracy = precision_score(processed_data['Target'], predictions)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'success': True,
                'data': {
                    "prediction": "up" if prediction == 1 else "down",
                    "confidence": float(probability * 100),
                    "expectedChange": float(expected_change * 100),
                    "accuracy": float(accuracy * 100),
                    "features": feature_importance
                }
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