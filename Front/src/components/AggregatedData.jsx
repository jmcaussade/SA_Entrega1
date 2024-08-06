import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AggregatedData.css';

const AggregatedDataView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="table-container">
      <h1>Aggregated Author Data</h1>
      <table>
        <thead>
          <tr>
            <th>Author</th>
            <th>Number of Published Books</th>
            <th>Average Review Score</th>
            <th>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
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
