-- Create database
CREATE DATABASE IF NOT EXISTS voting_platform;
USE voting_platform;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'voter') DEFAULT 'voter',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Elections table
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
);

-- Election options table
CREATE TABLE IF NOT EXISTS election_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  election_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
);

-- Votes table
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
);

-- Indexes
CREATE INDEX idx_elections_status ON elections(status);
CREATE INDEX idx_votes_election ON votes(election_id);
CREATE INDEX idx_votes_user ON votes(user_id);

-- Create default admin user (password: admin123)
INSERT INTO users (email, password, role) VALUES 
('admin@example.com', '$2a$10$6Ybp.zHqPzgWQ.vD4vzB8.9gZKV8Tq33FhkZ9y.QMw0CwwqDJ0ZMe', 'admin');