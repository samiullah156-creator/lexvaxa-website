import type { Metadata } from 'next';
import { Eyebrow, Trail, CallToAction } from '@/components/ui';
import { pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Website Terms of Use | Lexvaxa',
  description: 'The terms that govern access to and use of the official Lexvaxa website, its content, enquiry forms and linked services.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <>
      <header className="page-hero container">
        <Trail items={[{ label: 'Terms of Use' }]} />
        <Eyebrow>Legal Framework</Eyebrow>
        <h1>Website Terms of <span className="blue-text">Use</span><span className="purple-text">.</span></h1>
        <p>
          Please review the terms and conditions governing your access to and use of the Lexvaxa website.
        </p>
      </header>

      <section className="section container">
        <article className="legal-page-article">
          <div className="legal-meta-strip">
            <span><strong>Effective Date:</strong> October 2026</span>
            <span><strong>Provider:</strong> Lexvaxa</span>
            <span><strong>URL:</strong> lexvaxa.com</span>
          </div>

          <section className="legal-section-block">
            <h2>1. Agreement to Terms</h2>
            <p>
              By visiting and navigating the Lexvaxa website (<a href={SITE.url}>{SITE.url}</a>), you agree to use it lawfully
              and in compliance with these Terms of Use. The information presented on this website is provided for general informational
              purposes regarding our software engineering and AI capabilities.
            </p>
            <p>
              Website content does not constitute a formal binding offer or contractual commitment. All commercial software development,
              AI systems, and consulting services are governed exclusively by separate, mutually executed written proposals, statements of work, and service agreements.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>2. Permitted Use &amp; Conduct</h2>
            <p>
              You may view, browse, and link to public pages on this website for legitimate business purposes. You agree not to:
            </p>
            <ul>
              <li>Attempt unauthorized access to website infrastructure, hosting servers, or connected systems.</li>
              <li>Introduce malicious code, viruses, or automated scripts designed to overload or disrupt website performance.</li>
              <li>Scrape, index, or harvest data in violation of technical security controls, robots directives, or applicable law.</li>
              <li>Misrepresent your identity or relationship with Lexvaxa in project inquiries.</li>
            </ul>
          </section>

          <section className="legal-section-block">
            <h2>3. Intellectual Property Rights</h2>
            <p>
              Unless otherwise stated, Lexvaxa and its licensors own all original text, code, visual architecture, graphics, and brand trademarks
              displayed on this site.
            </p>
            <p>
              Third-party names, service trademarks, and technology logos (such as Python, Next.js, PostgreSQL, OpenAI, Anthropic, or HubSpot)
              belong to their respective owners and are referenced solely for technical context, integrations, and descriptive purposes.
              Such references do not imply endorsement, sponsorship, or affiliation.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>4. Third-Party Links &amp; External Tools</h2>
            <p>
              This website may reference external documentation, social channels, or developer resources.
              Lexvaxa has no control over the content, security, or privacy practices of external third-party sites,
              and their inclusion does not imply responsibility for their operation.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>5. Disclaimer of Warranties</h2>
            <p>
              While we strive to provide accurate, up-to-date technical explanations and architectural blueprints, this website
              is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind.
              We do not guarantee uninterrupted availability, error-free operation, or specific search engine ranking outcomes.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>6. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Lexvaxa shall not be liable for any indirect, incidental,
              or consequential damages resulting from your use of or inability to access this website.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>7. Inquiries &amp; Notices</h2>
            <p>
              If you have any questions regarding these Terms of Use, please reach out to us at{' '}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
            </p>
          </section>
        </article>
      </section>

      <CallToAction title="Ready to engineer your next platform?" />
    </>
  );
}
