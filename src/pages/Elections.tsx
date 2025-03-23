import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HolographicCard } from '../components/HolographicCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}

export const Elections = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/elections');
        setElections(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des élections:', error);
      }
    };

    fetchElections();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 neon-text text-center">
        Élections en cours
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {elections.map((election, index) => (
          <div
            key={election.id}
            className="h-[400px] relative cursor-pointer"
            onClick={() => navigate(`/vote/${election.id}`)}
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

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
              <h3 className="text-2xl font-bold mb-4 neon-text">
                {election.title}
              </h3>
              <p className="mb-4">{election.description}</p>
              <div className="text-sm opacity-75">
                <p>Début: {new Date(election.start_date).toLocaleDateString()}</p>
                <p>Fin: {new Date(election.end_date).toLocaleDateString()}</p>
              </div>
              <span className="mt-4 px-4 py-2 rounded-full text-sm font-semibold" style={{
                backgroundColor: election.status === 'active' ? '#00ff88' : '#6600ff',
                color: 'black'
              }}>
                {election.status === 'active' ? 'En cours' : 'Terminé'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};