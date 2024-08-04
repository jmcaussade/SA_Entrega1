import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reviews'); // Ajusta la URL según tu backend
        if (Array.isArray(response.data)) {
          setReviews(response.data);
        } else {
          throw new Error('Response data is not an array');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Reviews</h1>
      <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            <h2>Book ID: {review.book}</h2>
            <p>Review: {review.review}</p>
            <p>Score: {review.score}</p>
            <p>Number of Upvotes: {review.number_of_upvotes}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewList;
