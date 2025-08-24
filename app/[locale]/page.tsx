import { HeroSection } from '@/components/HeroSection';
import { ContactSection } from '@/components/ContactSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ContactSection />
    </main>
  );
}
