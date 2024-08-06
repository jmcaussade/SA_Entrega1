import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BookForm from './BookForm';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const deleteBook = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/books/${id}`);
      fetchBooks();
    } catch (error) {
      setError(error.message);
    }
  };

  const editBook = (book) => {
    setEditingBook(book);
  };

  const clearEditing = () => {
    setEditingBook(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Books</h2>
      <BookForm fetchBooks={fetchBooks} editingBook={editingBook} clearEditing={clearEditing} />
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <h2>{book.name}</h2>
            <p>Summary: {book.summary}</p>
            <p>Date of Publication: {book.date_of_publication}</p>
            <p>Number of Sales: {book.number_of_sales}</p>
            <p>Author ID: {book.author}</p>
            <button onClick={() => editBook(book)}>Edit</button>
            <button onClick={() => deleteBook(book.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookList;
