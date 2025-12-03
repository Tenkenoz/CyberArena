export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-display text-xl font-bold text-primary glow-text mb-4">
              CYBER ARENA
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Dirección</strong><br />
              Liga de Torneos, centro de competencia digital
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Contacto</strong><br />
              <a href="mailto:info@cyberarena.com" className="text-primary hover:underline">
                info@cyberarena.com
              </a>
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#inicio" className="hover:text-foreground transition-colors">Inicio</a></li>
              <li><a href="#juegos" className="hover:text-foreground transition-colors">Juegos</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Juegos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">League of Legends</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Valorant</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">TFT</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Chess</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Clash Royale</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Términos</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Reglas del torneo</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2024 Cyber Arena. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};
