// controllers/userController.js
import pool from '../config/database.js';

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
    console.log('Fetching users...');
    try {
        const [users] = await pool.query('SELECT id, email, role FROM users');
        console.log('Users fetched:', users); // Ajout d'un log
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
