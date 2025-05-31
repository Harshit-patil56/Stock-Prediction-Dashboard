"""
News Sentiment Analyzer

This module provides functionality for analyzing sentiment in news articles related to stocks.
It uses the NewsAPI to fetch recent news articles and TextBlob for sentiment analysis.

Key Features:
- News article retrieval from NewsAPI
- Text preprocessing and cleaning
- Sentiment analysis using TextBlob
- Sentiment distribution calculation
- Article metadata extraction

Dependencies:
- textblob: Natural language processing
- newsapi-python: News API client
- nltk: Natural Language Toolkit
- requests: HTTP requests
"""

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

# Download required NLTK data for text processing
try:
    nltk.download('punkt')
    nltk.download('stopwords')
except Exception as e:
    print(f"Error downloading NLTK data: {str(e)}")

class SentimentAnalyzer:
    """
    A class for analyzing sentiment in news articles related to stocks.
    
    This class provides methods for fetching news articles, cleaning text,
    and analyzing sentiment using TextBlob. It also calculates sentiment
    distribution across multiple articles.
    """
    
    def __init__(self):
        """
        Initialize the SentimentAnalyzer with NewsAPI client and NLTK resources.
        
        Sets up the NewsAPI client and downloads required NLTK data for
        text processing and stopwords.
        """
        self.newsapi = newsapi
        try:
            self.stop_words = set(stopwords.words('english'))
        except Exception as e:
            print(f"Error loading stopwords: {str(e)}")
            self.stop_words = set()
            
        # Download required NLTK data if not present
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')

    def clean_text(self, text):
        """
        Clean and preprocess text for sentiment analysis.
        
        Args:
            text (str): The text to clean
            
        Returns:
            str: Cleaned text with special characters removed and stopwords filtered
        """
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
        Analyze the sentiment of a given text using TextBlob.
        
        Args:
            text (str): The text to analyze
            
        Returns:
            float: The polarity score (between -1.0 and 1.0)
                - Negative values indicate negative sentiment
                - Values near 0 indicate neutral sentiment
                - Positive values indicate positive sentiment
        """
        analysis = TextBlob(text)
        return analysis.sentiment.polarity

    def get_news_sentiment(self, symbol, days=7):
        """
        Fetch and analyze news articles for a given stock symbol.
        
        This method retrieves recent news articles related to the stock symbol,
        analyzes the sentiment of each article, and calculates overall sentiment
        metrics.
        
        Args:
            symbol (str): The stock ticker symbol (e.g., "AAPL")
            days (int): Number of days back from today to fetch news
            
        Returns:
            dict: A dictionary containing:
                - overall_sentiment: Average sentiment across all articles
                - sentiment_distribution: Count of positive, neutral, and negative articles
                - articles: List of articles with their sentiment scores and metadata
        """
        try:
            # Calculate date range for news search
            from_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            to_date = datetime.now().strftime('%Y-%m-%d')
            
            # Remove ^ from index symbols for news search
            search_symbol = symbol.replace('^', '')
            
            # Fetch news articles from NewsAPI
            news = self.newsapi.get_everything(
                q=search_symbol,
                from_param=from_date,
                to=to_date,
                language='en',
                sort_by='relevancy'
            )

            # Return empty results if no articles found
            if not news or not news.get('articles'):
                return {
                    "overall_sentiment": 0,
                    "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                    "articles": []
                }

            # Process each article
            sentiments = []
            articles_with_sentiment = []

            for article in news['articles']:
                title = article.get('title', '')
                description = article.get('description', '')
                if title and description:
                    # Combine title and description for analysis
                    full_text = f"{title} {description}"
                    polarity = self.analyze_sentiment(full_text)
                    sentiments.append(polarity)
                    
                    # Store article with sentiment analysis
                    articles_with_sentiment.append({
                        "title": title,
                        "description": description,
                        "url": article.get('url', ''),
                        "publishedAt": article.get('publishedAt', ''),
                        "sentiment": {
                            "polarity": polarity,
                            "subjectivity": TextBlob(full_text).sentiment.subjectivity
                        }
                    })

            # Calculate average sentiment
            avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0

            # Calculate sentiment distribution
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