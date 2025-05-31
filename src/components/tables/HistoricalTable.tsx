import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Download } from 'lucide-react';
import './Table.css';

interface HistoricalTableProps {
  symbol: string;
  period: string;
}

interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
}

const HistoricalTable: React.FC<HistoricalTableProps> = ({ symbol, period }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof StockData; direction: 'ascending' | 'descending' }>({
    key: 'date',
    direction: 'descending'
  });

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
      
      // Generate mock data for the table
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const data: StockData[] = [];
      const currentDate = new Date(startDate);
      let previousClose = symbol === '^GSPC' ? 4500 : 
                          symbol === '^DJI' ? 35000 : 
                          symbol === '^IXIC' ? 14000 : 150;
      
      while (currentDate <= new Date()) {
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // Skip weekends
          // Add some randomness to the prices
          const changePercent = Math.random() * 0.02 - 0.01;
          const open = previousClose * (1 + (Math.random() * 0.01 - 0.005));
          const close = open * (1 + changePercent);
          const high = Math.max(open, close) * (1 + Math.random() * 0.005);
          const low = Math.min(open, close) * (1 - Math.random() * 0.005);
          const volume = Math.floor(Math.random() * 10000000) + 1000000;
          
          data.push({
            date: currentDate.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: volume,
            change: parseFloat(((close - previousClose) / previousClose * 100).toFixed(2))
          });
          
          previousClose = close;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setStockData(data);
      setIsLoading(false);
    }, 1000);
  }, [symbol, period]);

  const handleSort = (key: keyof StockData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    const sortableData = [...stockData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [stockData, sortConfig]);

  const getSortIcon = (key: keyof StockData) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return (volume / 1000000000).toFixed(2) + 'B';
    }
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(2) + 'M';
    }
    if (volume >= 1000) {
      return (volume / 1000).toFixed(2) + 'K';
    }
    return volume.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const exportToCsv = () => {
    const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'Change (%)'];
    const csvData = [
      headers.join(','),
      ...stockData.map(row => 
        [
          row.date, 
          row.open.toFixed(2), 
          row.high.toFixed(2), 
          row.low.toFixed(2), 
          row.close.toFixed(2), 
          row.volume, 
          row.change.toFixed(2)
        ].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${symbol}_historical_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="historical-table-container">
      {isLoading ? (
        <div className="table-loading">
          <div className="loading-spinner"></div>
          <p>Loading historical data...</p>
        </div>
      ) : (
        <>
          <div className="table-actions">
            <button className="btn btn-primary" onClick={exportToCsv}>
              <Download size={16} />
              Export to CSV
            </button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('date')} className="sortable">
                    <div className="th-content">
                      Date {getSortIcon('date')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('open')} className="sortable">
                    <div className="th-content">
                      Open {getSortIcon('open')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('high')} className="sortable">
                    <div className="th-content">
                      High {getSortIcon('high')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('low')} className="sortable">
                    <div className="th-content">
                      Low {getSortIcon('low')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('close')} className="sortable">
                    <div className="th-content">
                      Close {getSortIcon('close')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('volume')} className="sortable">
                    <div className="th-content">
                      Volume {getSortIcon('volume')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('change')} className="sortable">
                    <div className="th-content">
                      Change {getSortIcon('change')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, index) => (
                  <tr key={index}>
                    <td>{formatDate(row.date)}</td>
                    <td>${formatNumber(row.open)}</td>
                    <td>${formatNumber(row.high)}</td>
                    <td>${formatNumber(row.low)}</td>
                    <td>${formatNumber(row.close)}</td>
                    <td>{formatVolume(row.volume)}</td>
                    <td className={row.change >= 0 ? 'positive' : 'negative'}>
                      {row.change >= 0 ? '+' : ''}{row.change}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoricalTable;