import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getAllElections = async (req, res) => {
  try {
    const [elections] = await pool.query(
      'SELECT * FROM elections WHERE status = "active" ORDER BY start_date DESC'
    );
    res.json(elections);
  } catch (error) {
    console.error('Erreur lors de la récupération des élections:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getElectionById = async (req, res) => {
  try {
    const [elections] = await pool.query(
      'SELECT * FROM elections WHERE id = ?',
      [req.params.id]
    );

    if (elections.length === 0) {
      return res.status(404).json({ message: 'Élection non trouvée' });
    }

    res.json(elections[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'élection:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createElection = async (req, res) => {
  const { title, description, start_date, end_date } = req.body;

  try {
    const electionId = uuidv4();
    await pool.query(
      'INSERT INTO elections (id, title, description, start_date, end_date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [electionId, title, description, start_date, end_date, req.user.id]
    );

    res.status(201).json({ message: 'Élection créée avec succès', id: electionId });
  } catch (error) {
    console.error('Erreur lors de la création de l\'élection:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateElection = async (req, res) => {
  const { title, description, start_date, end_date, status } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE elections SET title = ?, description = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
      [title, description, start_date, end_date, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Élection non trouvée' });
    }

    res.json({ message: 'Élection mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'élection:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteElection = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM elections WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Élection non trouvée' });
    }

    res.json({ message: 'Élection supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'élection:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getCandidates = async (req, res) => {
  try {
    const [candidates] = await pool.query(
      'SELECT * FROM candidates WHERE election_id = ?',
      [req.params.id]
    );
    res.json(candidates);
  } catch (error) {
    console.error('Erreur lors de la récupération des candidats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};