import React, { useState } from 'react';
import axios from 'axios';

const SearchBooks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]); // Clear results if search term is empty
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/search-books`, {
        params: { query: searchTerm },
      });
      console.log('Search results:', response.data); // Log results
      if (Array.isArray(response.data)) {
        setResults(response.data);
      } else {
        setResults([]);
        setError('Unexpected response format');
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Error fetching search results');
      setResults([]); // Clear results on error
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
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.description}</td>
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
