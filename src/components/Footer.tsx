import AlhajilloInteractive from '@/assets/Auspiciantes/AlhajilloInteractive_logo.png';
import NatuLove from '@/assets/Auspiciantes/NatuLove_logo.jpeg';
import Panda from '@/assets/Auspiciantes/Panda_logo.jpeg';
import Metaconstruec from '@/assets/Auspiciantes/Metaconstruec_logo.jpeg';

const SPONSORS = [
  { name: "AlhajilloInteractive", logoSrc: AlhajilloInteractive, link: "https://www.alhajillo.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGn2a-rCp4TW640hxhkzaYOCjEKAAncVTQER0NBKXIzqP9FqWsICbPM0IvJZJg_aem_H9ykVNnUyxTbnafb6HMgXA" },
  { name: "NatuLove", logoSrc: NatuLove, link: "https://www.instagram.com/natulove8/" },
  { name: "Panda", logoSrc: Panda, link: "https://pandamangasecuador.com/store-anime-manga-otaku/?srsltid=AfmBOooH2WhEmKOxs-MaHRgne7-yI95wYgCoQjEDfmjqK7fLS8_dOr6t" },
  { name: "Metaconstruec", logoSrc: Metaconstruec, link: "https://linktr.ee/psi.stalinquezada?utm_source=linktree_profile_share&ltsid=496842a9-099a-4708-9d60-a42285fedcab" },
];

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* --- INFO PRINCIPAL --- */}
          <div>
            <div className="font-display text-xl font-bold text-primary glow-text mb-4">
              CYBER ARENA
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              <strong>Dirección</strong><br />
              OpenHub, Sangolquí, Ecuador
            </p>

            <div className="text-sm text-muted-foreground">
              <strong>Contacto</strong><br />
              <span className="text-primary">openhubgames@gmail.com</span>
            </div>
          </div>

          {/* --- NAVEGACIÓN --- */}
          <div>
            <h4 className="font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#inicio" className="hover:text-foreground transition-colors">Inicio</a></li>
              <li><a href="#juegos" className="hover:text-foreground transition-colors">Juegos</a></li>
            </ul>
          </div>

          {/* --- JUEGOS --- */}
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

          {/* --- REDES SOCIALES --- */}
          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a 
                  href="https://www.tiktok.com/@clubsoftwareespe" 
                  className="hover:text-foreground transition-colors"
                  target="_blank"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/openhub.club/" 
                  className="hover:text-foreground transition-colors"
                  target="_blank"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* --- AUSPICIANTES --- */}
        <div className="mt-12">
          <h4 className="font-display text-2xl font-bold text-center mb-6">
            Nuestros Auspiciantes
          </h4>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {SPONSORS.map((sponsor) => (
              <a
                key={sponsor.name}
                href={sponsor.link}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-80"
                aria-label={`Visitar sitio web de ${sponsor.name}`}
              >
                <img
                  src={sponsor.logoSrc}
                  alt={`Logo de ${sponsor.name}`}
                   className="max-w-[150px] h-[80px] object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </a>
            ))}
          </div>
        </div>

        {/* --- FRASE --- */}
        <div className="font-semibold mt-12 mb-4 text-center">
          Recuerda que una competición sana es la clave de muchas victorias
        </div>

        {/* --- COPYRIGHT --- */}
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2025 Cyber Arena. Todos los derechos reservados.
        </div>

      </div>
    </footer>
  );
};
