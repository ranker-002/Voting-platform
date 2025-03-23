
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { authRouter } from './routes/auth.js';
import { electionRouter } from './routes/elections.js';
import { voteRouter } from './routes/votes.js';
import { adminRouter } from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  points: 10, // Nombre de requêtes
  duration: 60, // Par minute
});

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => res.status(429).json({ error: 'Trop de requêtes' }));
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/elections', electionRouter);
app.use('/api/votes', authenticateToken, voteRouter);
app.use('/api/admin', authenticateToken, adminRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
