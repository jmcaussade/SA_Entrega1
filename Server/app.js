const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const booksRouter = require('./routes/books');
const authorsRouter = require('./routes/authors');
const reviewsRouter = require('./routes/reviews');
const salesRouter = require('./routes/sales');

app.use(cors());
app.use(bodyParser.json());
app.use('/api/books', booksRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/sales', salesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
