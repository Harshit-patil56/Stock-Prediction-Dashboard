import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import './Chart.css';

interface PredictionChartProps {
  symbol: string;
}

const PredictionChart: React.FC<PredictionChartProps> = ({ symbol }) => {
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
      startDate.setDate(startDate.getDate() - 180); // 6 months of data
      
      const data = [];
      let currentDate = new Date(startDate);
      let price = symbol === '^GSPC' ? 4500 : 150;
      
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
      
      // Add prediction point for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // For demonstration, show an up prediction
      const predictionPrice = price * 1.01;
      
      const predictionPoint = {
        time: tomorrow.toISOString().split('T')[0],
        value: predictionPrice,
        predicted: true
      };
      
      data.push(predictionPoint);
      
      setChartData(data);
      setIsLoading(false);
    }, 1000);
  }, [symbol]);

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

    const historicalData = chartData.filter(item => !item.predicted);
    const predictionData = chartData.filter(item => item.predicted);

    const lineSeries = chart.addLineSeries({
      color: '#1E88E5',
      lineWidth: 2,
    });
    
    lineSeries.setData(historicalData);

    if (predictionData.length > 0) {
      const predictionSeries = chart.addLineSeries({
        color: '#4CAF50',
        lineWidth: 2,
        lineStyle: 2, // Dashed line
      });
      
      // Connect the last historical point to the prediction
      const lastHistorical = historicalData[historicalData.length - 1];
      predictionSeries.setData([lastHistorical, ...predictionData]);

      // Add a marker for the prediction point
      const markerSeries = chart.addLineSeries({
        color: '#4CAF50',
        lineWidth: 0,
        lastValueVisible: false,
        priceLineVisible: false,
      });
      
      markerSeries.setMarkers([
        {
          time: predictionData[0].time,
          position: 'aboveBar',
          color: '#4CAF50',
          shape: 'circle',
          text: 'Prediction',
          size: 1
        }
      ]);
    }

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

export default PredictionChart;