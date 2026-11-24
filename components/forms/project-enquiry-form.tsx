'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { services } from '@/lib/data/services';

interface PreparedDraft {
  text: string;
  mailto: string;
}

const ENQUIRY_TYPES = [
  ...services.map((service) => ({ value: service.slug, label: service.shortName })),
  { value: 'general', label: 'General enquiry' },
  { value: 'partnership', label: 'Partnership' },
];
const BUDGETS = ['Under $5k', '$5k to $15k', '$15k to $40k', '$40k +', 'Not sure yet'];
const TIMELINES = ['As soon as possible', '1 to 3 months', '3 to 6 months', 'Just exploring'];
const SOURCES = ['Google search', 'ChatGPT, Gemini or another AI assistant', 'LinkedIn', 'Referral or recommendation', 'Social media', 'Event or community', 'Other'];

type Fields = { type: string; name: string; email: string; company: string; website: string; country: string; phone: string; source: string; message: string; budget: string; timeline: string };
const EMPTY: Fields = { type: '', name: '', email: '', company: '', website: '', country: '', phone: '', source: '', message: '', budget: '', timeline: '' };

/** Address of the admin backend. When it is not configured the form only prepares an email draft. */
const ENQUIRY_API = (process.env.NEXT_PUBLIC_CMS_URL ?? '').replace(/\/$/, '');

/**
 * Project enquiry form.
 * With the backend connected, "Send enquiry" stores the enquiry for the team. Email stays
 * available as the visitor's choice, and takes over automatically if sending fails, so an
 * enquiry is never lost to a server problem.
 */
