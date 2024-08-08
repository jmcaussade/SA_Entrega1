import React, { useState } from 'react';
import axios from 'axios';

const SearchBooks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/search-books', {
        params: { query: searchTerm },
      });
      if (Array.isArray(response.data)) {
        setResults(response.data);
      } else {
        setResults([]);
        setError('Unexpected response format');
      }
    } catch (error) {
      setError('Error fetching search results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search by description..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {results.map((book) => (
              <tr key={book._id}>
                <td>{book.name}</td>
                <td>{book.author}</td>
                <td>{book.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
};

export default SearchBooks;
