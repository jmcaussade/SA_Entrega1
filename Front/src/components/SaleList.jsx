import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SaleList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sales'); // Ajusta la URL según tu backend
        if (Array.isArray(response.data)) {
          setSales(response.data);
        } else {
          throw new Error('Response data is not an array');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Sales</h1>
      <ul>
        {sales.map((sale) => (
          <li key={sale.id}>
            <h2>Book ID: {sale.book}</h2>
            <p>Year: {sale.year}</p>
            <p>Sales: {sale.sales}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SaleList;
