import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/elections');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 p-8 holographic-card">
        <div>
          <h2 className="text-3xl font-bold text-center mb-8 neon-text">
            Connexion
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-black/50 border border-[#00ff88]/30 focus:border-[#00ff88] focus:ring focus:ring-[#00ff88]/20 transition"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-black/50 border border-[#00ff88]/30 focus:border-[#00ff88] focus:ring focus:ring-[#00ff88]/20 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full neural-button flex items-center justify-center space-x-2"
          >
            <LogIn className="h-5 w-5" />
            <span>Se connecter</span>
          </button>
        </form>
      </div>
    </div>
  );
};