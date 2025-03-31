import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import pool from '../config/database.js';
import logger from '../config/logger.js';

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'voter']
    );

    const token = jwt.sign(
      { id: result.insertId, email, role: 'voter' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      token,
      user: { id: result.insertId, email, role: 'voter' }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log("⚠️ Aucune correspondance trouvée pour cet email.");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    console.log(`🔑 Mot de passe trouvé (hashé) : ${user.password}`);

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Échec de comparaison des mots de passe.");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    logger.info(`✅ Connexion réussie pour : ${email}`);

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getProfile = async (req, res) => {
  try {
    const [user] = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email } = req.body;

    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already taken' });
    }

    await pool.query(
      'UPDATE users SET email = ? WHERE id = ?',
      [email, req.user.id]
    );

    logger.info(`User profile updated: ${req.user.id}`);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

