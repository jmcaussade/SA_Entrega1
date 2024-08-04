import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AuthorList = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/authors'); // Ajusta la URL según tu backend
        if (Array.isArray(response.data)) {
          setAuthors(response.data);
        } else {
          throw new Error('Response data is not an array');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Authors</h1>
      <ul>
        {authors.map((author) => (
          <li key={author.id}>
            <h2>{author.name}</h2>
            <p>Date of Birth: {author.date_of_birth}</p>
            <p>Country: {author.country_of_origin}</p>
            <p>Description: {author.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuthorList;
