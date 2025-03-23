import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const castVote = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const voterId = req.user.id;

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Vérifier si l'utilisateur a déjà voté
    const [existingVotes] = await connection.query(
      'SELECT * FROM votes WHERE election_id = ? AND voter_id = ?',
      [electionId, voterId]
    );

    if (existingVotes.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Vous avez déjà voté pour cette élection' });
    }

    // Vérifier si l'élection est active
    const [elections] = await connection.query(
      'SELECT * FROM elections WHERE id = ? AND status = "active" AND NOW() BETWEEN start_date AND end_date',
      [electionId]
    );

    if (elections.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Cette élection n\'est pas active' });
    }

    // Créer le hash du vote
    const voteHash = crypto
      .createHash('sha256')
      .update(`${voterId}${electionId}${candidateId}${Date.now()}`)
      .digest('hex');

    // Enregistrer le vote
    const voteId = uuidv4();
    await connection.query(
      'INSERT INTO votes (id, election_id, voter_id, candidate_id, vote_hash) VALUES (?, ?, ?, ?, ?)',
      [voteId, electionId, voterId, candidateId, voteHash]
    );

    // Enregistrer le log
    await connection.query(
      'INSERT INTO vote_logs (id, vote_id, action_type, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), voteId, 'created', req.ip, req.headers['user-agent']]
    );

    await connection.commit();
    res.status(201).json({ message: 'Vote enregistré avec succès' });
  } catch (error) {
    await connection.rollback();
    console.error('Erreur lors de l\'enregistrement du vote:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    connection.release();
  }
};

export const getVoteResults = async (req, res) => {
  const { electionId } = req.params;

  try {
    const [results] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        COUNT(v.id) as vote_count
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id
      WHERE c.election_id = ?
      GROUP BY c.id, c.name
      ORDER BY vote_count DESC
    `, [electionId]);

    res.json(results);
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};