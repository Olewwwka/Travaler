import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/database';
import { environment } from './config/environment';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import pointsRoutes from './routes/points.routes';
import reviewsRoutes from './routes/reviews.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/reviews', reviewsRoutes);

// Error handling
app.use(errorMiddleware);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(environment.port, () => {
      console.log(`Server is running on port ${environment.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 