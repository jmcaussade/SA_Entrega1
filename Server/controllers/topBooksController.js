const nano = require('nano')('http://admin:admin@couchdb:5984');
const db = nano.use('bookstore');

const getTopRatedBooks = async (redisClient, req, res) => {
  console.log('Inside getTopRatedBooks controller');
  try {
    console.log("Retrieving data...");

    const useCache = process.env.USE_CACHE === 'true';
    const cacheKey = 'topRatedBooks';

    if (useCache) {
      console.log('Attempting to fetch from cache');
      const cachedData = await redisClient.get(cacheKey);
      console.log('cachedData:', cachedData);

      if (cachedData) {
        console.log('Fetching top-rated books from cache');
        return res.json(JSON.parse(cachedData));
      } else {
        console.log('Cache miss. Fetching top-rated books from database');
      }
    } else {
      console.log("Fetching top-rated books from database (cache disabled)");
    }

    const books = await db.list({ include_docs: true });
    const reviews = await db.list({ include_docs: true });
    const authors = await db.list({ include_docs: true });

    const bookDocs = books.rows.filter(row => row.doc.type === 'book').map(row => row.doc);
    const reviewDocs = reviews.rows.filter(row => row.doc.type === 'review').map(row => row.doc);
    const authorDocs = authors.rows.filter(row => row.doc.type === 'author').map(row => row.doc);

    // console.log('Books Documents:', bookDocs);
    // console.log('Reviews Documents:', reviewDocs);
    // console.log('Authors Documents:', authorDocs);

    // Create an author map
    const authorsMap = authorDocs.reduce((map, author) => {
      map[author._id] = author.name;
      return map;
    }, {});

    // console.log('Authors Map:', authorsMap);

    // Group reviews by book ID
    const reviewsByBook = reviewDocs.reduce((acc, review) => {
      if (!acc[review.book]) {
        acc[review.book] = [];
      }
      acc[review.book].push(review);
      return acc;
    }, {});

    // console.log('Reviews By Book:', reviewsByBook);

    // Process books and calculate average ratings
    const booksWithRatings = bookDocs.map(book => {
      const bookReviews = reviewsByBook[book._id] || [];

      // Find highest and lowest upvoted reviews
      const highestRatedReview = bookReviews.reduce((max, review) => 
        (review.number_of_upvotes > (max.number_of_upvotes || 0) ? review : max), {}
      );
      const lowestRatedReview = bookReviews.reduce((min, review) => 
        (review.number_of_upvotes < (min.number_of_upvotes || Infinity) ? review : min), {}
      );

      return {
        title: book.name,
        author: authorsMap[book.author] || 'Unknown',
        avgRating: calculateAvgRating(book._id, reviewsByBook),
        highestRatedReview: highestRatedReview.review || 'No review available',
        lowestRatedReview: lowestRatedReview.review || 'No review available'
      };
    });

    // Sort books by average rating in descending order and get top 10
    const topBooks = booksWithRatings
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);

    // console.log('Top 10 Books:', topBooks);

    if (useCache) {
      console.log('Storing top-rated books in cache');
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(topBooks)); // Cache for 1 hour
    }

    res.json(topBooks);
  } catch (err) {
    console.error('Error in getTopRatedBooks:', err);
    res.status(500).send('Server error');
  }
};


// Function to calculate average rating for a book
const calculateAvgRating = (bookId, reviewsByBook) => {
  const reviews = reviewsByBook[bookId] || [];
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, review) => sum + review.score, 0);
  return total / reviews.length;
};

module.exports = { getTopRatedBooks };
