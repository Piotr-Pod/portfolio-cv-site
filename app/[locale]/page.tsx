import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { TimelineSection } from '@/components/TimelineSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { ContactSection } from '@/components/ContactSection';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <TimelineSection />
      <ProjectsSection />
      <ContactSection />
    </main>
  );
}
