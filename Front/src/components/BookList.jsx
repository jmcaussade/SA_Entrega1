import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/books'); // Ajusta la URL según tu backend
        if (Array.isArray(response.data)) {
          setBooks(response.data);
        } else {
          throw new Error('Response data is not an array');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Books</h1>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <h2>{book.name}</h2>
            <p>Summary: {book.summary}</p>
            <p>Date of Publication: {book.date_of_publication}</p>
            <p>Number of Sales: {book.number_of_sales}</p>
            <p>Author ID: {book.author}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Books;
