import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Vote, Home, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Vote className="h-8 w-8 text-[#00ff88]" />
                <span className="text-xl font-bold neon-text">VoteSystem</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="neural-button flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Accueil</span>
              </Link>
              
              <Link to="/elections" className="neural-button flex items-center space-x-2">
                <Vote className="h-4 w-4" />
                <span>Élections</span>
              </Link>

              {user ? (
                <>
                  {user.isAdmin && (
                    <Link to="/admin" className="neural-button flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="neural-button flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="neural-button flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Connexion</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};