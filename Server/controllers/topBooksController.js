const nano = require('nano')('http://admin:admin@127.0.0.1:5984');
const db = nano.use('bookstore');

const getTopRatedBooks = async (req, res) => {
  try {
    const booksResult = await db.list({ include_docs: true });
    const reviewsResult = await db.list({ include_docs: true });

    const books = booksResult.rows.filter(row => row.doc.type === 'book').map(row => row.doc);
    const reviews = reviewsResult.rows.filter(row => row.doc.type === 'review').map(row => row.doc);

    // Calculate average rating for each book
    const booksWithAvgRating = books.map(book => {
      const bookReviews = reviews.filter(review => review.book === book._id);
      const avgRating = bookReviews.reduce((acc, review) => acc + review.score, 0) / bookReviews.length || 0;
      return { ...book, avgRating, reviews: bookReviews };
    });

    // Sort books by average rating and get top 10
    const topRatedBooks = booksWithAvgRating.sort((a, b) => b.avgRating - a.avgRating).slice(0, 10);

    // Find highest and lowest rated reviews for each book
    const topBooksWithReviews = topRatedBooks.map(book => {
      const highestRatedReview = book.reviews.reduce((max, review) => max.upvotes > review.upvotes ? max : review, book.reviews[0]);
      const lowestRatedReview = book.reviews.reduce((min, review) => min.upvotes < review.upvotes ? min : review, book.reviews[0]);
      return { ...book, highestRatedReview, lowestRatedReview };
    });

    res.json(topBooksWithReviews);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = { getTopRatedBooks };
