import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log des détails de l'erreur
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: res.statusCode // Ajout du code de statut de la réponse
  });

  // Gestion des erreurs de validation
  if (err.name === 'ValidationError' || err.name === 'express-validator') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors || err.array()
    });
  }

  // Gestion des erreurs liées aux JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }

  // Gestion des erreurs de base de données
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      message: 'Duplicate entry found'
    });
  }

  // Gestion d'autres erreurs connues
  if (err.status) {
    return res.status(err.status).json({
      message: err.message
    });
  }

  // Réponse par défaut pour les erreurs internes
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
