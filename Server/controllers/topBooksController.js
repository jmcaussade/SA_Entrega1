const nano = require('nano')('http://admin:admin@127.0.0.1:5984');
const db = nano.use('bookstore');

// Function to fetch authors from the database
const fetchAuthors = async () => {
  const result = await db.list({ include_docs: true });
  return result.rows.filter(row => row.doc.type === 'author').map(row => row.doc);
};

// Function to get top rated books
const getTopRatedBooks = async (req, res) => {
  try {
    const booksResult = await db.list({ include_docs: true });
    const reviewsResult = await db.list({ include_docs: true });
    const authors = await fetchAuthors();

    // Log fetched authors
    console.log('Fetched Authors:', authors);

    const books = booksResult.rows.filter(row => row.doc.type === 'book').map(row => row.doc);
    const reviews = reviewsResult.rows.filter(row => row.doc.type === 'review').map(row => row.doc);

    // Map author IDs to names
    const authorMap = authors.reduce((map, author) => {
      map[author._id] = author.name;
      return map;
    }, {});

    // Log author map
    console.log('Author Map:', authorMap);

    // Calculate average rating for each book
    const booksWithAvgRating = books.map(book => {
      const bookReviews = reviews.filter(review => review.doc.book === book._id);
      const avgRating = bookReviews.reduce((acc, review) => acc + review.doc.score, 0) / bookReviews.length || 0;
      return { ...book, avgRating };
    });

    // Sort books by average rating and get top 10
    const topRatedBooks = booksWithAvgRating.sort((a, b) => b.avgRating - a.avgRating).slice(0, 10);

    // Include author names
    const topBooksWithAuthors = topRatedBooks.map(book => ({
      name: book.name,
      author: authorMap[book.author] || 'Unknown',
      avgRating: book.avgRating
    }));

    // Log top books with authors
    console.log('Top Rated Books with Authors:', topBooksWithAuthors);

    res.json(topBooksWithAuthors);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = { getTopRatedBooks };
