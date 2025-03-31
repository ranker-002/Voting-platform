
import { motion } from 'framer-motion';
import { Vote, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-16"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Secure Online Voting Platform
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Experience democracy in the digital age with our secure, transparent, and easy-to-use voting platform.
            </p>
            {!user && (
              <div className="flex justify-center gap-4">
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary"
                >
                  Login
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="feature-card"
          >
            <Vote className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Voting</h3>
            <p className="text-gray-400">
              State-of-the-art encryption and security measures to ensure your vote remains private and tamper-proof.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="feature-card"
          >
            <Shield className="h-12 w-12 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Transparent Process</h3>
            <p className="text-gray-400">
              Full visibility into the voting process while maintaining voter privacy and election integrity.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="feature-card"
          >
            <Users className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy Participation</h3>
            <p className="text-gray-400">
              Simple and intuitive interface that makes participating in elections accessible to everyone.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;