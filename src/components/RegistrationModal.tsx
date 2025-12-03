import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LeagueOfLegendsForm } from './forms/LeagueOfLegendsForm';
import { ValorantForm } from './forms/ValorantForm';
import { GenericGameForm } from './forms/GenericGameForm';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGame: string | null;
}

const gameNames: Record<string, string> = {
  'league-of-legends': 'League of Legends',
  'valorant': 'Valorant',
  'tft': 'Teamfight Tactics',
  'chess': 'Chess.com',
  'clash-royale': 'Clash Royale',
};

export const RegistrationModal = ({ isOpen, onClose, selectedGame }: RegistrationModalProps) => {
  if (!selectedGame) return null;

  const gameName = gameNames[selectedGame] || selectedGame;

  const renderForm = () => {
    switch (selectedGame) {
      case 'league-of-legends':
        return <LeagueOfLegendsForm onClose={onClose} />;
      case 'valorant':
        return <ValorantForm onClose={onClose} />;
      default:
        return <GenericGameForm gameName={gameName} onClose={onClose} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary glow-text">
            Inscripción - {gameName}
          </DialogTitle>
        </DialogHeader>
        
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};
