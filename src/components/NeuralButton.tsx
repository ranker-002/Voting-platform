import React from 'react';
import { motion } from 'framer-motion';

interface NeuralButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const NeuralButton: React.FC<NeuralButtonProps> = ({
  onClick,
  children,
  className = '',
}) => {
  return (
    <motion.button
      className={`neural-button ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};