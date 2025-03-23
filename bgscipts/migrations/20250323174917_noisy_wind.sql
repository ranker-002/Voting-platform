/*
# Base de données pour l'application de vote

1. Tables principales
   - `users` : Stockage des utilisateurs et administrateurs
   - `elections` : Gestion des différentes élections
   - `candidates` : Liste des candidats par élection
   - `votes` : Enregistrement des votes
   - `vote_logs` : Journal d'audit des votes pour la sécurité

2. Sécurité
   - Champs pour le stockage sécurisé des mots de passe (hachage)
   - Journalisation des actions importantes
   - Contraintes d'intégrité référentielle
*/

-- Suppression des tables si elles existent déjà
DROP TABLE IF EXISTS vote_logs;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS elections;
DROP TABLE IF EXISTS users;

-- Table des utilisateurs
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    refresh_token VARCHAR(255),
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des élections
CREATE TABLE elections (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des candidats
CREATE TABLE candidates (
    id VARCHAR(36) PRIMARY KEY,
    election_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    photo_url VARCHAR(255),
    program_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    INDEX idx_election (election_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des votes
CREATE TABLE votes (
    id VARCHAR(36) PRIMARY KEY,
    election_id VARCHAR(36) NOT NULL,
    voter_id VARCHAR(36) NOT NULL,
    candidate_id VARCHAR(36) NOT NULL,
    vote_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vote_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (election_id) REFERENCES elections(id),
    FOREIGN KEY (voter_id) REFERENCES users(id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    UNIQUE KEY unique_vote (election_id, voter_id),
    INDEX idx_election_timestamp (election_id, vote_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de journalisation des votes (audit)
CREATE TABLE vote_logs (
    id VARCHAR(36) PRIMARY KEY,
    vote_id VARCHAR(36) NOT NULL,
    action_type ENUM('created', 'verified', 'error') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSON,
    FOREIGN KEY (vote_id) REFERENCES votes(id),
    INDEX idx_vote (vote_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Procédure stockée pour vérifier l'éligibilité au vote
DELIMITER //
CREATE PROCEDURE check_vote_eligibility(
    IN p_user_id VARCHAR(36),
    IN p_election_id VARCHAR(36),
    OUT p_is_eligible BOOLEAN
)
BEGIN
    DECLARE has_voted INT;
    DECLARE election_active BOOLEAN;
    
    -- Vérifier si l'élection est active
    SELECT COUNT(*) INTO election_active
    FROM elections
    WHERE id = p_election_id
    AND status = 'active'
    AND CURRENT_TIMESTAMP BETWEEN start_date AND end_date;
    
    -- Vérifier si l'utilisateur a déjà voté
    SELECT COUNT(*) INTO has_voted
    FROM votes
    WHERE voter_id = p_user_id
    AND election_id = p_election_id;
    
    -- Définir l'éligibilité
    SET p_is_eligible = (election_active = 1 AND has_voted = 0);
END //
DELIMITER ;

-- Trigger pour mettre à jour le timestamp de dernière connexion
DELIMITER //
CREATE TRIGGER update_last_login
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.refresh_token != OLD.refresh_token THEN
        SET NEW.last_login = CURRENT_TIMESTAMP;
    END IF;
END //
DELIMITER ;

-- Index pour optimiser les requêtes fréquentes
CREATE INDEX idx_election_status ON elections(status, start_date, end_date);
CREATE INDEX idx_vote_counts ON votes(election_id, candidate_id);