import React, { useState } from 'react';
import axios from 'axios';
import './SearchBooks.css';

const SearchBooks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items to display per page

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError('');
    setCurrentPage(1); // Reset to first page on new search
    try {
      const response = await axios.get('http://miapp.localhost:5000/api/search-books', {
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

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setError('');
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const displayedResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (
    <div className="search-books-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by summary..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} disabled={loading} className="search-button">
          {loading ? 'Searching...' : 'Search'}
        </button>
        {searchTerm && (
          <button onClick={handleClear} className="clear-button">
            ×
          </button>
        )}
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}
      {results.length > 0 ? (
        <>
          <table className="results-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author ID</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {displayedResults.map((book) => (
                <tr key={book._id}>
                  <td>{book.name}</td>
                  <td>{book.author}</td>
                  <td>{book.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={index + 1 === currentPage ? 'active' : ''}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
};

export default SearchBooks;
