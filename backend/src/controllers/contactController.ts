import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ContactSubmissionRequest } from '../types';

const prisma = new PrismaClient();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates that all required contact form fields are present and non-empty.
 */
function validateContactFields(
  body: Partial<ContactSubmissionRequest>
): string | null {
  const { name, email, subject, message } = body;

  if (!name || name.trim().length === 0) return 'Name is required';
  if (!email || email.trim().length === 0) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  if (!subject || subject.trim().length === 0) return 'Subject is required';
  if (!message || message.trim().length === 0) return 'Message is required';

  return null;
}

/**
 * POST /api/contact — validates and saves a contact form submission.
 */
export async function createContactSubmission(req: Request, res: Response): Promise<void> {
  try {
    const validationError = validateContactFields(req.body as Partial<ContactSubmissionRequest>);

    if (validationError) {
      res.status(400).json({ error: validationError, status: 400 });
      return;
    }

    const { name, email, subject, message } = req.body as ContactSubmissionRequest;

    const submission = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    res.status(201).json({ success: true, id: submission.id });
  } catch (error) {
    console.error('Error saving contact submission:', error);
    res.status(500).json({ error: 'Failed to save contact submission', status: 500 });
  }
}
