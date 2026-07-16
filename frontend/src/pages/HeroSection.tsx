export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 -z-10">
        {/* Large circle top-right */}
        <div className="hero-shape w-96 h-96 bg-primary-600 -top-20 -right-20 animate-float" />
        {/* Medium circle bottom-left */}
        <div className="hero-shape w-72 h-72 bg-primary-400 -bottom-16 -left-16 animate-float-slow" />
        {/* Small circle mid-left */}
        <div className="hero-shape w-40 h-40 bg-primary-300 top-1/3 left-10 animate-float-delayed" />
        {/* Tiny accent dots */}
        <div className="hero-shape w-20 h-20 bg-primary-500 top-20 left-1/3 animate-pulse-slow" />
        <div className="hero-shape w-16 h-16 bg-primary-600 bottom-32 right-1/4 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, #0f0f0f 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Greeting tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-100 rounded-full text-sm font-medium text-primary-700 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          Open to opportunities
        </div>

        {/* Name */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-dark tracking-tight mb-4 animate-fade-in-up">
          Muhammad Rafay
          <br />
          <span className="text-primary-600">Irfan</span>
        </h1>

        {/* Title */}
        <p className="text-xl sm:text-2xl text-muted font-medium mb-3 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          Software Engineer & Open Source Developer
        </p>

        {/* Tagline */}
        <p className="text-base text-muted/70 max-w-xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Computer Science Graduate from GIK Institute with production experience from
          Google Summer of Code and two software engineering internships.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
          <a
            href="#projects"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-dark text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
            id="hero-cta-projects"
          >
            View My Work
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
          <a
            href="/Muhammad_Rafay_Irfan_CV.pdf"
            download
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-dark text-sm font-semibold rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all hover:shadow-md hover:-translate-y-0.5"
            id="hero-cta-cv"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CV
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
