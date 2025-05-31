import { useEffect, useState, useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

interface SentimentData {
  overall_sentiment: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  articles: Array<{
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    sentiment: {
      polarity: number;
      subjectivity: number;
    };
  }>;
}

interface SentimentAnalysisProps {
  symbol: string;
}

export function SentimentAnalysis({ symbol }: SentimentAnalysisProps) {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/sentiment?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setSentimentData(data.data);
        } else {
          setError(data.error || 'Failed to fetch sentiment data');
        }
      } catch (_err) {
        console.error('Error fetching sentiment:', _err);
        setError('Failed to fetch sentiment data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSentiment();
  }, [symbol]);

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return 'up';
    if (sentiment < -0.1) return 'down';
    return 'neutral';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.1) return 'Positive';
    if (sentiment < -0.1) return 'Negative';
    return 'Neutral';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Sentiment Analysis</h2>
        </div>
        <div className="card-body">
          <div style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loader" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Sentiment Analysis</h2>
        </div>
        <div className="card-body">
          <div className="error-message">
            <div className="stat-value down">{error}</div>
            <button 
              className="btn btn-secondary" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '1rem' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sentimentData || !sentimentData.articles.length) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Sentiment Analysis</h2>
        </div>
        <div className="card-body">
          <div className="stat-value neutral">No sentiment data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Sentiment Analysis</h2>
      </div>
      <div className="card-body">
        <div className="overall-sentiment-section">
          <h3 className="stat-content">Overall Sentiment</h3>
          <div className="overall-sentiment-indicator">
            <div className={`stat-value ${getSentimentColor(sentimentData.overall_sentiment)}`}>
              {getSentimentLabel(sentimentData.overall_sentiment)}
            </div>
            <div className="sentiment-bar-container">
              <div
                className={`sentiment-bar ${getSentimentColor(sentimentData.overall_sentiment)}`}
                style={{
                  width: `${(sentimentData.overall_sentiment + 1) * 50}%`,
                }}
              />
            </div>
            <span className="sentiment-value-text">
              {typeof sentimentData.overall_sentiment === 'number' ? sentimentData.overall_sentiment.toFixed(2) : 'N/A'}
            </span>
          </div>
        </div>
        <div className="sentiment-distribution-section">
          <h3 className="stat-content">Sentiment Distribution</h3>
          <div className="sentiment-distribution-values">
            <div className={`stat-value up`}>Positive: {sentimentData.sentiment_distribution.positive}</div>
            <div className={`stat-value neutral`}>Neutral: {sentimentData.sentiment_distribution.neutral}</div>
            <div className={`stat-value down`}>Negative: {sentimentData.sentiment_distribution.negative}</div>
          </div>
        </div>
        <div className="recent-news-section">
          <h3 className="stat-content">Recent News</h3>
          <div className="recent-news-list">
            {sentimentData.articles.map((article, idx) => (
              <div key={idx} className={`stat-card ${theme}-theme article-card`}>
                <div className="article-header">
                  <h4 className="stat-content article-title">{article.title}</h4>
                  <span className={`stat-value ${getSentimentColor(article.sentiment.polarity)} article-sentiment-label`}>
                    {getSentimentLabel(article.sentiment.polarity)}
                  </span>
                </div>
                <p className="stat-description article-description">{article.description}</p>
                <div className="article-footer">
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-link">
                    Read more
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 