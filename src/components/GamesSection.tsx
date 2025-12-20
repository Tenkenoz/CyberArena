import { GameCard } from './GameCard';
import lolLogo from '@/assets/games/lol-logo.png';
import valorantLogo from '@/assets/games/valorant-logo.png';
import tftLogo from '@/assets/games/tft-logo.png';
import chessLogo from '@/assets/games/chess-logo.png';
import clashRoyaleLogo from '@/assets/games/clash-royale-logo.png';

interface GamesSectionProps {
  onSelectGame: (game: string) => void;
}

// Estructura estandarizada para los detalles del torneo
const lolTournamentDetails = [
  { label: 'Hora de inicio (Tentativo)', value: '14:00' },
  { label: 'Modalidad', value: 'Online' },
  { label: 'Fecha', value: '26 y 27 de Diciembre' },
  { label: 'Formato', value: 'Torneo' },
  { label: 'Servidor', value: 'LAN' },
  { label: 'Estructura', value: 'BO1 (Eliminación Directa)' },
  { label: 'Fases Finales', value: 'Cuartos a Final BO3' },
  { label: 'Modo de Juego', value: 'Grieta del Invocador 5v5' },
  { label: 'Precio', value: '$3 por persona o $15 por equipo (Incluye coach y suplente)' },
];

// Función simple para validar fecha límite
const isBeforeLimit = (limitDateString: string) => {
  const now = new Date();
  const limit = new Date(limitDateString);
  return now <= limit;
};

const games = [
  {
    id: 'league-of-legends',
    title: 'League of Legends',
    description:
      'Forma un equipo de cinco jugadores y demuestra tu destreza en el campo de batalla del juego MOBA más popular.',
    type: 'equipo' as const,
    isMain: false,
    image: lolLogo,
    details: lolTournamentDetails,
    limitDate: '2025-12-27', // 1 día antes
  },
  {
    id: 'valorant',
    title: 'Valorant',
    description:
      'Únete a la acción táctica y compite en este emocionante shooter competitivo.',
    type: 'equipo' as const,
    image: valorantLogo,
    details: [
      ...lolTournamentDetails.slice(0, 2),
      { label: 'Modo de Juego', value: '5vs5' },
      { label: 'Servidor', value: 'Bogota' },
      { label: 'Fecha', value: '3 y 4 de Enero' },
      { label: 'Formato', value: 'B01 Eliminacion Directa' },
      { label: 'Fases Finales', value: 'Cuartos a Final BO3' },
      { label: 'Precio', value: '$3 por persona o $15 por equipo' },
    ],
    limitDate: '2026-01-04', // 1 día antes
  },
  {
    id: 'tft',
    title: 'Teamfight Tactics',
    description:
      'Pon a prueba tu estrategia en este modo de juego autobattler de League of Legends.',
    type: 'individual' as const,
    image: tftLogo,
    details: [
      { label: 'Hora de inicio (Tentativo)', value: '14:00' },
      { label: 'Fecha', value: 'Diciembre 28 y 29' },
      { label: 'Modalidad', value: 'Online' },
      { label: 'Formato', value: 'Torneo Individual' },
      { label: 'Modo de Juego', value: 'TFT Estándar' },
      { label: 'Precio', value: '$3 por persona' },
    ],
    limitDate: '2025-12-29', // 1 día antes
  },
  {
    id: 'chess',
    title: 'Chess.com',
    description:
      'Demuestra tu inteligencia y táctica en el juego más antiguo del mundo.',
    type: 'individual' as const,
    image: chessLogo,
    details: [
      { label: 'Hora de inicio (Tentativo)', value: '14:00' },
      { label: 'Fecha', value: 'Diciembre 29 y 30' },
      { label: 'Modalidad', value: 'Online (Chess.com)' },
      { label: 'Formato', value: 'Torneo Suizo' },
      { label: 'Precio', value: '$3 por persona' },
    ],
    limitDate: '2025-12-30', // 1 día antes
  },
  {
    id: 'clash-royale',
    title: 'Clash Royale',
    description:
      'Batalla en tiempo real y demuestra tu destreza en este popular juego de estrategia.',
    type: 'individual' as const,
    image: clashRoyaleLogo,
    details: [
      { label: 'Hora de inicio (Tentativo)', value: '14:00' },
      { label: 'Fecha', value: 'Diciembre 20 y 21' },
      { label: 'Modalidad', value: 'Online' },
      { label: 'Formato', value: 'Elimacion directa BO3' },
      { label: 'Finales', value: 'Elimacion doble B05' },
      { label: 'Precio', value: '$3 por persona' },
    ],
    limitDate: '2025-12-21', // 1 día antes
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

        <div className="grid grid-cols-1  gap-6  mx-auto">
          {/* League of Legends */}
          <GameCard
            {...games[0]}
            onInscribirse={() => {
              if (isBeforeLimit(games[0].limitDate)) {
                onSelectGame(games[0].id);
              } else {
                alert("Las inscripciones para este juego ya han cerrado.");
              }
            }}
          />

          <div className="md:col-span-1 grid grid-cols-1 gap-6">
            <GameCard
              {...games[1]}
              onInscribirse={() => {
                if (isBeforeLimit(games[1].limitDate)) {
                  onSelectGame(games[1].id);
                } else {
                  alert("Las inscripciones ya cerraron.");
                }
              }}
            />
            <GameCard
              {...games[2]}
              onInscribirse={() => {
                if (isBeforeLimit(games[2].limitDate)) {
                  onSelectGame(games[2].id);
                } else {
                  alert("Las inscripciones ya cerraron.");
                }
              }}
            />
          </div>

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <GameCard
              {...games[3]}
              onInscribirse={() => {
                if (isBeforeLimit(games[3].limitDate)) {
                  onSelectGame(games[3].id);
                } else {
                  alert("Las inscripciones ya cerraron.");
                }
              }}
            />

            <GameCard
              {...games[4]}
              onInscribirse={() => {
                if (isBeforeLimit(games[4].limitDate)) {
                  onSelectGame(games[4].id);
                } else {
                  alert("Las inscripciones ya cerraron.");
                }
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
