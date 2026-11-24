import type { Metadata } from 'next';
import { Eyebrow, Trail, CallToAction } from '@/components/ui';
import { pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Security & Responsible Disclosure | Lexvaxa',
  description: 'Security considerations for software and AI projects, and how to report a potential issue to Lexvaxa.',
  path: '/security',
});

export default function SecurityPage() {
  return (
    <>
      <header className="page-hero container">
        <Trail items={[{ label: 'Security' }]} />
        <Eyebrow>Architectural Discipline</Eyebrow>
        <h1>Security is part of the <span className="blue-text">engineering</span> conversation<span className="purple-text">.</span></h1>
        <p>
          Access, data handling and operational risks belong in project planning.
          We consider safeguards in relation to what a system does, who uses it and the consequences of an error.
        </p>
      </header>

      <div className="section container">
        <article className="legal-page-article">
          <div className="legal-meta-strip">
            <span><strong>Scope:</strong> Software and AI project planning</span>
            <span><strong>Approach:</strong> Safeguards proportionate to risk</span>
            <span><strong>Contact:</strong> <a href={`mailto:${SITE.email}`}>{SITE.email}</a></span>
          </div>

          <section className="legal-section-block">
            <h2>1. Our Security Philosophy</h2>
            <p>
              Connected applications can involve APIs, databases, third-party tools and AI models with different access boundaries.
              Project scoping should identify sensitive information, permitted actions and the review needed before release.
              The controls and validation work depend on the system and its operating context.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>2. Engineering Areas of Focus</h2>
            <p>Depending on the project, planning and implementation may include:</p>
            <ul>
              <li><strong>Access boundaries:</strong> Scope user, integration and agent permissions to the actions they need.</li>
              <li><strong>Credential handling:</strong> Keep private credentials out of public browser code and choose an appropriate storage approach.</li>
              <li><strong>Environment separation:</strong> Plan development, testing and production access around the data each environment needs.</li>
              <li><strong>Human review:</strong> Define validation and approval steps for consequential automated actions.</li>
              <li><strong>Input and output checks:</strong> Validate relevant inputs and model outputs alongside authorization and error handling to reduce risk.</li>
              <li><strong>Operational visibility:</strong> Plan useful logs and monitoring while limiting unnecessary collection of sensitive information.</li>
            </ul>
          </section>

          <section className="legal-section-block">
            <h2>3. Responsible Vulnerability Disclosure</h2>
            <p>
              We welcome reports from independent security researchers and users who identify potential vulnerabilities
              across our public web properties.
            </p>
            <p>
              If you believe you have discovered a security issue involving <code>lexvaxa.com</code>, please notify our engineering team
              at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with:
            </p>
            <ul>
              <li>A clear description of the vulnerability and its potential impact.</li>
              <li>Detailed, reproducible steps or a proof of concept (PoC).</li>
              <li>Affected URL paths and request payloads.</li>
            </ul>
            <p>
              <strong>Responsible Conduct Guidelines:</strong> Please give us a reasonable opportunity to investigate and remediate the issue
              before sharing any details publicly. Do not access, modify, or exfiltrate data that does not belong to you,
              and avoid actions that could degrade service availability for others.
            </p>
          </section>

          <section className="legal-section-block">
            <h2>4. Continuous Improvement</h2>
            <p>
              Security review, dependency updates and deployment checks should be revisited as a system changes.
              The depth and frequency of that work depend on the project and its maintenance scope.
            </p>
          </section>
        </article>
      </div>

      <CallToAction title="Discuss a technical review." />
    </>
  );
}
