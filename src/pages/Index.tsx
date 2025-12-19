import { useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { GamesSection } from '@/components/GamesSection';
import { FAQSection } from '@/components/FAQSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { RegistrationModal } from '@/components/RegistrationModal';

const Index = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gamesSectionRef = useRef<HTMLDivElement>(null);

  const scrollToGames = () => {
    gamesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectGame = (game: string) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onInscribirme={scrollToGames} />

      <main>
        <HeroSection onInscribirme={scrollToGames} />

        <div ref={gamesSectionRef}>
          <GamesSection onSelectGame={handleSelectGame} />
        </div>

        <FAQSection />

        <ContactSection />
      </main>

      <Footer />

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedGame={selectedGame}
      />
    </div>
  );
};

export default Index;
