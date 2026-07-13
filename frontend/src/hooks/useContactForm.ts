import { useState } from 'react';
import type { ContactFormData, ContactSubmissionResponse } from '../types';
import { API_BASE } from '../config';

interface UseContactFormReturn {
  formData: ContactFormData;
  loading: boolean;
  error: string | null;
  success: boolean;
  handleChange: (field: keyof ContactFormData, value: string) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
}

const INITIAL_FORM_DATA: ContactFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export function useContactForm(): UseContactFormReturn {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  function handleChange(field: keyof ContactFormData, value: string): void {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error/success when user starts typing again
    if (error) setError(null);
    if (success) setSuccess(false);
  }

  async function handleSubmit(): Promise<void> {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error: ${res.status}`);
      }

      const data = (await res.json()) as ContactSubmissionResponse;

      if (data.success) {
        setSuccess(true);
        setFormData(INITIAL_FORM_DATA);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function resetForm(): void {
    setFormData(INITIAL_FORM_DATA);
    setError(null);
    setSuccess(false);
  }

  return { formData, loading, error, success, handleChange, handleSubmit, resetForm };
}
