import pool from '../config/database.js';
import logger from '../config/logger.js';

export const getAllElections = async (req, res) => {
  try {
    const [elections] = await pool.query(`
      SELECT e.*, 
        COUNT(DISTINCT v.id) as total_votes,
        COUNT(DISTINCT v.user_id) as unique_voters
      FROM elections e
      LEFT JOIN election_options eo ON e.id = eo.election_id
      LEFT JOIN votes v ON eo.id = v.option_id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `);

    // Get options for each election
    for (let election of elections) {
      const [options] = await pool.query(
        `SELECT eo.*, COUNT(v.id) as vote_count
         FROM election_options eo
         LEFT JOIN votes v ON eo.id = v.option_id
         WHERE eo.election_id = ?
         GROUP BY eo.id`,
        [election.id]
      );
      election.options = options;
    }

    res.json(elections);
  } catch (error) {
    logger.error('Get elections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getElectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const [election] = await pool.query(
      'SELECT * FROM elections WHERE id = ?',
      [id]
    );

    if (election.length === 0) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const [options] = await pool.query(
      `SELECT eo.*, COUNT(v.id) as vote_count
       FROM election_options eo
       LEFT JOIN votes v ON eo.id = v.option_id
       WHERE eo.election_id = ?
       GROUP BY eo.id`,
      [id]
    );

    election[0].options = options;

    res.json(election[0]);
  } catch (error) {
    logger.error('Get election by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, options } = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create election
      const [result] = await connection.query(
        'INSERT INTO elections (title, description, start_date, end_date, created_by) VALUES (?, ?, ?, ?, ?)',
        [title, description, startDate, endDate, req.user.id]
      );

      // Add options
      for (const option of options) {
        await connection.query(
          'INSERT INTO election_options (election_id, title, description) VALUES (?, ?, ?)',
          [result.insertId, option.title, option.description]
        );
      }

      await connection.commit();
      logger.info(`New election created: ${title}`);
      res.status(201).json({ message: 'Election created successfully', id: result.insertId });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error('Create election error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateElectionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const [election] = await pool.query(
      'SELECT * FROM elections WHERE id = ?',
      [id]
    );

    if (election.length === 0) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Validate status transition
    const currentStatus = election[0].status;
    if (currentStatus === 'closed' && status !== 'closed') {
      return res.status(400).json({ message: 'Cannot reopen a closed election' });
    }

    await pool.query(
      'UPDATE elections SET status = ? WHERE id = ?',
      [status, id]
    );

    logger.info(`Election status updated: ${id} -> ${status}`);
    res.json({ message: 'Election status updated successfully' });
  } catch (error) {
    logger.error('Update election status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteElection = async (req, res) => {
  try {
    const { id } = req.params;

    const [election] = await pool.query(
      'SELECT * FROM elections WHERE id = ?',
      [id]
    );

    if (election.length === 0) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Only allow deletion of upcoming elections
    if (election[0].status !== 'upcoming') {
      return res.status(400).json({ message: 'Can only delete upcoming elections' });
    }

    await pool.query('DELETE FROM elections WHERE id = ?', [id]);

    logger.info(`Election deleted: ${id}`);
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    logger.error('Delete election error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};