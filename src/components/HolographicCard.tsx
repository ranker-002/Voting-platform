import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

interface HolographicCardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  onClick?: () => void;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  position,
  rotation = [0, 0, 0],
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <Box
      ref={meshRef}
      position={position}
      rotation={rotation}
      args={[2, 3, 0.1]}
      onClick={onClick}
    >
      <meshPhongMaterial
        color="#00ff88"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </Box>
  );
};