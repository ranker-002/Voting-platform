import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { VotingSphere } from '../components/VotingSphere';
import { Link } from 'react-router-dom';
import { Vote, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Suspense fallback={null}>
            <VotingSphere />
          </Suspense>
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-6xl font-bold mb-6 neon-text">
          Plateforme de Vote Nouvelle Génération
        </h1>
        <p className="text-xl mb-8 max-w-2xl">
          Une expérience de vote révolutionnaire avec technologie blockchain et interface holographique
        </p>

        <div className="flex gap-6">
          {user ? (
            <Link
              to="/elections"
              className="neural-button flex items-center space-x-2 text-lg"
            >
              <Vote className="h-5 w-5" />
              <span>Voir les élections</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              to="/register"
              className="neural-button flex items-center space-x-2 text-lg"
            >
              <span>Commencer</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};