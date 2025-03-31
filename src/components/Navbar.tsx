
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Vote, LogOut, UserCircle, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="backdrop-blur-lg bg-black/30 border-b border-gray-800 fixed w-full z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Vote className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">Vote Plaform</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="nav-link">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            
            {user ? (
              <>
                <Link to="/elections" className="nav-link">
                  <Vote className="h-5 w-5" />
                  <span>Elections</span>
                </Link>
                
                <Link to="/dashboard" className="nav-link">
                  <UserCircle className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="nav-link text-red-400 hover:text-red-300"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;