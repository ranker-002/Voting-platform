import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Créer une connexion avec des logs d'erreur
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'voting_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(() => console.log("✅ Connexion à la base de données réussie"))
  .catch(err => console.error("❌ Erreur de connexion MySQL :", err));

export default pool;
