import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Election } from '../types';
import { elections, votes } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Elections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [electionsList, setElectionsList] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      const data = await elections.getAll();
      setElectionsList(data);
      setError(null);
    } catch (err) {
      setError('Failed to load elections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Election['status']) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'closed':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const handleVote = async (electionId: string, optionId: string) => {
    try {
      await votes.cast(electionId, optionId);
      await loadElections(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cast vote');
    }
  };

  const handleStatusUpdate = async (electionId: string, status: Election['status']) => {
    if (user?.role !== 'admin') return;

    try {
      await elections.updateStatus(electionId, status);
      await loadElections();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="text-xl">Loading elections...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Elections</h1>
          <p className="text-gray-400">
            View and participate in active elections
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}
<button
  onClick={() => navigate('/vote-results')}
  className="btn-secondary mt-4"
>
  View Voting Results and History
</button>

        </div>

        <div className="grid gap-6">
          {electionsList.map((election, index) => (
            <motion.div
              key={election.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="backdrop-blur-lg bg-black/30 p-6 rounded-xl border border-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{election.title}</h2>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(election.status)}
                  <span className="capitalize">{election.status}</span>
                </div>
              </div>

              <p className="text-gray-400 mb-6">{election.description}</p>

              {user?.role === 'admin' && (
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(election.id, 'active')}
                    className="btn-secondary text-sm"
                    disabled={election.status === 'active'}
                  >
                    Set Active
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(election.id, 'closed')}
                    className="btn-secondary text-sm"
                    disabled={election.status === 'closed'}
                  >
                    Close Election
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {election.options.map(option => (
                  <div
                    key={option.id}
                    className="p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                    <p className="text-gray-400 mb-4">{option.description}</p>
                    {election.status === 'active' && (
                      <button
                        onClick={() => handleVote(election.id, option.id)}
                        className="btn-primary w-full"
                      >
                        Vote
                      </button>
                    )}
                    {election.status === 'closed' && (
                      <div className="text-center">
                        <span className="text-lg font-bold">{option.voteCount}</span>
                        <span className="text-gray-400"> votes</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Elections;
