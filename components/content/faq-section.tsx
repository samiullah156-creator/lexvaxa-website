import { JsonLd } from '@/components/content/json-ld';
import { Eyebrow } from '@/components/ui';

export type Faq = { question: string; answer: string };

/**
 * Questions and answers with matching FAQPage structured data, so the same words a visitor
 * reads are the ones search engines and AI assistants can quote.
 */
export function FaqSection({ id, eyebrow = 'Common questions', title, faqs, soft = false }: { id: string; eyebrow?: string; title: string; faqs: Faq[]; soft?: boolean }) {
  return (
    <section className={`section ${soft ? 'section-soft' : ''}`} aria-labelledby={id}>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) }} />
      <div className="container faq-layout">
        <div><Eyebrow>{eyebrow}</Eyebrow><h2 id={id}>{title}</h2></div>
        <div className="faq-list">
          {faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}
        </div>
      </div>
    </section>
  );
}
