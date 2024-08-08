import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookForm = ({ fetchBooks, editingBook, clearEditing }) => {
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [dateOfPublication, setDateOfPublication] = useState('');
  const [numberOfSales, setNumberOfSales] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    if (editingBook) {
      setName(editingBook.name);
      setSummary(editingBook.summary);
      setDateOfPublication(editingBook.date_of_publication);
      setNumberOfSales(editingBook.number_of_sales);
      setAuthor(editingBook.author);
    }
  }, [editingBook]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bookData = { name, summary, date_of_publication: dateOfPublication, number_of_sales: numberOfSales, author };
  
    try {
      if (editingBook) {
        // Usa `_id` en lugar de `id` si tu backend espera `_id`
        await axios.put(`http://localhost:5000/api/books/${editingBook._id}`, bookData);
      } else {
        await axios.post('http://localhost:5000/api/books', bookData);
      }
      fetchBooks();
      clearForm();
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  const clearForm = () => {
    setName('');
    setSummary('');
    setDateOfPublication('');
    setNumberOfSales('');
    setAuthor('');
    clearEditing();
  };

  return (
    <div>
      <h2>{editingBook ? 'Edit Book' : 'Add Book'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Summary:
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </label>
        <label>
          Date of Publication:
          <input
            type="date"
            value={dateOfPublication}
            onChange={(e) => setDateOfPublication(e.target.value)}
            required
          />
        </label>
        <label>
          Number of Sales:
          <input
            type="number"
            value={numberOfSales}
            onChange={(e) => setNumberOfSales(e.target.value)}
            required
          />
        </label>
        <label>
          Author ID:
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </label>
        <button type="submit">{editingBook ? 'Update' : 'Add'}</button>
        {editingBook && <button type="button" onClick={clearForm}>Cancel</button>}
      </form>
    </div>
  );
};

export default BookForm;
