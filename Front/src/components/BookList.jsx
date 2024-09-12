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
      console.log('Books fetched:', response.data); // Log the fetched books
    } catch (error) {
      setError(error.message);
      setLoading(false);
      console.error('Error fetching books:', error); // Log the error
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('http://miapp.localhost:5000/api/authors');
      const authorsMap = response.data.reduce((acc, author) => {
        acc[author._id] = author.name;
        return acc;
      }, {});
      setAuthors(authorsMap);
      console.log('Authors fetched:', authorsMap); // Log the fetched authors
    } catch (error) {
      setError(error.message);
      console.error('Error fetching authors:', error); // Log the error
    }
  };

  const deleteBook = async (id) => {
    console.log('Deleting book with ID:', id); // Log the ID of the book being deleted
    try {
      await axios.delete(`http://miapp.localhost:5000/api/books/${id}`);
      console.log('Book deleted successfully');
      fetchBooks(); // Refresh the list of books
    } catch (error) {
      console.error('Error deleting book:', error);
      setError(error.message);
    }
  };

  const editBook = (book) => {
    console.log('Editing book:', book); // Log the book being edited
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
            <p>Author: {authors[book.author]}</p>
            <p>Book ID:{book._id}</p>
            <button onClick={() => editBook(book)}>Edit</button>
            <button onClick={() => {
              console.log('Book ID from front:', book._id); // Log the book ID
              deleteBook(book._id);
            }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookList;