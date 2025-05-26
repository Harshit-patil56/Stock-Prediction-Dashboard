import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import './Chart.css';

interface StockChartProps {
  ticker: string;
  timeframe: string;
}

const StockChart: React.FC<StockChartProps> = ({ ticker, timeframe }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate API fetch with a delay
    setIsLoading(true);
    
    // In a real app, this would call your backend to fetch the data
    setTimeout(() => {
      // Generate mock data for the chart
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeframe === '1w' ? 7 : 
                                              timeframe === '1m' ? 30 : 
                                              timeframe === '3m' ? 90 : 
                                              timeframe === '6m' ? 180 : 365));
      
      const data = [];
      let currentDate = new Date(startDate);
      let price = ticker === '^GSPC' ? 4500 : 150;
      
      while (currentDate <= new Date()) {
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip weekends
          // Add some randomness to the price
          price = price * (1 + (Math.random() * 0.02 - 0.01));
          
          data.push({
            time: currentDate.toISOString().split('T')[0],
            value: price
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setChartData(data);
      setIsLoading(false);
    }, 1000);
  }, [ticker, timeframe]);

  useEffect(() => {
    if (isLoading || !chartData.length || !chartContainerRef.current) return;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: document.body.classList.contains('dark-theme') ? '#d1d4dc' : '#333',
      },
      grid: {
        vertLines: { color: document.body.classList.contains('dark-theme') ? '#363A45' : '#f0f3fa' },
        horzLines: { color: document.body.classList.contains('dark-theme') ? '#363A45' : '#f0f3fa' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: '#1E88E5',
      topColor: 'rgba(30, 136, 229, 0.4)',
      bottomColor: 'rgba(30, 136, 229, 0.0)',
    });

    areaSeries.setData(chartData);

    chart.timeScale().fitContent();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [isLoading, chartData]);

  return (
    <div className="chart-wrapper">
      {isLoading ? (
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading chart data...</p>
        </div>
      ) : (
        <div className="chart-container" ref={chartContainerRef}></div>
      )}
    </div>
  );
};

export default StockChart;