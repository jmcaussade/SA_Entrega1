import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BookForm from './BookForm';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://miapp.localhost:5000/api/books');
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('http://miapp.localhost:5000/api/authors');
      const authorsData = response.data;
      // Create a mapping from author ID to author name
      const authorsMap = authorsData.reduce((acc, author) => {
        acc[author._id] = author.name;
        return acc;
      }, {});
      setAuthors(authorsMap);
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteBook = async (id) => {
    try {
      await axios.delete(`http://miapp.localhost:5000/api/books/${id}`);
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
          <li key={book._id}>
            <h2>{book.name}</h2>
            <p>Summary: {book.summary}</p>
            <p>Date of Publication: {book.date_of_publication}</p>
            <p>Number of Sales: {book.number_of_sales}</p>
            <p>Author Name: {authors[book.author] || 'Unknown'}</p>
            <p>Author ID: {book.author}</p>
            <button onClick={() => editBook(book)}>Edit</button>
            <button onClick={() => deleteBook(book._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookList;
