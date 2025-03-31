import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Définition du type User
type User = {
  id: string;
  email: string;
  role: string;
};

const ManageUsers = () => {
  const { token } = useAuth();
  // Spécification du type d'état comme un tableau d'objets User
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', { 
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(" Token utilis  dans la requ te :", token);

        // Vérifier le format de la réponse
        console.log("API Response:", response.data); // Debugging

        // Vérifier si la réponse est un tableau ou un objet contenant users
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data && Array.isArray(response.data.users)) {
          setUsers(response.data.users); // Si l'API retourne { users: [...] }
        } else {
          throw new Error(`Invalid response format: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
       
      }
    };

    fetchUsers();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user.');
      }
    }
  };

  return (
    <motion.div className="min-h-screen pt-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="bg-black/30 p-6 rounded-xl border border-gray-800">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="p-2">ID</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700">
                  <td className="p-2">{user.id}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">
                    <button onClick={() => handleDelete(user.id)} className="text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageUsers;
