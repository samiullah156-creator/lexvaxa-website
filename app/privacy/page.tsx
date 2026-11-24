import type { Metadata } from 'next';
import { Eyebrow, Trail, CallToAction } from '@/components/ui';
import { pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy | Lexvaxa',
  description: 'How Lexvaxa collects, processes, and protects personal information across our website and business communications.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <>
      <header className="page-hero container">
        <Trail items={[{ label: 'Privacy Policy' }]} />
        <Eyebrow>Transparency &amp; Data Protection</Eyebrow>
        <h1>Privacy <span className="blue-text">Policy</span><span className="purple-text">.</span></h1>
        <p>
          This privacy policy explains how Lexvaxa processes information received through our website,
          project enquiries, and technical consultations.
        </p>
      </header>

      <section className="section container">
        <article className="legal-page-article">
          <div className="legal-meta-strip">
            <span><strong>Effective Date:</strong> October 2026</span>
            <span><strong>Last Updated:</strong> November 2026</span>
            <span><strong>Data Controller:</strong> Lexvaxa</span>
          </div>

          <section className="legal-section-block">
            <h2>1. Who We Are</h2>
            <p>
              Lexvaxa (&ldquo;Lexvaxa&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) provides AI engineering, custom software development,
              and workflow automation services. This privacy notice explains how we process personal information when you use
              {' '}<a href={SITE.url}>{SITE.url}</a>, contact us, or discuss potential engineering engagements.
            </p>
            <p>
              For privacy enquiries or to exercise data rights, you may contact us directly at{' '}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>2. Information We Receive</h2>
            <p>Depending on how you interact with our website and communications, we may receive:</p>
            <ul>
              <li><strong>Contact Information:</strong> Your name, business email address, company name, and project scope submitted via consultation requests.</li>
              <li><strong>Technical Data:</strong> Device and browser characteristics, IP address, page response times, and standard server request headers necessary to securely transmit content.</li>
              <li><strong>Correspondence:</strong> Notes, technical requirements, and feedback shared during exploratory calls and emails.</li>
            </ul>
            <p>
              We do not solicit passwords, payment card details, or sensitive personal data through public website enquiry forms.
            </p>
            {process.env.NEXT_PUBLIC_CMS_URL ? (
              <p>
                When you send the enquiry form on our contact page, the details you enter (your name, email address, company, website,
                country, phone number if you provide one, how you heard about us and your message) are transmitted to Lexvaxa and stored
                in our enquiry system so that we can reply and follow up. You can ask us to correct or delete an enquiry at any time.
                If you choose the email option instead, a draft is prepared on your device and reaches us only when you send it from
                your own email account.
              </p>
            ) : (
              <p>
                The enquiry composer prepares a draft on your device. Its contents are not submitted to this website;
                we receive your enquiry when you choose to send it by email or contact us directly.
              </p>
            )}
          </section>

          <section className="legal-section-block">
            <h2>3. How We Use Information</h2>
            <p>We process information strictly for legitimate commercial and technical purposes, including:</p>
            <ul>
              <li>Evaluating project feasibility and preparing technical proposals.</li>
              <li>Communicating with you regarding requested engineering services.</li>
              <li>Maintaining website security, diagnosing operational errors, and mitigating malicious abuse.</li>
              <li>Fulfilling legal, accounting, and compliance obligations.</li>
            </ul>
          </section>

          <section className="legal-section-block">
            <h2>4. Legal Bases for Processing</h2>
            <p>
              Where applicable law (such as the GDPR or UK GDPR) requires a lawful basis, we process information on the basis of:
            </p>
            <ul>
              <li><strong>Contract or Pre-Contractual Steps:</strong> Taking steps at your request before entering into a contract (e.g., scoping a software engagement).</li>
              <li><strong>Legitimate Interests:</strong> Operating a secure engineering company website, responding to B2B enquiries, and protecting infrastructure from malicious traffic.</li>
              <li><strong>Consent:</strong> Where affirmative consent is specifically requested and granted for optional communications or analytics.</li>
              <li><strong>Legal Compliance:</strong> Complying with applicable statutory records and reporting requirements.</li>
            </ul>
          </section>

          <section className="legal-section-block">
            <h2>5. Service Providers &amp; Infrastructure</h2>
            <p>
              We use a small number of service providers to run this website. Enquiries and job applications you send
              through our forms are stored in our own database hosted on MongoDB Atlas; CVs are kept in a private store
              that only authorised Lexvaxa staff can open, never on a public address. Images shown on the website are served
              through Cloudinary&apos;s content delivery network, and our hosting provider serves the pages themselves.
              These providers process data under their own security and confidentiality commitments.
              We do not sell, rent, or trade your personal information to third-party data brokers.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>6. International Data Transfers</h2>
            <p>
              Because Lexvaxa collaborates with global clients, including businesses across the United States, Canada, the United Kingdom, Europe, and Australia, information may be processed across international systems.
              Where international data transfer laws apply, we implement recognized contractual safeguards to protect personal information.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>7. Data Retention</h2>
            <p>
              We retain project enquiry correspondence and operational security logs only as long as necessary to fulfill the original purpose,
              manage prospective client engagements, and satisfy regulatory or accounting standards. Job applications and CVs are kept for
              up to 12 months, as stated on the application form, and then deleted unless you ask us to keep them longer.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>8. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have rights to request access to, correction of, or deletion of your personal data,
              as well as rights to restrict or object to processing. To exercise these rights, email{' '}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>9. Updates to This Notice</h2>
            <p>
              We may update this privacy notice periodically to reflect changes in our operational practices, infrastructure, or regulatory requirements.
              The effective date at the top of this document indicates the latest revision.
            </p>
          </section>
        </article>
      </section>

      <CallToAction title="Ready to discuss your engineering goals?" />
    </>
  );
}
