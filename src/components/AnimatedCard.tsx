import { motion } from 'framer-motion';
import React from 'react';
import useThemeContext from '../contexts/ThemeContext';
import './AnimatedCard.css';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  gradient?: string;
  delay?: number;
  interactive?: boolean;
}

export const AnimatedCard = ({ 
  children, 
  className = '', 
  onClick,
  gradient,
  delay = 0,
  interactive = true
}: AnimatedCardProps) => {
  const { gradient: themeGradient, colors } = useThemeContext();

  const containerVariants = {
    initial: { opacity: 0, y: 24, rotateX: 12, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0, 
      scale: 1,
      transition: { duration: 0.65, delay, type: 'spring', stiffness: 80 }
    },
    hover: interactive ? {
      y: -12,
      rotateX: -8,
      scale: 1.02,
      boxShadow: `0 30px 80px ${colors.primary1}50`,
      transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 20 }
    } : {},
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover={interactive ? "hover" : undefined}
      exit="exit"
      onClick={onClick}
      className={`animated-card ${className} ${interactive ? 'interactive' : ''}`}
      style={{
        perspective: '1200px',
        background: gradient || themeGradient,
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
