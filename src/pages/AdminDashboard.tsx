import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/elections');
      setElections(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des élections:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/admin/elections', formData);
      setIsCreating(false);
      setFormData({ title: '', description: '', start_date: '', end_date: '' });
      fetchElections();
    } catch (error) {
      console.error('Erreur lors de la création de l\'élection:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette élection ?')) {
      try {
        await axios.delete(`http://localhost:3000/api/admin/elections/${id}`);
        fetchElections();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">Accès non autorisé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold neon-text">Dashboard Admin</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="neural-button flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nouvelle élection</span>
          </button>
        </div>

        {isCreating && (
          <div className="mb-8 p-6 holographic-card">
            <h2 className="text-2xl font-bold mb-6 neon-text">
              Créer une nouvelle élection
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded bg-black/50 border border-[#00ff88]/30 focus:border-[#00ff88] focus:ring focus:ring-[#00ff88]/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded bg-black/50 border border-[#00ff88]/30 focus:border-[#00ff88] focus:ring focus:ring-[#00ff88]/20"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date de début</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-black/50 border border-[#00ff88]/30 focus:border-[#00ff88] focus:ring focus:ring-[#00ff88]/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date de fin</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 rounded bg-black/50 border border-[#00ff88]/30 focus:border-[#00ff88] focus:ring focus:ring-[#00ff88]/20"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded text-gray-400 hover:text-white"
                >
                  Annuler
                </button>
                <button type="submit" className="neural-button">
                  Créer l'élection
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {elections.map((election) => (
            <div
              key={election.id}
              className="p-6 holographic-card flex items-center justify-between"
            >
              <div>
                <h3 className="text-xl font-bold mb-2">{election.title}</h3>
                <p className="text-gray-400">{election.description}</p>
                <div className="mt-2 text-sm">
                  <span className="mr-4">
                    Début: {new Date(election.start_date).toLocaleDateString()}
                  </span>
                  <span>
                    Fin: {new Date(election.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex space-x-4">
                <button className="p-2 hover:text-[#00ff88]">
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(election.id)}
                  className="p-2 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};