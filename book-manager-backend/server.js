const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
require('dotenv').config();

// 라우터 import 추가
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const userBooksRoutes = require('./routes/user-books');
const reviewRoutes = require('./routes/reviews');
const statsRouter = require("./routes/stats");

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 라우터 연결
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/user-books', userBooksRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRouter);

app.use(notFoundHandler);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Book Manager API Server is running!' });
});

app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});