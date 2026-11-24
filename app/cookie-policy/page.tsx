import type { Metadata } from 'next';
import { Eyebrow, Trail, CallToAction } from '@/components/ui';
import { pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Cookie Policy | Lexvaxa',
  description: 'Learn about the essential and optional cookies and storage technologies used on the Lexvaxa website.',
  path: '/cookie-policy',
});

export default function CookiePolicyPage() {
  return (
    <>
      <header className="page-hero container">
        <Trail items={[{ label: 'Cookie Policy' }]} />
        <Eyebrow>Transparency &amp; Governance</Eyebrow>
        <h1>Cookie <span className="blue-text">Policy</span><span className="purple-text">.</span></h1>
        <p>
          This document explains how Lexvaxa uses cookies and similar storage technologies on our website,
          and how you can manage your preferences.
        </p>
      </header>

      <section className="section container">
        <article className="legal-page-article">
          <div className="legal-meta-strip">
            <span><strong>Effective Date:</strong> October 2026</span>
            <span><strong>Last Updated:</strong> October 2026</span>
            <span><strong>Platform:</strong> lexvaxa.com</span>
          </div>

          <section className="legal-section-block">
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your browser or device by websites you visit. They are commonly used
              to keep websites functioning efficiently, secure user sessions, and provide basic operational insights.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>2. Browser Storage &amp; Preferences</h2>
            <p>
              The service explorer uses browser session storage to remember the service you selected in the current tab.
              It stores a service identifier, rather than your contact details. Other interface state works as follows:
            </p>
            <ul>
              <li><strong>Motion preference:</strong> The showcase reads the reduced-motion preference provided by your browser or operating system. It does not save a separate motion setting.</li>
              <li><strong>Enquiry fields:</strong> Entered text is held in the current page state while you complete the form. This website does not save the enquiry to browser storage.</li>
            </ul>
            <p>
              The service explorer remains usable if session storage is unavailable; it simply starts with the first service.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>3. Analytics &amp; Performance</h2>
            <p>
              This website version does not include an advertising pixel or a third-party analytics script.
            </p>
            <p>
              If measurement tools are introduced, this policy and the relevant preference controls will need to reflect their actual behavior.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>4. Managing Your Preferences</h2>
            <p>
              You can control and disable cookies directly through your browser settings. Most browsers allow you to:
            </p>
            <ul>
              <li>View cookies currently stored on your computer.</li>
              <li>Block third-party cookies or all cookies entirely.</li>
              <li>Clear stored cookies upon closing your browser window.</li>
            </ul>
            <p>
              Clearing this site’s session storage resets the selected service. You can change motion preferences in your device’s accessibility settings.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>5. Questions &amp; Contact</h2>
            <p>
              If you have questions about our use of storage technologies, please email us at{' '}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
            </p>
          </section>
        </article>
      </section>

      <CallToAction title="Ready to build scalable software?" />
    </>
  );
}
