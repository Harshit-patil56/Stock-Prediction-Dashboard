from http.server import BaseHTTPRequestHandler
from textblob import TextBlob
from newsapi import NewsApiClient
import os
import json
from datetime import datetime, timedelta
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Initialize News API client
NEWS_API_KEY = os.getenv('NEWS_API_KEY', '8112143c705d4ced947a05e3baaf0249')
newsapi = NewsApiClient(api_key=NEWS_API_KEY)

class SentimentAnalyzer:
    def __init__(self):
        try:
            self.stop_words = set(stopwords.words('english'))
        except Exception as e:
            print(f"Error loading stopwords: {str(e)}")
            self.stop_words = set()

    def clean_text(self, text):
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        text = text.lower()
        tokens = word_tokenize(text)
        tokens = [t for t in tokens if t not in self.stop_words]
        return ' '.join(tokens)

    def analyze_sentiment(self, text):
        analysis = TextBlob(text)
        return analysis.sentiment.polarity

    def get_news_sentiment(self, symbol, days=7):
        try:
            from_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            to_date = datetime.now().strftime('%Y-%m-%d')
            
            search_symbol = symbol.replace('^', '')
            
            news = newsapi.get_everything(
                q=search_symbol,
                from_param=from_date,
                to=to_date,
                language='en',
                sort_by='relevancy'
            )

            if not news or not news.get('articles'):
                return {
                    "overall_sentiment": 0,
                    "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                    "articles": []
                }

            sentiments = []
            articles_with_sentiment = []

            for article in news['articles']:
                title = article.get('title', '')
                description = article.get('description', '')
                if title and description:
                    full_text = f"{title} {description}"
                    polarity = self.analyze_sentiment(full_text)
                    sentiments.append(polarity)
                    articles_with_sentiment.append({
                        "title": title,
                        "description": description,
                        "url": article.get('url', ''),
                        "publishedAt": article.get('publishedAt', ''),
                        "sentiment": {"polarity": polarity, "subjectivity": TextBlob(full_text).sentiment.subjectivity}
                    })

            if sentiments:
                avg_sentiment = sum(sentiments) / len(sentiments)
            else:
                avg_sentiment = 0

            sentiment_distribution = {
                "positive": sum(1 for s in sentiments if s > 0.1),
                "neutral": sum(1 for s in sentiments if -0.1 <= s <= 0.1),
                "negative": sum(1 for s in sentiments if s < -0.1)
            }

            return {
                "overall_sentiment": avg_sentiment,
                "sentiment_distribution": sentiment_distribution,
                "articles": articles_with_sentiment
            }
        except Exception as e:
            print(f"Error in get_news_sentiment: {str(e)}")
            return {
                "overall_sentiment": 0,
                "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                "articles": []
            }

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse query parameters
            from urllib.parse import urlparse, parse_qs
            query = parse_qs(urlparse(self.path).query)
            symbol = query.get('symbol', ['^GSPC'])[0]
            days = int(query.get('days', ['7'])[0])

            # Initialize sentiment analyzer
            analyzer = SentimentAnalyzer()
            
            # Get sentiment data
            result = analyzer.get_news_sentiment(symbol, days)
            
            # Set response headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Send response
            self.wfile.write(json.dumps({
                "success": True,
                "data": result
            }).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "error": str(e)
            }).encode()) 