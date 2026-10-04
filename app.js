import express from 'express';
import { configDotenv } from 'dotenv';
import morgan from 'morgan';
import bootcamp from './routes/bootcamp.route.js';
import courses from './routes/courses.route.js';
import auth from './routes/auth.routes.js';
import admin from './routes/user.routes.js';
import reviews from './routes/reviews.route.js';
import connectDB from './config/db.bootcamp.js';
import customErrorHandler from './middleware/customErrorHandler.js';
import fileUpload from 'express-fileupload';
import path from 'path';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import dayjs from 'dayjs';

configDotenv({ path: './config/config.env' });
const PORT = process.env.PORT || 5000;

const app = express();

// Body parser middleware.
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());

// prevent Cross-site scripting text
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1,
});

app.use(limiter);

// Prevent http paramter pollution
app.use(hpp());

app.use(express.static(path.join(import.meta.dirname, 'images')));
app.set('query parser', 'extended');
app.use(fileUpload());
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// router middleware
app.use('/api/v1/bootcamps', bootcamp);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', admin);
app.use('/api/v1/reviews', reviews);

app.use(customErrorHandler);

// Connect env to atlas.
connectDB();

const server = app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} and on port: 
    ${PORT}; visit http://localhost:${PORT}`,
  ),
);

process.on('unhandledRejection', (error, promise) => {
  console.log(`ERROR: ${error.message}`);
  server.close(() => {
    process.exit(1);
  });
});
