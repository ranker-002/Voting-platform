import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HolographicCard } from '../components/HolographicCard';
import axios from 'axios';
import { Check } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  bio: string;
  photo_url: string;
}

interface Election {
  id: string;
  title: string;
  description: string;
  status: string;
}

export const Vote = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        const [electionRes, candidatesRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/elections/${electionId}`),
          axios.get(`http://localhost:3000/api/elections/${electionId}/candidates`)
        ]);
        setElection(electionRes.data);
        setCandidates(candidatesRes.data);
      } catch (error) {
        setError('Erreur lors du chargement des données');
      }
    };

    fetchElectionData();
  }, [electionId]);

  const handleVote = async () => {
    if (!selectedCandidate) return;

    try {
      await axios.post(`http://localhost:3000/api/votes`, {
        electionId,
        candidateId: selectedCandidate
      });
      setHasVoted(true);
      setTimeout(() => navigate('/elections'), 2000);
    } catch (error) {
      setError('Erreur lors du vote');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 text-red-100 px-6 py-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl neon-text">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 neon-text text-center">
        {election.title}
      </h1>
      <p className="text-center mb-12 max-w-2xl mx-auto">
        {election.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {candidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className="h-[400px] relative cursor-pointer"
            onClick={() => setSelectedCandidate(candidate.id)}
          >
            <Canvas camera={{ position: [0, 0, 4] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Suspense fallback={null}>
                <HolographicCard
                  position={[0, 0, 0]}
                  rotation={[0, Math.PI * 0.1, 0]}
                />
              </Suspense>
              <OrbitControls enableZoom={false} />
            </Canvas>

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              {selectedCandidate === candidate.id && (
                <div className="absolute top-4 right-4 bg-[#00ff88] text-black p-2 rounded-full">
                  <Check className="h-6 w-6" />
                </div>
              )}
              <img
                src={candidate.photo_url}
                alt={candidate.name}
                className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-[#00ff88]"
              />
              <h3 className="text-2xl font-bold mb-4 neon-text">
                {candidate.name}
              </h3>
              <p className="text-sm">{candidate.bio}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={handleVote}
          disabled={!selectedCandidate || hasVoted}
          className={`neural-button ${
            !selectedCandidate || hasVoted ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {hasVoted ? 'Vote enregistré !' : 'Confirmer le vote'}
        </button>
      </div>
    </div>
  );
};