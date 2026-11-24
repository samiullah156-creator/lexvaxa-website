import type { Metadata } from 'next';
import { Eyebrow, Trail, CallToAction } from '@/components/ui';
import { pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Accessibility Statement | Lexvaxa',
  description: 'Accessibility features, design goals and ways to request assistance with the Lexvaxa website.',
  path: '/accessibility',
});

export default function AccessibilityPage() {
  return (
    <>
      <header className="page-hero container">
        <Trail items={[{ label: 'Accessibility' }]} />
        <Eyebrow>Inclusive Design</Eyebrow>
        <h1>Accessibility at <span className="blue-text">Lexvaxa</span><span className="purple-text">.</span></h1>
        <p>
          We aim to make our website clear and usable across different devices and ways of navigating.
          Semantic content, keyboard access, readable text and motion preferences guide that work.
        </p>
      </header>

      <div className="section container">
        <article className="legal-page-article">
          <div className="legal-meta-strip">
            <span><strong>Design reference:</strong> WCAG 2.2 AA</span>
            <span><strong>Focus:</strong> Usability and ongoing improvement</span>
            <span><strong>Contact:</strong> <a href={`mailto:${SITE.email}`}>{SITE.email}</a></span>
          </div>

          <section className="legal-section-block">
            <h2>1. Our Commitment</h2>
            <p>
              We use the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA as a design reference.
              Our goal is to reduce barriers for people with visual, auditory, motor and cognitive differences.
              This page describes our current features and areas of focus; it does not claim independently verified conformance.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>2. Website Features</h2>
            <p>Our website incorporates the following accessibility features:</p>
            <ul>
              <li><strong>Page structure:</strong> Headings and landmarks organize content, with a skip link to reach the main content.</li>
              <li><strong>Keyboard controls:</strong> Navigation links, buttons and enquiry fields use native controls with visible focus styles.</li>
              <li><strong>Form labels:</strong> Enquiry fields have labels, required-field indicators and browser validation messages.</li>
              <li><strong>Motion controls:</strong> The service showcase can be paused. Automatic changes stop when reduced motion is enabled, the showcase leaves view, the page is hidden or a showcase control receives keyboard focus. Choosing Resume starts rotation again.</li>
              <li><strong>Responsive layouts:</strong> Content adapts to different screen widths. Readability, contrast and text enlargement remain part of our review goals.</li>
            </ul>
          </section>

          <section className="legal-section-block">
            <h2>3. Review &amp; Improvement</h2>
            <p>
              Keyboard access, clear labels, contrast and motion behavior guide our design reviews.
              Feedback about a specific barrier helps us identify improvements and prioritize the affected experience.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>4. Feedback &amp; Assistance</h2>
            <p>
              If you experience any accessibility barriers while using our website, or if you need assistance accessing any information,
              please let us know. We welcome feedback so we can investigate the affected experience.
            </p>
            <p>
              Please contact us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and include:
            </p>
            <ul>
              <li>The URL of the page you were attempting to access.</li>
              <li>A description of the specific barrier encountered.</li>
              <li>The assistive technology, browser, and operating system you are using.</li>
            </ul>
          </section>
        </article>
      </div>

      <CallToAction title="Have questions about our engineering standards?" />
    </>
  );
}
