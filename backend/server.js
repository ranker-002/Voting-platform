import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import electionRoutes from './routes/elections.js';
import voteRoutes from './routes/votes.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './config/logger.js';
import pool from './config/database.js';
import userRoutes from './routes/usersRoutes.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging requests with Morgan
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check endpoint hit');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/users', (req, res, next) => {
  console.log(`API /api/users hit with method: ${req.method}`);
  next();
}, userRoutes);



// Error handling
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
pool.getConnection()
  .then(connection => {
    logger.info('Database connected successfully');
    connection.release();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    logger.error('Database connection failed:', error);
    process.exit(1);
  });

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

export default app;
