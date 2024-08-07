import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TopRatedBooks.css';

const TopBooksView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/top-books');
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="top-books-container">
      <h1>Top Rated Books</h1>
      <table className="top-books-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Author</th>
            <th>Average Rating</th>
            <th>Highest Rated Review</th>
            <th>Lowest Rated Review</th>
          </tr>
        </thead>
        <tbody>
          {data.map((book, index) => (
            <tr key={index}>
              <td>{index + 1}</td> {/* Numbering from 1 to 10 */}
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.avgRating.toFixed(2)}</td>
              <td>{book.highestRatedReview}</td>
              <td>{book.lowestRatedReview}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopBooksView;