export function ProjectEnquiryForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [preparedDraft, setPreparedDraft] = useState<PreparedDraft | null>(null);
  const [draftStatus, setDraftStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const draftTextRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const trapRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('service');
    if (slug && services.some((service) => service.slug === slug)) setFields((current) => ({ ...current, type: slug }));
  }, []);

  function update(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    event.currentTarget.setCustomValidity('');
    const { name, value } = event.currentTarget;
    setFields((current) => ({ ...current, [name]: value }));
    setPreparedDraft(null);
    setDraftStatus('');
  }

  /** Runs the browser's own validation, plus the minimum message length. */
  function valid() {
    const form = formRef.current;
    if (!form) return false;
    const message = form.elements.namedItem('message') as HTMLTextAreaElement;
    message.setCustomValidity(fields.message.trim().length >= 15 ? '' : 'Describe your enquiry using at least 15 characters.');
    return form.reportValidity();
  }

  function buildDraft(): PreparedDraft {
    const type = ENQUIRY_TYPES.find((entry) => entry.value === fields.type)?.label ?? 'General enquiry';
    const subject = `Enquiry: ${type} from ${fields.name.trim()}`;
    const body = [
      `Enquiry type: ${type}`,
      `Full name: ${fields.name.trim()}`,
      `Email: ${fields.email.trim()}`,
      `Company or organization: ${fields.company.trim() || 'Not provided'}`,
      `Website: ${fields.website.trim() || 'Not provided'}`,
      `Country or region: ${fields.country.trim()}`,
      `Phone: ${fields.phone.trim() || 'Not provided'}`,
      `Budget: ${fields.budget || 'Not provided'}`,
      `Timeline: ${fields.timeline || 'Not provided'}`,
      `Heard about Lexvaxa through: ${fields.source}`,
      '',
      'Enquiry:',
      fields.message.trim(),
    ].join('\n');
    return {
      text: `To: ${SITE.email}\nSubject: ${subject}\n\n${body}`,
      mailto: 'mailto:' + SITE.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body),
    };
  }

  function prepareEmail() {
    if (!valid()) return;
    setPreparedDraft(buildDraft());
    setDraftStatus('Your email is ready to review. Nothing has been sent yet.');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ENQUIRY_API) return prepareEmail();
    if (!valid() || sending) return;
    setSending(true);
    setPreparedDraft(null);
    setDraftStatus('Sending your enquiry…');
    try {
      const response = await fetch(`${ENQUIRY_API}/api/public/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: fields.name, email: fields.email, company: fields.company, website: fields.website, country: fields.country, phone: fields.phone,
          enquiryType: fields.type, source: fields.source, message: fields.message, budget: fields.budget, timeline: fields.timeline, pageUrl: window.location.pathname + window.location.search,
          // Hidden field that only automated form fillers complete.
          fax: trapRef.current?.value ?? '',
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) {
        const reason = (await response.json().catch(() => null))?.error?.message as string | undefined;
        // A message the visitor can fix (for example an invalid email) is shown as it is.
        if (response.status === 400 && reason) { setDraftStatus(reason); return; }
        throw new Error(reason ?? `Request failed (${response.status})`);
      }
      setSent(true);
      setDraftStatus('');
    } catch {
      setPreparedDraft(buildDraft());
      setDraftStatus('We could not send this from the website just now. Your enquiry is ready below to send by email instead; nothing has been lost.');
    } finally {
      setSending(false);
    }
  }

  async function copyDraft() {
    if (!preparedDraft) return;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(preparedDraft.text);
        setDraftStatus('Copied. Paste it into a new email when you are ready.');
        return;
      } catch {
        // The selectable draft below also works when clipboard access is unavailable.
      }
    }
    draftTextRef.current?.focus();
    draftTextRef.current?.select();
    setDraftStatus('Draft selected. Use your device’s copy command, then paste it into an email.');
  }

  if (sent) {
    return (
      <div className="enquiry-sent" role="status">
        <span className="enquiry-sent-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
        <h3>Thank you, {fields.name.trim().split(/\s+/)[0]}. Your enquiry has reached us.</h3>
        <p>We read every message ourselves and reply to <b>{fields.email.trim()}</b>. If your project is time-sensitive, you can also book a call below or message us on WhatsApp.</p>
        <div className="enquiry-draft-actions">
          <a className="button" href="#schedule-title">Book a discovery call <ArrowDown size="1em" className="inline-icon" aria-hidden="true" /></a>
          <button className="button button-outline" type="button" onClick={() => { setSent(false); setFields(EMPTY); }}>Send another enquiry</button>
        </div>
      </div>
    );
  }

  return (
    <form className="project-form enquiry-form" onSubmit={submit} ref={formRef}>
      <fieldset className="choice-group">
        <legend>What can we help with? <span aria-hidden="true">*</span></legend>
        <div className="choice-tiles">
          {ENQUIRY_TYPES.map((entry, index) => <label key={entry.value} className="choice-tile">
            <input type="radio" name="type" value={entry.value} required={index === 0} checked={fields.type === entry.value} onChange={update} />
            <span>{entry.label}</span>
          </label>)}
        </div>
      </fieldset>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="lead-name">Full name <span aria-hidden="true">*</span></label>
          <input id="lead-name" name="name" autoComplete="name" required minLength={2} maxLength={100} value={fields.name} onChange={update} placeholder="Enter your full name" />
        </div>
        <div className="field">
          <label htmlFor="lead-email">Email address <span aria-hidden="true">*</span></label>
          <input id="lead-email" name="email" type="email" autoComplete="email" required maxLength={150} value={fields.email} onChange={update} placeholder="name@company.com" />
        </div>
        <div className="field">
          <label htmlFor="lead-company">Company or organization <small>(optional)</small></label>
          <input id="lead-company" name="company" autoComplete="organization" maxLength={120} value={fields.company} onChange={update} placeholder="Enter company or organization" />
        </div>
        <div className="field">
          <label htmlFor="lead-website">Website <small>(optional)</small></label>
          <input id="lead-website" name="website" type="url" autoComplete="url" maxLength={200} value={fields.website} onChange={update} placeholder="https://example.com" />
        </div>
        <div className="field">
          <label htmlFor="lead-country">Country or region <span aria-hidden="true">*</span></label>
          <input id="lead-country" name="country" autoComplete="country-name" required maxLength={80} value={fields.country} onChange={update} placeholder="Enter your country or region" />
        </div>
        <div className="field">
          <label htmlFor="lead-phone">Phone number <small>(optional)</small></label>
          <input id="lead-phone" name="phone" type="tel" autoComplete="tel" maxLength={30} value={fields.phone} onChange={update} placeholder="+1 555 000 0000" aria-describedby="lead-phone-hint" />
          <p id="lead-phone-hint" className="field-hint">Include your country code.</p>
        </div>
      </div>
      <div className="form-grid">
        <fieldset className="choice-group">
          <legend>Budget <small>(optional)</small></legend>
          <div className="choice-chips">{BUDGETS.map((value) => <label key={value} className="choice-chip"><input type="radio" name="budget" value={value} checked={fields.budget === value} onChange={update} /><span>{value}</span></label>)}</div>
        </fieldset>
        <fieldset className="choice-group">
          <legend>Timeline <small>(optional)</small></legend>
          <div className="choice-chips">{TIMELINES.map((value) => <label key={value} className="choice-chip"><input type="radio" name="timeline" value={value} checked={fields.timeline === value} onChange={update} /><span>{value}</span></label>)}</div>
        </fieldset>
      </div>
      <div className="field">
        <label htmlFor="lead-source">How did you hear about Lexvaxa? <span aria-hidden="true">*</span></label>
        <select id="lead-source" name="source" required value={fields.source} onChange={update}>
          <option value="" disabled>Select one</option>
          {SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="lead-message">Tell us about your enquiry <span aria-hidden="true">*</span></label>
        <textarea id="lead-message" name="message" required minLength={15} maxLength={1500} rows={5} value={fields.message} onChange={update}
          placeholder="Tell us how Lexvaxa can help: the goal, the systems involved and your timeline. Please do not include passwords or sensitive personal data." />
      </div>
      {/* Kept out of sight and out of the tab order; people never reach it. */}
      <div className="enquiry-trap" aria-hidden="true"><label htmlFor="lead-fax">Fax</label><input ref={trapRef} id="lead-fax" name="fax" type="text" tabIndex={-1} autoComplete="off" /></div>

      {ENQUIRY_API ? <>
        <button className="button enquiry-submit" type="submit" disabled={sending} aria-busy={sending}>{sending ? 'Sending…' : <>Send enquiry <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></>}</button>
        <p className="form-note">
          Sending this form shares the details above with Lexvaxa so we can reply; see our <Link href="/privacy">privacy policy</Link>. Prefer your own inbox?{' '}
          <button type="button" className="enquiry-link" onClick={prepareEmail}>Prepare an email instead</button> or write to <a href={'mailto:' + SITE.email}>{SITE.email}</a>.
        </p>
      </> : <>
        <button className="button enquiry-submit" type="submit">Prepare my enquiry <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></button>
        <p className="form-note">
          Your email app opens with the details filled in, so you stay in control of what is sent. You can also write to{' '}
          <a href={'mailto:' + SITE.email}>{SITE.email}</a> directly.
        </p>
      </>}
      <p className="form-note enquiry-draft-status" role="status">{draftStatus}</p>

      {preparedDraft && (
        <section className="enquiry-draft" aria-labelledby="enquiry-draft-heading">
          <h3 id="enquiry-draft-heading">Your enquiry is ready</h3>
          <div className="enquiry-draft-actions">
            <a className="button" href={preparedDraft.mailto}>Open in email app <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></a>
            <button className="button button-outline" type="button" onClick={copyDraft}>Copy text</button>
          </div>
          <div className="field">
            <label htmlFor="prepared-enquiry">Email draft</label>
            <textarea id="prepared-enquiry" className="enquiry-draft-text" ref={draftTextRef} value={preparedDraft.text} readOnly rows={10} spellCheck={false} />
          </div>
        </section>
      )}
    </form>
  );
}
