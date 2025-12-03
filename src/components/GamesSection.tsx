import { GameCard } from './GameCard';
import lolLogo from '@/assets/games/lol-logo.png';
import valorantLogo from '@/assets/games/valorant-logo.png';
import tftLogo from '@/assets/games/tft-logo.png';
import chessLogo from '@/assets/games/chess-logo.png';
import clashRoyaleLogo from '@/assets/games/clash-royale-logo.png';

interface GamesSectionProps {
  onSelectGame: (game: string) => void;
}

const games = [
  {
    id: 'league-of-legends',
    title: 'League of Legends',
    description: 'Forma un equipo de cinco jugadores y demuestra tu destreza en el campo de batalla del juego MOBA más popular.',
    type: 'equipo' as const,
    isMain: true,
    image: lolLogo,
  },
  {
    id: 'valorant',
    title: 'Valorant',
    description: 'Únete a la acción táctica y compite en este emocionante shooter competitivo.',
    type: 'equipo' as const,
    image: valorantLogo,
  },
  {
    id: 'tft',
    title: 'Teamfight Tactics',
    description: 'Pon a prueba tu estrategia en este modo de juego autobattler de League of Legends.',
    type: 'individual' as const,
    image: tftLogo,
  },
  {
    id: 'chess',
    title: 'Chess.com',
    description: 'Demuestra tu inteligencia y táctica en el juego más antiguo del mundo.',
    type: 'individual' as const,
    image: chessLogo,
  },
  {
    id: 'clash-royale',
    title: 'Clash Royale',
    description: 'Batalla en tiempo real y demuestra tu destreza en este popular juego de estrategia.',
    type: 'individual' as const,
    image: clashRoyaleLogo,
  },
];

export const GamesSection = ({ onSelectGame }: GamesSectionProps) => {
  return (
    <section id="juegos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-4 glow-text">
          Juegos disponibles
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Elige tu juego favorito y demuestra tu habilidad en la arena
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* League of Legends - Main card */}
          <GameCard 
            {...games[0]} 
            onInscribirse={() => onSelectGame(games[0].id)} 
          />
          
          {/* Other games grid */}
          <div className="md:col-span-1 grid grid-cols-1 gap-6">
            <GameCard 
              {...games[1]} 
              onInscribirse={() => onSelectGame(games[1].id)} 
            />
            <GameCard 
              {...games[2]} 
              onInscribirse={() => onSelectGame(games[2].id)} 
            />
          </div>
          
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <GameCard 
              {...games[3]} 
              onInscribirse={() => onSelectGame(games[3].id)} 
            />
            <GameCard 
              {...games[4]} 
              onInscribirse={() => onSelectGame(games[4].id)} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};
