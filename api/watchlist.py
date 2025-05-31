"""
Watchlist API Handler for Stock Prediction Dashboard

This module implements a serverless API endpoint for managing a user's stock watchlist.
It uses file-based storage in the /tmp directory, which is writable in Vercel's serverless environment.
The watchlist is stored as a JSON file and persists between function invocations.

Author: Harshit Patil
Date: 2024
"""

import json
import os
from http.server import BaseHTTPRequestHandler

# Path to the watchlist file in the /tmp directory
# This directory is writable in Vercel's serverless environment
WATCHLIST_FILE = '/tmp/watchlist.json'

def read_watchlist():
    """
    Read the watchlist from the JSON file.
    
    Returns:
        list: A list of stock items in the watchlist.
        If the file doesn't exist, returns an empty list.
    """
    if not os.path.exists(WATCHLIST_FILE):
        return []
    with open(WATCHLIST_FILE, 'r') as f:
        return json.load(f)

def write_watchlist(watchlist):
    """
    Write the watchlist to the JSON file.
    
    Args:
        watchlist (list): The list of stock items to write to the file.
    """
    with open(WATCHLIST_FILE, 'w') as f:
        json.dump(watchlist, f)

class handler(BaseHTTPRequestHandler):
    """
    HTTP request handler for the watchlist API.
    Implements GET, POST, and DELETE methods for managing the watchlist.
    """
    
    def do_GET(self):
        """
        Handle GET requests to retrieve the entire watchlist.
        
        Returns:
            JSON response containing the list of stocks in the watchlist.
        """
        watchlist = read_watchlist()
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(watchlist).encode())

    def do_POST(self):
        """
        Handle POST requests to add a new stock to the watchlist.
        
        Expected JSON body:
            {
                "symbol": "AAPL",
                "name": "Apple Inc."
            }
            
        Returns:
            JSON response containing the updated watchlist.
        """
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        item = json.loads(post_data)
        watchlist = read_watchlist()
        if item not in watchlist:
            watchlist.append(item)
            write_watchlist(watchlist)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(watchlist).encode())

    def do_DELETE(self):
        """
        Handle DELETE requests to remove a stock from the watchlist.
        
        Expected JSON body:
            {
                "symbol": "AAPL",
                "name": "Apple Inc."
            }
            
        Returns:
            JSON response containing the updated watchlist.
        """
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        item = json.loads(post_data)
        watchlist = read_watchlist()
        if item in watchlist:
            watchlist.remove(item)
            write_watchlist(watchlist)
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(watchlist).encode()) 