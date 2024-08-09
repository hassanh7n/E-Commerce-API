require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
const connectDB = require('./db/connect');
const morgan = require('morgan');
const cookieParser  = require('cookie-parser')
const fileUpload = require('express-fileupload')
const userRoutes = require('./routes/userRoutes')
const reviewRoutes = require('./routes/reviewRoutes');
const orderroutes = require('./routes/orderRoutes');
// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');



app.use(express.json());
// extra packages
app.use(morgan());
app.use(cookieParser(process.env.JWT_SECRET))
app.use(express.static('./public'));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(fileUpload());
// routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

app.get('/', (req, res) => {
  res.status(200).send("E-Commerce API")
})
app.get('/api/v1', (req, res) => {
  console.log(req.signedCookies)
  res.status(200).send("cookies Routes")
})

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/product', productRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/order', orderroutes)
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);



const port = process.env.PORT || 5000;

const start = async () => {
  try {
    // connectDB
    await connectDB(process.env.MONGO_URI);
    //await EventsSchema.create(EventsData);
    //await BlogsSchema.create(BlogsData);
    app.listen(port, () => console.log(`Server is listening port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};


start()