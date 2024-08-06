import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AggregatedDataView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/aggregated-data');
        console.log('API response:', response.data); // Log the API response for debugging
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          throw new Error('API response is not an array');
        }
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
    <div>
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
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item.authorName}</td>
                <td>{item.numBooks}</td>
                <td>{item.avgReviewScore}</td>
                <td>{item.totalSales}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AggregatedDataView;
