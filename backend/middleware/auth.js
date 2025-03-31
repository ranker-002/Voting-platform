import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

// Middleware pour l'authentification du token JWT
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log("🔍 Headers reçus :", req.headers);
    console.log("🔑 Token extrait :", token);

    if (!token) {
      logger.warn('Token absent dans la requête');
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("❌ Erreur de vérification du token :", err.name, err.message);
        logger.warn('Tentative de connexion avec un token invalide:', err.message);

        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(403).json({ message: 'Invalid token' });
      }

      console.log("✅ Token décodé :", decoded);
      req.user = decoded;
      next();
    });
  } catch (error) {
    logger.error('Erreur lors de l\'authentification:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};


// Middleware pour vérifier si l'utilisateur est admin
export const isAdmin = (req, res, next) => {  // <-- RENOMMÉ ICI
  // Vérification du rôle admin
  if (req.user.role !== 'admin') {
    logger.warn(`Tentative d'accès non autorisé par l'utilisateur ${req.user.id}`);
    return res.status(403).json({ message: 'Access forbidden: Admins only' });
  }

  // Si l'utilisateur est admin, on continue
  next();
};
