import pool from '../config/database.js';
import logger from '../config/logger.js';

export const castVote = async (req, res) => {
  try {
    const { electionId, optionId } = req.body;
    const userId = req.user.id;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if election exists and is active
      const [elections] = await connection.query(
        'SELECT status, start_date, end_date FROM elections WHERE id = ?',
        [electionId]
      );

      if (elections.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Election not found' });
      }

      const election = elections[0];
      const now = new Date();

      if (election.status !== 'active') {
        await connection.rollback();
        return res.status(400).json({ message: 'Election is not active' });
      }

      if (now < new Date(election.start_date) || now > new Date(election.end_date)) {
        await connection.rollback();
        return res.status(400).json({ message: 'Election is not within voting period' });
      }

      // Check if option exists and belongs to the election
      const [options] = await connection.query(
        'SELECT * FROM election_options WHERE id = ? AND election_id = ?',
        [optionId, electionId]
      );

      if (options.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Invalid option' });
      }

      // Check if user has already voted
      const [existingVotes] = await connection.query(
        'SELECT * FROM votes WHERE election_id = ? AND user_id = ?',
        [electionId, userId]
      );

      if (existingVotes.length > 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Already voted in this election' });
      }

      // Cast vote
      await connection.query(
        'INSERT INTO votes (election_id, option_id, user_id) VALUES (?, ?, ?)',
        [electionId, optionId, userId]
      );

      await connection.commit();
      logger.info(`Vote cast: Election ${electionId}, User ${userId}`);
      res.status(201).json({ message: 'Vote cast successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error('Cast vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Verify election exists
    const [election] = await pool.query(
      'SELECT * FROM elections WHERE id = ?',
      [electionId]
    );

    if (election.length === 0) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Only show results if election is closed or user is admin
    if (election[0].status !== 'closed' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Results are not available yet' });
    }

    const [results] = await pool.query(`
      SELECT 
        eo.id,
        eo.title,
        eo.description,
        COUNT(v.id) as vote_count,
        (COUNT(v.id) * 100.0 / NULLIF((
          SELECT COUNT(*) FROM votes 
          WHERE election_id = ?
        ), 0)) as percentage
      FROM election_options eo
      LEFT JOIN votes v ON eo.id = v.option_id
      WHERE eo.election_id = ?
      GROUP BY eo.id
      ORDER BY vote_count DESC
    `, [electionId, electionId]);

    // Get total votes
    const [totalVotes] = await pool.query(
      'SELECT COUNT(DISTINCT user_id) as total_voters FROM votes WHERE election_id = ?',
      [electionId]
    );

    res.json({
      results,
      totalVoters: totalVotes[0].total_voters,
      status: election[0].status
    });
  } catch (error) {
    logger.error('Get election results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserVotingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const [history] = await pool.query(`
      SELECT 
        e.id as election_id,
        e.title as election_title,
        e.status,
        eo.title as voted_option,
        v.created_at as vote_date
      FROM votes v
      JOIN elections e ON v.election_id = e.id
      JOIN election_options eo ON v.option_id = eo.id
      WHERE v.user_id = ?
      ORDER BY v.created_at DESC
    `, [userId]);

    res.json(history);
  } catch (error) {
    logger.error('Get user voting history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};