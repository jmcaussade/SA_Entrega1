import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AggregatedData.css';

const AggregatedDataView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'none' });
  const [filters, setFilters] = useState({
    authorName: '',
    numBooks: '',
    avgReviewScore: '',
    totalSales: ''
  });
  const [sortDirections, setSortDirections] = useState({
    authorName: 'none',
    numBooks: 'none',
    avgReviewScore: 'none',
    totalSales: 'none'
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
    if (sortConfig.key && sortConfig.direction !== 'none') {
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

  const requestSort = (key, direction) => {
    setSortConfig({ key, direction });
    setSortDirections({
      authorName: key === 'authorName' ? direction : 'none',
      numBooks: key === 'numBooks' ? direction : 'none',
      avgReviewScore: key === 'avgReviewScore' ? direction : 'none',
      totalSales: key === 'totalSales' ? direction : 'none'
    });
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
              Author
              <div>
                <select
                  value={sortDirections.authorName}
                  onChange={e => requestSort('authorName', e.target.value)}
                >
                  <option value="none">No Sort</option>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <input
                type="text"
                value={filters.authorName}
                onChange={e => handleFilterChange('authorName', e.target.value)}
              />
            </th>
            <th>
              Number of Published Books
              <div>
                <select
                  value={sortDirections.numBooks}
                  onChange={e => requestSort('numBooks', e.target.value)}
                >
                  <option value="none">No Sort</option>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <input
                type="text"
                value={filters.numBooks}
                onChange={e => handleFilterChange('numBooks', e.target.value)}
              />
            </th>
            <th>
              Average Review Score
              <div>
                <select
                  value={sortDirections.avgReviewScore}
                  onChange={e => requestSort('avgReviewScore', e.target.value)}
                >
                  <option value="none">No Sort</option>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <input
                type="text"
                value={filters.avgReviewScore}
                onChange={e => handleFilterChange('avgReviewScore', e.target.value)}
              />
            </th>
            <th>
              Total Sales
              <div>
                <select
                  value={sortDirections.totalSales}
                  onChange={e => requestSort('totalSales', e.target.value)}
                >
                  <option value="none">No Sort</option>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
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
