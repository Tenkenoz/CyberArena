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
              Sangolquí, Ecuador
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Contacto</strong><br />
              <p className="text-primary ">
               club.de.software.espe@gmail.com
              </p>
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
              <li><a href="#juegos" className="hover:text-foreground transition-colors">League of Legends</a></li>
              <li><a href="#juegos" className="hover:text-foreground transition-colors">Valorant</a></li>
              <li><a href="#juegos" className="hover:text-foreground transition-colors">TFT</a></li>
              <li><a href="#juegos" className="hover:text-foreground transition-colors">Chess</a></li>
              <li><a href="#juegos" className="hover:text-foreground transition-colors">Clash Royale</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://www.tiktok.com/@clubsoftwareespe" className="hover:text-foreground transition-colors">Tik tok</a></li>
              <li><a href="https://www.instagram.com/openhub.club/" className="hover:text-foreground transition-colors">Instagram</a></li>
             
            </ul>
          </div>
        </div>
        <div className="font-semibold mb-4">
          Recuerda que una competición sana es la clave de muchas victorias
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2025 Cyber Arena. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};
