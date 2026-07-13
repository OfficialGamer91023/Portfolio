import { useContactForm } from '../hooks/useContactForm';
import type { ContactFormData } from '../types';

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
            className="block text-sm font-medium text-dark mb-1.5"
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
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none bg-white placeholder:text-gray-400"
            />
          ) : (
            <input
              id={`contact-${field.key}`}
              type={field.type}
              value={formData[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              required
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white placeholder:text-gray-400"
            />
          )}
        </div>
      ))}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        id="contact-submit"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </span>
        ) : (
          'Send Message'
        )}
      </button>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 animate-fade-in" id="contact-success">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p>Message sent successfully! I'll get back to you soon.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-fade-in" id="contact-error">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
    </form>
  );
}
