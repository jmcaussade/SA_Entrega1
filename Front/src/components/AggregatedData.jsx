import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AggregatedData.css';

const AggregatedDataView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    authorName: '',
    numBooks: '',
    avgReviewScore: '',
    totalSales: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/aggregated-data');
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    }
    return 0;
  });

  const filteredData = sortedData.filter(item => {
    return (
      item.authorName.toLowerCase().includes(filters.authorName.toLowerCase()) &&
      item.numBooks.toString().includes(filters.numBooks) &&
      item.avgReviewScore.toString().includes(filters.avgReviewScore) &&
      item.totalSales.toString().includes(filters.totalSales)
    );
  });

  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="table-container">
      <h1>Aggregated Author Data</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>
              <button onClick={() => requestSort('authorName')}>
                Author
              </button>
              <input
                type="text"
                value={filters.authorName}
                onChange={e => handleFilterChange('authorName', e.target.value)}
              />
            </th>
            <th>
              <button onClick={() => requestSort('numBooks')}>
                Number of Published Books
              </button>
              <input
                type="text"
                value={filters.numBooks}
                onChange={e => handleFilterChange('numBooks', e.target.value)}
              />
            </th>
            <th>
              <button onClick={() => requestSort('avgReviewScore')}>
                Average Review Score
              </button>
              <input
                type="text"
                value={filters.avgReviewScore}
                onChange={e => handleFilterChange('avgReviewScore', e.target.value)}
              />
            </th>
            <th>
              <button onClick={() => requestSort('totalSales')}>
                Total Sales
              </button>
              <input
                type="text"
                value={filters.totalSales}
                onChange={e => handleFilterChange('totalSales', e.target.value)}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.authorName}</td>
              <td>{item.numBooks}</td>
              <td>{item.avgReviewScore}</td>
              <td>{item.totalSales}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AggregatedDataView;
