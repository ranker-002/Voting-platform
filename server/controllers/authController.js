import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [userId, username, email, hashedPassword]
    );

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier les identifiants
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer les tokens
    const token = jwt.sign(
      { id: user.id, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Mettre à jour le refresh token dans la base de données
    await pool.query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, user.id]
    );

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token manquant' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND refresh_token = ?',
      [decoded.id, refreshToken]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Refresh token invalide' });
    }

    const user = users[0];
    const newToken = jwt.sign(
      { id: user.id, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error('Erreur lors du refresh token:', error);
    res.status(401).json({ message: 'Refresh token invalide' });
  }
};

export const me = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, is_admin FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = users[0];
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};