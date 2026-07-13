import { Navbar } from './components/Navbar';
import { HeroSection } from './pages/HeroSection';
import { AboutSection } from './pages/AboutSection';
import { ExperienceSection } from './pages/ExperienceSection';
import { ProjectsSection } from './pages/ProjectsSection';
import { ContactSection } from './pages/ContactSection';
import { Footer } from './pages/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
