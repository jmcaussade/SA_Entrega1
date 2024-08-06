const db = require('../db'); // Adjust the path as needed

const getAggregatedData = async (req, res) => {
  try {
    const authors = await db.view('design', 'authors', { include_docs: true });
    const books = await db.view('design', 'books', { include_docs: true });
    const reviews = await db.view('design', 'reviews', { include_docs: true });
    const sales = await db.view('design', 'sales', { include_docs: true });

    const authorData = authors.rows.map(row => row.doc);

    const aggregatedData = authorData.map(author => {
      const authorBooks = books.rows.filter(row => row.doc.author === author._id);
      const numBooks = authorBooks.length;

      const authorReviews = reviews.rows.filter(row => authorBooks.some(book => book.doc._id === row.doc.book));
      const avgReviewScore = authorReviews.reduce((sum, row) => sum + row.doc.score, 0) / authorReviews.length || 0;

      const authorSales = sales.rows.filter(row => authorBooks.some(book => book.doc._id === row.doc.book));
      const totalSales = authorSales.reduce((sum, row) => sum + row.doc.sales, 0);

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

module.exports = {
  getAggregatedData,
};
