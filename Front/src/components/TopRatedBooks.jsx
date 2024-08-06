import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TopRatedBooks = () => {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Top 10 Rated Books</h1>
      <table>
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
            <tr key={book._id}>
              <td>{index + 1}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.avgRating.toFixed(2)}</td>
              <td>
                <div>
                  <p>{book.highestRatedReview.content}</p>
                  <p>Upvotes: {book.highestRatedReview.upvotes}</p>
                </div>
              </td>
              <td>
                <div>
                  <p>{book.lowestRatedReview.content}</p>
                  <p>Upvotes: {book.lowestRatedReview.upvotes}</p>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopRatedBooks;
