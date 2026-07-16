import { ContactForm } from '../components/ContactForm';
import { AnimatedSection } from '../components/AnimatedSection';

const CONTACT_LINKS = [
  {
    label: 'Email',
    value: 'rafay119muhammad@gmail.com',
    href: 'mailto:rafay119muhammad@gmail.com',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/muhammad-rafay-irfan',
    href: 'https://www.linkedin.com/in/muhammad-rafay-irfan-7341b7247/',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'GitLab',
    value: 'gitlab.com/rafay119muhammad',
    href: 'https://gitlab.com/rafay119muhammad',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
] as const;

export function ContactSection() {
  return (
    <section id="contact" className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection>
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-3">
              Contact
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-6">
              Let's <span className="text-primary-600">connect</span>
            </h2>
            <p className="text-base text-muted max-w-xl mx-auto leading-relaxed">
              Have a project in mind, a job opportunity, or just want to say hello?
              I'd love to hear from you.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Contact Form */}
          <AnimatedSection className="lg:col-span-3" delay={0.1}>
            <div className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8">
              <ContactForm />
            </div>
          </AnimatedSection>

          {/* Contact Info */}
          <AnimatedSection className="lg:col-span-2" delay={0.2}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-dark mb-2">Get in touch</h3>
                <p className="text-sm text-muted leading-relaxed">
                  I'm currently open to junior fullstack developer roles and freelance
                  opportunities. Feel free to reach out!
                </p>
              </div>

              <div className="space-y-4">
                {CONTACT_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-primary-50 hover:border-primary-100 border border-transparent transition-all group"
                    id={`contact-link-${link.label.toLowerCase()}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-muted group-hover:text-primary-600 group-hover:border-primary-200 transition-colors">
                      {link.icon}
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider font-medium">
                        {link.label}
                      </p>
                      <p className="text-sm font-medium text-dark group-hover:text-primary-600 transition-colors">
                        {link.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
