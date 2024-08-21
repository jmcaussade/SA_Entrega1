import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SaleForm = ({ fetchSales, editingSale, clearEditing }) => {
  const [book, setBook] = useState('');
  const [year, setYear] = useState('');
  const [sales, setSales] = useState('');

  useEffect(() => {
    if (editingSale) {
      setBook(editingSale.book || '');
      setYear(editingSale.year || '');
      setSales(editingSale.sales || '');
    }
  }, [editingSale]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saleData = { book, year: parseInt(year), sales: parseInt(sales) }; // Ensure year and sales are numbers

    try {
      if (editingSale) {
        await axios.put(`http://backend:5000/api/sales/${editingSale._id}`, saleData);
      } else {
        await axios.post('http://backend:5000/api/sales', saleData);
      }
      fetchSales();
      clearForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const clearForm = () => {
    setBook('');
    setYear('');
    setSales('');
    clearEditing();
  };

  return (
    <div>
      <h2>{editingSale ? 'Edit Sale' : 'Add Sale'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Book ID:
          <input
            type="text"
            value={book}
            onChange={(e) => setBook(e.target.value)}
            required
            placeholder="Enter book ID"
          />
        </label>
        <label>
          Year:
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            placeholder="Enter year"
          />
        </label>
        <label>
          Sales:
          <input
            type="number"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            required
            placeholder="Enter sales"
          />
        </label>
        <button type="submit">{editingSale ? 'Update' : 'Add'}</button>
        {editingSale && <button type="button" onClick={clearForm}>Cancel</button>}
      </form>
    </div>
  );
};

export default SaleForm;
