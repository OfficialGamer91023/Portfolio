import { useContactForm } from '../hooks/useContactForm';
import type { ContactFormData } from '../types';
import { StarBorder } from './reactbits/StarBorder';
import { ClickSpark } from './reactbits/ClickSpark';

const FORM_FIELDS: {
  key: keyof ContactFormData;
  label: string;
  type: 'text' | 'email' | 'textarea';
  placeholder: string;
}[] = [
  { key: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
  { key: 'subject', label: 'Subject', type: 'text', placeholder: 'What is this about?' },
  { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Your message...' },
];

// @tailwindcss/forms resets inputs to a white background, so the dark surface
// has to be stated explicitly rather than inherited.
const FIELD_CLASSES =
  'w-full rounded-lg border border-ink-700 bg-ink-900 px-4 py-2.5 text-sm text-white transition-colors placeholder:text-muted/80 focus:border-primary-500/60 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-0';

export function ContactForm() {
  const { formData, loading, error, success, handleChange, handleSubmit } = useContactForm();

  function onSubmit(e: React.FormEvent): void {
    e.preventDefault();
    handleSubmit();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" id="contact-form">
      {FORM_FIELDS.map((field) => (
        <div key={field.key}>
          <label
            htmlFor={`contact-${field.key}`}
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/70"
          >
            {field.label}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              id={`contact-${field.key}`}
              value={formData[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={5}
              required
              className={`${FIELD_CLASSES} resize-none`}
            />
          ) : (
            <input
              id={`contact-${field.key}`}
              type={field.type}
              value={formData[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              required
              className={FIELD_CLASSES}
            />
          )}
        </div>
      ))}

      {/* Submit Button */}
      <ClickSpark className="relative block">
        <StarBorder
          as="button"
          type="submit"
          disabled={loading}
          className="w-full disabled:cursor-not-allowed disabled:opacity-50"
          innerClassName="w-full py-3.5"
          id="contact-submit"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </StarBorder>
      </ClickSpark>

      {/* Result banners are announced to assistive tech as they appear. */}
      <div aria-live="polite">
        {success && (
          <div
            className="flex animate-fade-in items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-300"
            id="contact-success"
          >
            <svg className="h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p>Message sent successfully! I'll get back to you soon.</p>
          </div>
        )}

        {error && (
          <div
            className="flex animate-fade-in items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300"
            id="contact-error"
          >
            <svg className="h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p>{error}</p>
          </div>
        )}
      </div>
    </form>
  );
}
