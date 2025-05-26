import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import './Chart.css';

interface HistoricalChartProps {
  symbol: string;
  period: string;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ symbol, period }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate API fetch with a delay
    setIsLoading(true);
    
    // In a real app, this would call your backend to fetch the data
    setTimeout(() => {
      // Calculate how many days to go back based on period
      const days = period === '1m' ? 30 : 
                  period === '3m' ? 90 : 
                  period === '6m' ? 180 : 
                  period === '1y' ? 365 : 
                  period === '5y' ? 1825 : 3650; // max
      
      // Generate mock data for the chart
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const data = [];
      let currentDate = new Date(startDate);
      let price = symbol === '^GSPC' ? 4500 : 
                 symbol === '^DJI' ? 35000 : 
                 symbol === '^IXIC' ? 14000 : 150;
      
      while (currentDate <= new Date()) {
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip weekends
          // Add some randomness to the price
          const changePercent = Math.random() * 0.02 - 0.01;
          price = price * (1 + changePercent);
          
          const open = price;
          const high = price * (1 + Math.random() * 0.01);
          const low = price * (1 - Math.random() * 0.01);
          const close = price * (1 + (Math.random() * 0.02 - 0.01));
          
          data.push({
            time: currentDate.toISOString().split('T')[0],
            open: open,
            high: high,
            low: low,
            close: close
          });
          
          price = close;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setChartData(data);
      setIsLoading(false);
    }, 1000);
  }, [symbol, period]);

  useEffect(() => {
    if (isLoading || !chartData.length || !chartContainerRef.current) return;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: document.body.classList.contains('dark-theme') ? '#d1d4dc' : '#333',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: document.body.classList.contains('dark-theme') ? '#363A45' : '#f0f3fa' },
        horzLines: { color: document.body.classList.contains('dark-theme') ? '#363A45' : '#f0f3fa' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#4CAF50',
      downColor: '#F44336',
      borderVisible: false,
      wickUpColor: '#4CAF50',
      wickDownColor: '#F44336',
    });

    candleSeries.setData(chartData);

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

export default HistoricalChart;