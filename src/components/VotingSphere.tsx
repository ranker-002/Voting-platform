import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export const VotingSphere = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      sphereRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]}>
      <meshPhongMaterial
        color="#00ff88"
        transparent
        opacity={0.6}
        wireframe
        side={THREE.DoubleSide}
      />
    </Sphere>
  );
};