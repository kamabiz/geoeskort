import { ContactForm } from '@/components/ContactForm';
import { getCurrentUser } from '@/lib/community/auth';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/types';
import { pageMetadata } from '@/lib/seo';
import { CONTACT_EMAIL } from '@/lib/site';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/contact/',
    title: dict.meta.contactTitle,
    description: dict.meta.contactDescription,
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const user = await getCurrentUser();

  return (
    <main className="container contact-page">
      <header className="contact-page__header">
        <span className="contact-page__badge">{dict.contact.badge}</span>
        <h1>{dict.contact.title}</h1>
        <p>{dict.contact.lead}</p>
      </header>

      <div className="contact-page__layout">
        <section className="contact-page__form-panel" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="contact-page__panel-title">
            {dict.contact.form.title}
          </h2>
          <ContactForm
            dict={dict.contact}
            defaultName={user?.username ?? ''}
            defaultEmail={user?.email ?? ''}
          />
        </section>

        <aside className="contact-page__aside">
          <div className="contact-card">
            <span className="contact-card__icon" aria-hidden>✉️</span>
            <h3>{dict.contact.aside.emailTitle}</h3>
            <p>{dict.contact.aside.emailDesc}</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="contact-card__link">
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="contact-card">
            <span className="contact-card__icon" aria-hidden>💬</span>
            <h3>{dict.contact.aside.topicsTitle}</h3>
            <ul className="contact-card__list">
              {dict.contact.aside.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>

          <div className="contact-card contact-card--accent">
            <span className="contact-card__icon" aria-hidden>⏱️</span>
            <h3>{dict.contact.aside.responseTitle}</h3>
            <p>{dict.contact.aside.responseDesc}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
