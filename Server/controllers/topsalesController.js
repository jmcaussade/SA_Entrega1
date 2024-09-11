const nano = require('nano')('http://admin:admin@localhost:5984');
const db = nano.use('bookstore');

const getTopSellingBooks = async (req, res) => {
  try {
    // Fetch all books and sales
    const booksResult = await db.list({ include_docs: true });
    const salesResult = await db.list({ include_docs: true });

    const books = booksResult.rows.filter(row => row.doc.type === 'book').map(row => row.doc);
    const sales = salesResult.rows.filter(row => row.doc.type === 'sale').map(row => row.doc);

    // Calculate total sales for each book
    const bookSales = books.map(book => {
      const bookSales = sales.filter(sale => sale.book === book._id);
      const totalSalesBook = bookSales.reduce((sum, sale) => sum + sale.sales, 0);

      return {
        ...book,
        totalSalesBook
      };
    });

    // Sort books by total sales and get top 50
    const top50Books = bookSales.sort((a, b) => b.totalSalesBook - a.totalSalesBook).slice(0, 50);

    // Calculate total sales for each author
    const top50BooksWithAuthorSales = top50Books.map(book => {
      const authorBooks = top50Books.filter(b => b.author === book.author);
      const totalSalesAuthor = authorBooks.reduce((sum, b) => sum + b.totalSalesBook, 0);

      // Determine if the book was in the top 5 selling books of its publication year
      const booksByYear = top50Books.filter(b => b.publicationYear === book.publicationYear);
      const top5ByYear = booksByYear.sort((a, b) => b.totalSalesBook - a.totalSalesBook).slice(0, 5);
      const top5InYear = top5ByYear.some(b => b._id === book._id);

      return {
        ...book,
        totalSalesAuthor,
        top5InYear
      };
    });

    res.json(top50BooksWithAuthorSales);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = { getTopSellingBooks };
