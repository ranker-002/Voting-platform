export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Non autorisé'
    });
  }

  res.status(500).json({
    message: 'Erreur serveur interne'
  });
};