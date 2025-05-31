"""
Stock Prediction AI Backend Server

This Flask application serves as the backend for a stock prediction dashboard.
It provides endpoints for stock data retrieval, price predictions, and sentiment analysis.
The server uses machine learning models to predict stock movements and analyzes news sentiment.

Key Features:
- Stock price prediction using Random Forest Classifier
- Historical data retrieval from Yahoo Finance
- News sentiment analysis
- Watchlist management
- Symbol search functionality

Dependencies:
- Flask: Web framework
- Flask-CORS: Cross-origin resource sharing
- Pandas: Data manipulation
- NumPy: Numerical computations
- yfinance: Yahoo Finance API
- scikit-learn: Machine learning
- NLTK: Natural Language Processing
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score
import json
import os
from datetime import datetime, timedelta
import io
from sentiment_analyzer import SentimentAnalyzer
import nltk
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Download required NLTK data for text processing
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

# Initialize Flask application
app = Flask(__name__)

# Configure CORS to allow requests from specific origins
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://stock-prediction-dashboard-zrrk.vercel.app",
            "http://localhost:5173",  # For local development
            "http://localhost:3000"   # Alternative local development port
        ],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# Initialize sentiment analyzer
sentiment_analyzer = SentimentAnalyzer()

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
    
    # Add moving averages and trend indicators
    for window in [2, 5, 60, 250, 1000]:
        data[f'Close_Ratio_{window}'] = data['Close'] / data['Close'].rolling(window=window).mean()
        data[f'Trend_{window}'] = data['Return'].rolling(window=window).sum()
    
    # Create target variable (1 if price goes up tomorrow, 0 if down)
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
        model_params (dict, optional): Model hyperparameters
        
    Returns:
        tuple: (trained model, list of predictor names)
    """
    if model_params is None:
        model_params = {
            'n_estimators': 200,
            'min_samples_split': 50,
            'random_state': 1
        }
    
    # Define predictor variables
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

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Endpoint for stock price prediction.
    
    Expected JSON payload:
    {
        "symbol": "AAPL",
        "period": "1y",
        "modelParams": {}
    }
    
    Returns:
        JSON response with prediction results
    """
    try:
        data = request.json
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
            {"name": predictors[i], "importance": imp} 
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
        
        return jsonify({
            'success': True,
            'data': {
                "prediction": "up" if prediction == 1 else "down",
                "confidence": float(probability * 100),
                "expectedChange": float(expected_change * 100),
                "accuracy": float(accuracy * 100),
                "features": feature_importance
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/historical', methods=['GET'])
def get_historical_data():
    """
    Endpoint for retrieving historical stock data.
    
    Query Parameters:
        symbol (str): Stock symbol (default: ^GSPC)
        period (str): Time period (default: 1y)
        
    Returns:
        JSON response with historical price data
    """
    try:
        symbol = request.args.get('symbol', '^GSPC')
        period = request.args.get('period', '1y')
        
        # Fetch and format data
        data = yf.download(symbol, period=period)
        data = data.reset_index()
        
        return jsonify({
            'success': True,
            'data': data.to_dict('records')
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/symbols', methods=['GET'])
def search_symbols():
    """
    Endpoint for searching stock symbols and indices.
    
    Query Parameters:
        query (str): Search term
        
    Returns:
        JSON response with matching symbols and their details
    """
    try:
        query = request.args.get('query', '').strip().lower()
        
        if not query:
            return jsonify({
                'success': True,
                'data': []
            })

        # Define common stock indices
        indices = [
            {'symbol': '^GSPC', 'name': 'S&P 500', 'type': 'Index'},
            {'symbol': '^DJI', 'name': 'Dow Jones Industrial Average', 'type': 'Index'},
            {'symbol': '^IXIC', 'name': 'NASDAQ Composite', 'type': 'Index'},
            {'symbol': '^RUT', 'name': 'Russell 2000', 'type': 'Index'},
            {'symbol': '^VIX', 'name': 'CBOE Volatility Index', 'type': 'Index'},
        ]

        # Define popular stocks
        stocks = [
            {'symbol': 'AAPL', 'name': 'Apple Inc.', 'type': 'Technology'},
            {'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'type': 'Technology'},
            {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'type': 'Technology'},
            {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'type': 'Consumer Cyclical'},
            {'symbol': 'META', 'name': 'Meta Platforms Inc.', 'type': 'Technology'},
            {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'type': 'Automotive'},
            {'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'type': 'Technology'},
            {'symbol': 'JPM', 'name': 'JPMorgan Chase & Co.', 'type': 'Financial Services'},
            {'symbol': 'V', 'name': 'Visa Inc.', 'type': 'Financial Services'},
            {'symbol': 'WMT', 'name': 'Walmart Inc.', 'type': 'Consumer Defensive'},
            {'symbol': 'JNJ', 'name': 'Johnson & Johnson', 'type': 'Healthcare'},
            {'symbol': 'PG', 'name': 'Procter & Gamble Co.', 'type': 'Consumer Defensive'},
            {'symbol': 'MA', 'name': 'Mastercard Inc.', 'type': 'Financial Services'},
            {'symbol': 'HD', 'name': 'Home Depot Inc.', 'type': 'Consumer Cyclical'},
            {'symbol': 'BAC', 'name': 'Bank of America Corp.', 'type': 'Financial Services'},
        ]

        # Combine all symbols
        all_symbols = indices + stocks

        # Search in symbol and name
        results = []
        for item in all_symbols:
            if (query in item['symbol'].lower() or 
                query in item['name'].lower() or
                any(word in item['name'].lower() for word in query.split())):
                results.append(item)

        # Sort results by relevance
        def sort_key(item):
            symbol_match = item['symbol'].lower() == query
            name_match = item['name'].lower() == query
            symbol_starts = item['symbol'].lower().startswith(query)
            name_starts = item['name'].lower().startswith(query)
            
            if symbol_match or name_match:
                return 0
            elif symbol_starts or name_starts:
                return 1
            else:
                return 2

        results.sort(key=sort_key)
        results = results[:10]  # Limit results

        return jsonify({
            'success': True,
            'data': results
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/sentiment', methods=['GET'])
def sentiment():
    """
    Endpoint for retrieving news sentiment analysis.
    
    Query Parameters:
        symbol (str): Stock symbol (default: AAPL)
        days (int): Number of days to analyze (default: 7)
        
    Returns:
        JSON response with sentiment analysis results
    """
    symbol = request.args.get('symbol', 'AAPL')
    days = int(request.args.get('days', 7))
    try:
        result = sentiment_analyzer.get_news_sentiment(symbol, days)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/watchlist', methods=['GET'])
def get_watchlist():
    """
    Endpoint for retrieving user's watchlist.
    
    Returns:
        JSON response with watchlist data
    """
    try:
        with open('server/watchlist.json', 'r') as f:
            watchlist = json.load(f)
        return jsonify({"success": True, "data": watchlist})
    except FileNotFoundError:
        return jsonify({"success": True, "data": []})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/watchlist', methods=['POST'])
def add_to_watchlist():
    """
    Endpoint for adding a stock to the watchlist.
    
    Expected JSON payload:
    {
        "symbol": "AAPL",
        "name": "Apple Inc."
    }
    
    Returns:
        JSON response with updated watchlist
    """
    try:
        data = request.json
        symbol = data.get('symbol')
        name = data.get('name')
        
        if not symbol or not name:
            return jsonify({
                'success': False,
                'error': 'Symbol and name are required'
            }), 400
            
        try:
            with open('server/watchlist.json', 'r') as f:
                watchlist = json.load(f)
        except FileNotFoundError:
            watchlist = []
            
        # Check if symbol already exists
        if any(item['symbol'] == symbol for item in watchlist):
            return jsonify({
                'success': False,
                'error': 'Symbol already in watchlist'
            }), 400
            
        # Add new symbol
        watchlist.append({
            'symbol': symbol,
            'name': name,
            'added_at': datetime.now().isoformat()
        })
        
        # Save updated watchlist
        with open('server/watchlist.json', 'w') as f:
            json.dump(watchlist, f, indent=2)
            
        return jsonify({
            'success': True,
            'data': watchlist
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/watchlist/<symbol>', methods=['DELETE'])
def remove_from_watchlist(symbol):
    """
    Endpoint for removing a stock from the watchlist.
    
    Args:
        symbol (str): Stock symbol to remove
        
    Returns:
        JSON response with updated watchlist
    """
    try:
        try:
            with open('server/watchlist.json', 'r') as f:
                watchlist = json.load(f)
        except FileNotFoundError:
            return jsonify({
                'success': False,
                'error': 'Watchlist is empty'
            }), 404
            
        # Remove symbol if exists
        watchlist = [item for item in watchlist if item['symbol'] != symbol]
        
        # Save updated watchlist
        with open('server/watchlist.json', 'w') as f:
            json.dump(watchlist, f, indent=2)
            
        return jsonify({
            'success': True,
            'data': watchlist
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)