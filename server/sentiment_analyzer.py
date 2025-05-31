from textblob import TextBlob
from newsapi import NewsApiClient
import os
from datetime import datetime, timedelta
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re
import requests

# Get News API key from environment variable or use a default one
NEWS_API_KEY = os.getenv('NEWS_API_KEY', '8112143c705d4ced947a05e3baaf0249')

# Initialize News API client with the API key
try:
    newsapi = NewsApiClient(api_key=NEWS_API_KEY)
except Exception as e:
    print(f"Error initializing NewsAPI client: {str(e)}")
    newsapi = None

# Download required NLTK data
try:
    nltk.download('punkt')
    nltk.download('stopwords')
except Exception as e:
    print(f"Error downloading NLTK data: {str(e)}")

class SentimentAnalyzer:
    def __init__(self):
        self.newsapi = newsapi
        try:
            self.stop_words = set(stopwords.words('english'))
        except Exception as e:
            print(f"Error loading stopwords: {str(e)}")
            self.stop_words = set()
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')

    def clean_text(self, text):
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        # Convert to lowercase
        text = text.lower()
        # Tokenize
        tokens = word_tokenize(text)
        # Remove stopwords
        tokens = [t for t in tokens if t not in self.stop_words]
        return ' '.join(tokens)

    def analyze_sentiment(self, text):
        """
        Analyzes the sentiment of a given text using TextBlob.

        Args:
            text (str): The text to analyze.

        Returns:
            float: The polarity score (between -1.0 and 1.0).
        """
        analysis = TextBlob(text)
        return analysis.sentiment.polarity

    def get_news_sentiment(self, symbol, days=7):
        """
        Fetches news articles for a given stock symbol, analyzes sentiment, and returns the results.

        Args:
            symbol (str): The stock ticker symbol (e.g., "AAPL").
            days (int): Number of days back from today to fetch news.

        Returns:
            dict: A dictionary containing overall sentiment, sentiment distribution, and articles.
        """
        try:
            # Get news from NewsAPI
            from_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            to_date = datetime.now().strftime('%Y-%m-%d')
            
            # Remove ^ from index symbols for news search
            search_symbol = symbol.replace('^', '')
            
            news = self.newsapi.get_everything(
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
                "positive": len([s for s in sentiments if s > 0.1]),
                "neutral": len([s for s in sentiments if -0.1 <= s <= 0.1]),
                "negative": len([s for s in sentiments if s < -0.1])
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