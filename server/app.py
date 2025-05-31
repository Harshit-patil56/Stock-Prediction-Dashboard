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

# Load environment variables
load_dotenv()

# Try to download required NLTK data if not present
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')

app = Flask(__name__)
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
sentiment_analyzer = SentimentAnalyzer()

def process_data_for_prediction(data):
    data = data.copy()
    
    # Calculate daily returns
    data['Return'] = data['Close'].pct_change()
    
    # Add moving averages
    for window in [2, 5, 60, 250, 1000]:
        data[f'Close_Ratio_{window}'] = data['Close'] / data['Close'].rolling(window=window).mean()
        data[f'Trend_{window}'] = data['Return'].rolling(window=window).sum()
    
    # Add target - whether tomorrow's price is higher than today's
    data['Tomorrow'] = data['Close'].shift(-1)
    data['Target'] = (data['Tomorrow'] > data['Close']).astype(int)
    
    # Drop rows with NaN values
    data = data.dropna()
    
    return data

def train_model(data, model_params=None):
    if model_params is None:
        model_params = {
            'n_estimators': 200,
            'min_samples_split': 50,
            'random_state': 1
        }
    
    predictors = ['Close', 'Volume', 'Open', 'High', 'Low']
    predictors += [col for col in data.columns if 'Ratio' in col or 'Trend' in col]
    
    # Train-test split
    train_size = int(0.8 * len(data))
    train = data.iloc[:train_size]
    test = data.iloc[train_size:]
    
    model = RandomForestClassifier(**model_params)
    model.fit(train[predictors], train['Target'])
    
    return model, predictors

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        symbol = data.get('symbol', '^GSPC')
        period = data.get('period', '1y')
        model_params = data.get('modelParams', {})
        
        # Fetch data from Yahoo Finance
        stock_data = yf.download(symbol, period=period)
        
        # Process data for prediction
        processed_data = process_data_for_prediction(stock_data)
        
        # Train model and make prediction
        model, predictors = train_model(processed_data, model_params)
        
        # Get latest data point
        latest_data = processed_data.iloc[-1:][predictors]
        prediction = model.predict(latest_data)[0]
        probability = model.predict_proba(latest_data)[0][1]
        
        # Calculate feature importance
        feature_importance = [
            {"name": predictors[i], "importance": imp} 
            for i, imp in enumerate(model.feature_importances_)
        ]
        feature_importance = sorted(feature_importance, key=lambda x: x["importance"], reverse=True)[:6]
        
        # Calculate expected change
        avg_up_change = processed_data[processed_data['Target'] == 1]['Return'].mean()
        avg_down_change = processed_data[processed_data['Target'] == 0]['Return'].mean()
        expected_change = avg_up_change if prediction == 1 else avg_down_change
        
        # Calculate accuracy
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
    try:
        symbol = request.args.get('symbol', '^GSPC')
        period = request.args.get('period', '1y')
        
        # Fetch data from Yahoo Finance
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
    try:
        query = request.args.get('query', '').strip().lower()
        
        if not query:
            return jsonify({
                'success': True,
                'data': []
            })

        # Common stock indices
        indices = [
            {'symbol': '^GSPC', 'name': 'S&P 500', 'type': 'Index'},
            {'symbol': '^DJI', 'name': 'Dow Jones Industrial Average', 'type': 'Index'},
            {'symbol': '^IXIC', 'name': 'NASDAQ Composite', 'type': 'Index'},
            {'symbol': '^RUT', 'name': 'Russell 2000', 'type': 'Index'},
            {'symbol': '^VIX', 'name': 'CBOE Volatility Index', 'type': 'Index'},
        ]

        # Popular stocks
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

        # Search in both symbol and name
        results = []
        for item in all_symbols:
            if (query in item['symbol'].lower() or 
                query in item['name'].lower() or
                any(word in item['name'].lower() for word in query.split())):
                results.append(item)

        # Sort results: exact matches first, then partial matches
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

        # Limit results to prevent overwhelming the UI
        results = results[:10]

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
    symbol = request.args.get('symbol', 'AAPL')
    days = int(request.args.get('days', 7))
    try:
        result = sentiment_analyzer.get_news_sentiment(symbol, days)
        return jsonify({"success": True, "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# Watchlist management
@app.route('/api/watchlist', methods=['GET'])
def get_watchlist():
    try:
        # Use absolute path for watchlist file
        watchlist_file = os.path.join(os.path.dirname(__file__), 'watchlist.json')
        print(f"Watchlist file path: {watchlist_file}")  # Debug log
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(watchlist_file), exist_ok=True)
        
        if os.path.exists(watchlist_file):
            try:
                with open(watchlist_file, 'r') as f:
                    watchlist = json.load(f)
                print(f"Loaded watchlist: {watchlist}")  # Debug log
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {str(e)}")  # Debug log
                watchlist = []
                with open(watchlist_file, 'w') as f:
                    json.dump(watchlist, f)
        else:
            print("Watchlist file does not exist, creating new file")  # Debug log
            watchlist = []
            with open(watchlist_file, 'w') as f:
                json.dump(watchlist, f)
        
        return jsonify({
            'success': True,
            'data': watchlist
        })
    except Exception as e:
        print(f"Error in get_watchlist: {str(e)}")  # Debug log
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/watchlist', methods=['POST'])
def add_to_watchlist():
    try:
        data = request.get_json()
        print(f"Received data: {data}")  # Debug log
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
            
        symbol = data.get('symbol')
        name = data.get('name')
        
        if not symbol or not name:
            return jsonify({
                'success': False,
                'error': 'Symbol and name are required'
            }), 400
        
        # Use absolute path for watchlist file
        watchlist_file = os.path.join(os.path.dirname(__file__), 'watchlist.json')
        print(f"Watchlist file path: {watchlist_file}")  # Debug log
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(watchlist_file), exist_ok=True)
        
        if os.path.exists(watchlist_file):
            try:
                with open(watchlist_file, 'r') as f:
                    watchlist = json.load(f)
                print(f"Loaded watchlist: {watchlist}")  # Debug log
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {str(e)}")  # Debug log
                watchlist = []
        else:
            print("Watchlist file does not exist, creating new file")  # Debug log
            watchlist = []
        
        # Check if symbol already exists
        if any(item['symbol'] == symbol for item in watchlist):
            existing_item = next(item for item in watchlist if item['symbol'] == symbol)
            return jsonify({
                'success': False,
                'error': f"{existing_item['name']} is already in your watchlist"
            }), 400
        
        # Add new item
        new_item = {
            'symbol': symbol,
            'name': name,
            'added_at': datetime.now().isoformat()
        }
        watchlist.append(new_item)
        print(f"Adding new item: {new_item}")  # Debug log
        
        # Save updated watchlist
        with open(watchlist_file, 'w') as f:
            json.dump(watchlist, f)
        print("Watchlist saved successfully")  # Debug log
        
        return jsonify({
            'success': True,
            'data': watchlist
        })
    except Exception as e:
        print(f"Error in add_to_watchlist: {str(e)}")  # Debug log
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/watchlist/<symbol>', methods=['DELETE'])
def remove_from_watchlist(symbol):
    try:
        # Use absolute path for watchlist file
        watchlist_file = os.path.join(os.path.dirname(__file__), 'watchlist.json')
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(watchlist_file), exist_ok=True)
        
        if os.path.exists(watchlist_file):
            try:
                with open(watchlist_file, 'r') as f:
                    watchlist = json.load(f)
            except json.JSONDecodeError:
                watchlist = []
        else:
            watchlist = []
            
        # Remove item
        watchlist = [item for item in watchlist if item['symbol'] != symbol]
        
        # Save updated watchlist
        with open(watchlist_file, 'w') as f:
            json.dump(watchlist, f)
        
        return jsonify({
            'success': True,
            'data': watchlist
        })
    except Exception as e:
        print(f"Error in remove_from_watchlist: {str(e)}")  # Add logging
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)