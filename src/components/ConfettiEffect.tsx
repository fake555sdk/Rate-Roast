import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

interface ConfettiEffectProps {
  trigger: boolean;
  duration?: number;
  intensity?: number;
}

export default function ConfettiEffect({ 
  trigger, 
  duration = 3000, 
  intensity = 50 
}: ConfettiEffectProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const colors = [
    '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', 
    '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
  ];

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      
      // Create confetti pieces
      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < intensity; i++) {
        pieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          velocityX: (Math.random() - 0.5) * 4,
          velocityY: Math.random() * 3 + 2,
          rotationSpeed: (Math.random() - 0.5) * 10,
        });
      }
      setConfetti(pieces);

      // Animate confetti
      const animationInterval = setInterval(() => {
        setConfetti(prev => 
          prev.map(piece => ({
            ...piece,
            x: piece.x + piece.velocityX,
            y: piece.y + piece.velocityY,
            rotation: piece.rotation + piece.rotationSpeed,
            velocityY: piece.velocityY + 0.1, // Gravity
          })).filter(piece => piece.y < window.innerHeight + 50)
        );
      }, 16);

      // Clean up after duration
      setTimeout(() => {
        clearInterval(animationInterval);
        setConfetti([]);
        setIsActive(false);
      }, duration);

      return () => clearInterval(animationInterval);
    }
  }, [trigger, isActive, duration, intensity]);

  if (!isActive || confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  );
}