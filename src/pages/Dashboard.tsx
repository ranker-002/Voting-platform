
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { BarChart, Users, Vote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Elections',
      value: '12',
      icon: Vote,
      color: 'text-blue-500',
    },
    {
      title: 'Active Voters',
      value: '1,234',
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Votes Cast',
      value: '5,678',
      icon: BarChart,
      color: 'text-purple-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.email}</h1>
          <p className="text-gray-400">
            Here's an overview of your voting platform activity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="backdrop-blur-lg bg-black/30 p-6 rounded-xl border border-gray-800"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-3xl font-bold">{stat.value}</span>
              </div>
              <h3 className="text-lg font-medium text-gray-300">{stat.title}</h3>
            </motion.div>
          ))}
        </div>

        {user?.role === 'admin' && (
          <div className="backdrop-blur-lg bg-black/30 p-6 rounded-xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Admin Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button 
                className="btn-primary" 
                onClick={() => navigate('/admin/create-election')}
              >
                Create New Election
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => navigate('/admin/manage-users')}
              >
                Manage Users
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
