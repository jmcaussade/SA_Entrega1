import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReviewForm from './ReviewForm';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reviews');
      setReviews(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${id}`);
      fetchReviews();
    } catch (error) {
      setError(error.message);
    }
  };

  const editReview = (review) => {
    setEditingReview(review);
  };

  const clearEditing = () => {
    setEditingReview(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Reviews</h2>
      <ReviewForm fetchReviews={fetchReviews} editingReview={editingReview} clearEditing={clearEditing} />
      <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            <h2>Book ID: {review.book}</h2>
            <p>Review: {review.review}</p>
            <p>Score: {review.score}</p>
            <p>Number of Upvotes: {review.number_of_upvotes}</p>
            <button onClick={() => editReview(review)}>Edit</button>
            <button onClick={() => deleteReview(review._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewList;
