'use server';

import { prisma } from '@/lib/prisma';

export type ContactActionState =
  | { ok: true }
  | { ok: false; error: 'validation' | 'serviceUnavailable' }
  | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactForm(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const subject = String(formData.get('subject') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (name.length < 2 || !EMAIL_RE.test(email) || subject.length < 3 || message.length < 10) {
    return { ok: false, error: 'validation' };
  }

  if (!process.env.DATABASE_URL) {
    return { ok: false, error: 'serviceUnavailable' };
  }

  try {
    await prisma.contactInquiry.create({
      data: {
        name: name.slice(0, 120),
        email: email.slice(0, 254),
        subject: subject.slice(0, 200),
        message: message.slice(0, 5000),
      },
    });
  } catch {
    return { ok: false, error: 'serviceUnavailable' };
  }

  return { ok: true };
}
