import { Navbar } from './components/Navbar';
import { HeroSection } from './pages/HeroSection';
import { AboutSection } from './pages/AboutSection';
import { ExperienceSection } from './pages/ExperienceSection';
import { ProjectsSection } from './pages/ProjectsSection';
import { LabSection } from './pages/LabSection';
import { ContactSection } from './pages/ContactSection';
import { Footer } from './pages/Footer';

function App() {
  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-950"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <LabSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
