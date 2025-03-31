
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Elections from './pages/Elections';
import CreateElections from './pages/CreateElections';
import ManageUsers from './pages/ManageUsers';
import VoteResultsHistory from './pages/VoteResultsHistory'; // Nouveau composant pour les résultats et l'historique des votes
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/elections" element={<Elections />} />
              <Route path="/vote-results" element={<VoteResultsHistory />} />
              <Route path="/admin/create-election" element={<CreateElections />} />
              <Route path="/admin/manage-users" element={<ManageUsers />} />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
