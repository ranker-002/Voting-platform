import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    // Create connection without database selected
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'voter') DEFAULT 'voter',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create elections table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS elections (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status ENUM('upcoming', 'active', 'closed') DEFAULT 'upcoming',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create election options table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS election_options (
        id INT PRIMARY KEY AUTO_INCREMENT,
        election_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
      )
    `);

    // Create votes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        election_id INT NOT NULL,
        option_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
        FOREIGN KEY (option_id) REFERENCES election_options(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_vote (election_id, user_id)
      )
    `);

    // Create indexes
    await connection.query('CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id)');

    // Create default admin user if not exists
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await connection.query(`
      INSERT IGNORE INTO users (email, password, role) 
      VALUES (?, ?, 'admin')
    `, ['admin@example.com', hashedPassword]);

    console.log('Database initialized successfully');
    await connection.end();
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();