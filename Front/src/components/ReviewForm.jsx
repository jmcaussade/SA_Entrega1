import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewForm = ({ fetchReviews, editingReview, clearEditing }) => {
  const [book, setBook] = useState('');
  const [review, setReview] = useState('');
  const [score, setScore] = useState('');
  const [numberOfUpvotes, setNumberOfUpvotes] = useState('');

  useEffect(() => {
    if (editingReview) {
      setBook(editingReview.book);
      setReview(editingReview.review);
      setScore(editingReview.score);
      setNumberOfUpvotes(editingReview.number_of_upvotes);
    }
  }, [editingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reviewData = { book, review, score, number_of_upvotes: numberOfUpvotes };

    try {
      if (editingReview) {
        await axios.put(`http://miapp.localhost:5000/api/reviews/${editingReview._id}`, reviewData);
      } else {
        await axios.post('http://miapp.localhost:5000/api/reviews', reviewData);
      }
      fetchReviews();
      clearForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const clearForm = () => {
    setBook('');
    setReview('');
    setScore('');
    setNumberOfUpvotes('');
    clearEditing();
  };

  return (
    <div>
      <h2>{editingReview ? 'Edit Review' : 'Add Review'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Book ID:
          <input
            type="text"
            value={book}
            onChange={(e) => setBook(e.target.value)}
            required
          />
        </label>
        <label>
          Review:
          <input
            type="text"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
          />
        </label>
        <label>
          Score:
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
          />
        </label>
        <label>
          Number of Upvotes:
          <input
            type="number"
            value={numberOfUpvotes}
            onChange={(e) => setNumberOfUpvotes(e.target.value)}
            required
          />
        </label>
        <button type="submit">{editingReview ? 'Update' : 'Add'}</button>
        {editingReview && <button type="button" onClick={clearForm}>Cancel</button>}
      </form>
    </div>
  );
};

export default ReviewForm;
