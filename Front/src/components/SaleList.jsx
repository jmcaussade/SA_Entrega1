import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SaleForm from './SaleForm';

const SaleList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSale, setEditingSale] = useState(null);

  const fetchSales = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sales');
      setSales(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const deleteSale = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/sales/${id}`);
      fetchSales();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Sales</h1>
      <SaleForm fetchSales={fetchSales} editingSale={editingSale} clearEditing={() => setEditingSale(null)} />
      <ul>
        {sales.map((sale) => (
          <li key={sale._id}>
            <h2>Book ID: {sale.book}</h2>
            <p>Year: {sale.year}</p>
            <p>Sales: {sale.sales}</p>
            <button onClick={() => setEditingSale(sale)}>Edit</button>
            <button onClick={() => deleteSale(sale._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SaleList;
