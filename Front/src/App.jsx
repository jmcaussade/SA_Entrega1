import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Authors from './pages/Authors';
import Books from './pages/Books';
import Reviews from './pages/Reviews';
import Sales from './pages/Sales';
import AggregatedData from './pages/AggregatedData';
import TopRatedBooks from './pages/TopRatedBooks';
import './index.css';

const App = () => {
  return (
    <Router>
      <div>
        <h1>Book Review App</h1>
        <header>
          <nav>
            <ul>
              <li><Link to="/authors">Authors</Link></li>
              <li><Link to="/books">Books</Link></li>
              <li><Link to="/reviews">Reviews</Link></li>
              <li><Link to="/sales">Sales</Link></li>
              <li><Link to="/aggregated-data">Aggregated Data</Link></li>
              <li><Link to="/top-rated-books">Top Rated Books</Link></li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/authors" element={<Authors />} />
            <Route path="/books" element={<Books />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/aggregated-data" element={<AggregatedData />} />
            <Route path="/top-rated-books" element={<TopRatedBooks />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
