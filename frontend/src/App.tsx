import { lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './pages/HeroSection';
import { ThesisSection } from './pages/ThesisSection';
import { WorkSection } from './pages/WorkSection';
import { LabSection } from './pages/LabSection';
import { SkillsSection } from './pages/SkillsSection';
import { HeatmapSection } from './pages/HeatmapSection';
import { Footer } from './pages/Footer';

// Chess pulls in chess.js; split it into its own chunk so it is not part of the
// first paint. Falls back to a reserved-height block to avoid a layout jump.
const ChessSection = lazy(() => import('./pages/ChessSection'));

function App() {
  return (
    <div className="min-h-screen page-surface text-content">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-content focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <HeroSection />
        <ThesisSection />
        <WorkSection />
        <LabSection />
        <SkillsSection />
        <Suspense fallback={<div className="min-h-[520px]" aria-hidden="true" />}>
          <ChessSection />
        </Suspense>
        <HeatmapSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
