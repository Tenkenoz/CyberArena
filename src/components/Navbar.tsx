import { Button } from '@/components/ui/button';

interface NavbarProps {
  onInscribirme: () => void;
}

export const Navbar = ({ onInscribirme }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="font-display text-xl font-bold text-primary glow-text">
          CYBER ARENA
        </div>
        <div className="flex items-center gap-6">
          <a href="#inicio" className="text-muted-foreground hover:text-foreground transition-colors">
            Inicio
          </a>
          <a href="#noticias" className="text-muted-foreground hover:text-foreground transition-colors">
            Noticias
          </a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
          <a href="#contactos" className="text-muted-foreground hover:text-foreground transition-colors">
            Contactos
          </a>
          <Button variant="hero" size="sm" onClick={onInscribirme}>
            Inscribirme
          </Button>
        </div>
      </div>
    </nav>
  );
};
