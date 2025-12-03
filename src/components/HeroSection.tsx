import { Button } from '@/components/ui/button';
import { Particles } from './Particles';
import heroBg from '@/assets/hero-bg.jpg';

interface HeroSectionProps {
  onInscribirme: () => void;
}

export const HeroSection = ({ onInscribirme }: HeroSectionProps) => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        <div className="absolute inset-0 hero-gradient" />
      </div>
      
      {/* Particles */}
      <Particles />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 glow-text animate-fade-in">
          CYBER ARENA OPEN
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Compite en cinco juegos distintos durante la temporada de Navidad. Inscribe tu equipo o participa como jugador individual en esta competencia.
        </p>
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button variant="hero" size="xl" onClick={onInscribirme}>
            Inscribirme
          </Button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex justify-center pt-2">
          <div className="w-1 h-3 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  );
};
