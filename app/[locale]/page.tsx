import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { TimelineSection } from '@/components/TimelineSection';
import { ContactSection } from '@/components/ContactSection';
import { HashHandler } from '@/components/HashHandler';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HashHandler />
      <HeroSection />
      <AboutSection />
      <TimelineSection />
      <ContactSection />
      <ContactSection />
      <ContactSection />
      <ContactSection />
    </main>
  );
}
