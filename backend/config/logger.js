import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // Par défaut, enregistrement à partir du niveau 'info'
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ]
});

if (process.env.NODE_ENV !== 'production') {
  // Log en console en mode développement
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
  // Ajouter un transport 'debug' en mode développement
  logger.add(new winston.transports.Console({
    level: 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;
