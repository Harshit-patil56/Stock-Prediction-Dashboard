import json
import os
from http.server import BaseHTTPRequestHandler

WATCHLIST_FILE = '/tmp/watchlist.json'

def read_watchlist():
    if not os.path.exists(WATCHLIST_FILE):
        return []
    with open(WATCHLIST_FILE, 'r') as f:
        return json.load(f)

def write_watchlist(watchlist):
    with open(WATCHLIST_FILE, 'w') as f:
        json.dump(watchlist, f)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        watchlist = read_watchlist()
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(watchlist).encode())

    def do_POST(self):
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