const nano = require('nano')('http://admin:admin@couchdb:5984');
const db = nano.use('bookstore');
const { fetchAuthors } = require('./authorsController');

const getAggregatedData = async (req, res) => {
  try {
    const authors = await fetchAuthors();
    const books = await db.list({ include_docs: true });
    const reviews = await db.list({ include_docs: true });
    const sales = await db.list({ include_docs: true });

    const bookDocs = books.rows.filter(row => row.doc.type === 'book').map(row => row.doc);
    const reviewDocs = reviews.rows.filter(row => row.doc.type === 'review').map(row => row.doc);
    const salesDocs = sales.rows.filter(row => row.doc.type === 'sale').map(row => row.doc);

    const aggregatedData = authors.map(author => {
      const authorBooks = bookDocs.filter(book => book.author === author._id);
      const numBooks = authorBooks.length;

      const authorReviews = reviewDocs.filter(review => authorBooks.some(book => book._id === review.book));
      const avgReviewScore = authorReviews.reduce((sum, review) => sum + review.score, 0) / authorReviews.length || 0;

      const authorSales = salesDocs.filter(sale => authorBooks.some(book => book._id === sale.book));
      const totalSales = authorSales.reduce((sum, sale) => sum + sale.sales, 0);

      return {
        authorName: author.name,
        numBooks,
        avgReviewScore: avgReviewScore.toFixed(2),
        totalSales
      };
    });

    res.json(aggregatedData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = { getAggregatedData };
