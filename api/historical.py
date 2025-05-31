"""
Historical Data API for Stock Prediction Dashboard

This module implements a serverless API endpoint for retrieving historical
stock data from Yahoo Finance.

Features:
- Historical price data retrieval
- Customizable time periods
- Data formatting for frontend consumption

Author: Harshit Patil
Date: 2024
"""

from http.server import BaseHTTPRequestHandler
import json
import yfinance as yf
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    """
    HTTP request handler for the historical data API.
    Implements GET method for retrieving historical stock data.
    """
    
    def do_GET(self):
        """
        Handle GET requests for historical stock data.
        
        Query Parameters:
            symbol (str): Stock symbol (default: '^GSPC')
            period (str): Time period (default: '1y')
            
        Returns:
            JSON response with historical price data
        """
        try:
            # Parse query parameters
            query = parse_qs(urlparse(self.path).query)
            symbol = query.get('symbol', ['^GSPC'])[0]
            period = query.get('period', ['1y'])[0]
            
            # Fetch and format historical data
            data = yf.download(symbol, period=period)
            data = data.reset_index()
            
            # Convert datetime to string for JSON serialization
            data['Date'] = data['Date'].dt.strftime('%Y-%m-%d')
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'success': True,
                'data': data.to_dict('records')
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