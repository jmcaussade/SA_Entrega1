import React, { useEffect, useState } from 'react';
import AuthorForm from './AuthorForm';

const AuthorList = () => {
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState(null);
  const [editingAuthor, setEditingAuthor] = useState(null);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await fetch('http://backend:5000/api/authors');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      setError(error);
    }
  };

  const deleteAuthor = async (id) => {
    try {
      await fetch(`http://backend:5000/api/authors/${id}`, {
        method: 'DELETE',
      });
      fetchAuthors();
    } catch (error) {
      setError(error);
    }
  };

  const editAuthor = (author) => {
    setEditingAuthor(author);
  };

  const clearEditing = () => {
    setEditingAuthor(null);
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Authors</h2>
      <AuthorForm fetchAuthors={fetchAuthors} editingAuthor={editingAuthor} clearEditing={clearEditing} />
      <ul>
        {authors.map((author) => (
          <li key={author._id}>
            {author.name}
            <button onClick={() => editAuthor(author)}>Edit</button>
            <button onClick={() => deleteAuthor(author._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuthorList;
