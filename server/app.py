from flask import Flask, request, jsonify, Response
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

app = Flask(__name__)

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
        query = request.args.get('query', '')
        
        # This would typically use a more comprehensive API
        # For now, return some common stocks
        symbols = [
            {'symbol': '^GSPC', 'name': 'S&P 500'},
            {'symbol': 'AAPL', 'name': 'Apple Inc.'},
            {'symbol': 'MSFT', 'name': 'Microsoft'},
            {'symbol': 'GOOGL', 'name': 'Alphabet Inc.'},
            {'symbol': 'AMZN', 'name': 'Amazon'},
            {'symbol': 'META', 'name': 'Meta Platforms'},
            {'symbol': 'TSLA', 'name': 'Tesla'},
            {'symbol': 'NVDA', 'name': 'NVIDIA'},
        ]
        
        filtered = [s for s in symbols if query.lower() in s['symbol'].lower() or query.lower() in s['name'].lower()]
        return jsonify({'success': True, 'data': filtered})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)