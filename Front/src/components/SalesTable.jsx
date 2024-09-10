import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SalesTable.css'; // Import the CSS file for styling

const SalesTable = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchTopSellingBooks();
  }, []);

  const fetchTopSellingBooks = async () => {
    try {
      const response = await axios.get('http://miapp.localhost:5000/api/top-sales');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching top selling books:', error);
    }
  };

  return (
    <div>
      <h2>Top 50 Selling Books of All Time</h2>
      <table className="sales-table">
        <thead>
          <tr>
            <th>#</th> {/* Row number column */}
            <th>Book Title</th>
            <th>Total Sales (Book)</th>
            <th>Total Sales (Author)</th>
            <th>Top 5 in Year of Publication</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, index) => (
            <tr key={index}>
              <td>{index + 1}</td> {/* Row number */}
              <td>{book.name}</td>
              <td>{book.totalSalesBook}</td>
              <td>{book.totalSalesAuthor}</td>
              <td>{book.top5InYear ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
