import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
}

export const Particles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 20,
      duration: Math.random() * 10 + 15,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            left: `${particle.x}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `particle ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
            boxShadow: `0 0 ${particle.size * 2}px hsl(var(--primary) / 0.5)`,
          }}
        />
      ))}
    </div>
  );
};
