'use client';

import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { SITE } from '@/lib/site';

type Role = { slug: string; title: string };

const API = (process.env.NEXT_PUBLIC_CMS_URL ?? '').replace(/\/$/, '');
const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const EXPERIENCE = ['Student or graduate', 'Under 2 years', '2 to 4 years', '5 to 7 years', '8+ years'];

const sizeLabel = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);
const fileProblem = (file: File) => {
  if (!/\.(pdf|docx?)$/i.test(file.name)) return 'Please upload a PDF or Word document.';
  if (file.size > MAX_BYTES) return `That file is ${sizeLabel(file.size)}. The limit is 4 MB.`;
  if (file.size === 0) return 'That file is empty.';
  return '';
};

/**
 * Job application with a CV upload. The CV goes straight to the Lexvaxa admin, where only the
 * team can download it. Without the backend connected, visitors are pointed to email instead.
 */
export function CareerApplicationForm({ roles, defaultRole = '' }: { roles: Role[]; defaultRole?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);

  function choose(next: File | undefined | null) {
    if (!next) return;
    const problem = fileProblem(next);
    setFileError(problem);
    setFile(problem ? null : next);
  }
  const onPick = (event: ChangeEvent<HTMLInputElement>) => choose(event.currentTarget.files?.[0]);
  const onDrop = (event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files?.[0]); };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form || sending) return;
    if (!file) { setFileError('Attach your CV (PDF or Word, up to 4 MB).'); fileRef.current?.focus(); return; }
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    data.delete('cv');
    data.append('cv', file, file.name);
    setSending(true);
    setStatus('Sending your application…');
    try {
      const response = await fetch(`${API}/api/public/careers/applications`, { method: 'POST', body: data, signal: AbortSignal.timeout(30000) });
      if (!response.ok) {
        const reason = (await response.json().catch(() => null))?.error?.message as string | undefined;
        setStatus(reason ?? 'We could not send your application just now. Please try again in a moment, or email your CV to us.');
        return;
      }
      setSent({ name: String(data.get('name') ?? '').trim().split(/\s+/)[0], email: String(data.get('email') ?? '').trim() });
      setStatus('');
    } catch {
      setStatus(`We could not reach our server. Please try again, or email your CV to ${SITE.email}.`);
    } finally {
      setSending(false);
    }
  }

  if (!API) {
    return <div className="apply-offline">
      <p>Email your CV and a few lines about the work you want to do to <a href={`mailto:${SITE.email}?subject=${encodeURIComponent('Application: ' + (roles.find((role) => role.slug === defaultRole)?.title ?? 'General application'))}`}>{SITE.email}</a>. We reply to every application.</p>
    </div>;
  }

  if (sent) {
    return <div className="enquiry-sent" role="status">
      <span className="enquiry-sent-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
      <h3>Thanks, {sent.name}. Your application is with us.</h3>
      <p>A person on the team reads every CV. You will hear from us at <b>{sent.email}</b> within ten working days, whatever the outcome.</p>
      <div className="enquiry-draft-actions">
        <Link className="button" href="/work">See what we build <ArrowRight size="1em" className="inline-icon" aria-hidden="true" /></Link>
        <button className="button button-outline" type="button" onClick={() => { setSent(null); setFile(null); }}>Send another application</button>
      </div>
    </div>;
  }

  return <form className="project-form apply-form" ref={formRef} onSubmit={submit}>
    <div className="field">
      <label htmlFor="apply-role">Role <span aria-hidden="true">*</span></label>
      <select id="apply-role" name="job" defaultValue={defaultRole}>
        {roles.map((role) => <option key={role.slug} value={role.slug}>{role.title}</option>)}
        <option value="">General application</option>
      </select>
    </div>
    <div className="form-grid">
      <div className="field">
        <label htmlFor="apply-name">Full name <span aria-hidden="true">*</span></label>
        <input id="apply-name" name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="Your full name" />
      </div>
      <div className="field">
        <label htmlFor="apply-email">Email <span aria-hidden="true">*</span></label>
        <input id="apply-email" name="email" type="email" autoComplete="email" required maxLength={160} placeholder="you@example.com" />
      </div>
      <div className="field">
        <label htmlFor="apply-phone">Phone <small>(optional)</small></label>
        <input id="apply-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+92 300 0000000" />
      </div>
      <div className="field">
        <label htmlFor="apply-location">City and country <span aria-hidden="true">*</span></label>
        <input id="apply-location" name="location" autoComplete="address-level2" required maxLength={120} placeholder="Lahore, Pakistan" />
      </div>
      <div className="field">
        <label htmlFor="apply-experience">Experience <span aria-hidden="true">*</span></label>
        <select id="apply-experience" name="experience" required defaultValue="">
          <option value="" disabled>Select</option>
          {EXPERIENCE.map((value) => <option key={value}>{value}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="apply-notice">Notice period <small>(optional)</small></label>
        <input id="apply-notice" name="noticePeriod" maxLength={60} placeholder="Immediately, 1 month…" />
      </div>
      <div className="field">
        <label htmlFor="apply-linkedin">LinkedIn <small>(optional)</small></label>
        <input id="apply-linkedin" name="linkedin" type="url" maxLength={300} placeholder="https://linkedin.com/in/…" />
      </div>
      <div className="field">
        <label htmlFor="apply-portfolio">GitHub or portfolio <small>(optional)</small></label>
        <input id="apply-portfolio" name="portfolio" type="url" maxLength={300} placeholder="https://" />
      </div>
    </div>

    <div className="field">
      <span className="field-label" id="apply-cv-label">CV <span aria-hidden="true">*</span></span>
      <label className="cv-drop" data-dragging={dragging} data-filled={Boolean(file)} data-error={Boolean(fileError)}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        <input ref={fileRef} type="file" name="cv" accept={ACCEPT} onChange={onPick} aria-labelledby="apply-cv-label" aria-describedby="apply-cv-hint" />
        <span className="cv-drop-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4h10l6 6v18H9z" /><path d="M19 4v6h6" />{file ? <path d="M13 19l3 3 5-6" /> : <><path d="M17 24v-8" /><path d="M14 19l3-3 3 3" /></>}</svg>
        </span>
        {file
          ? <span className="cv-drop-text"><b>{file.name}</b><small>{sizeLabel(file.size)} · click to replace</small></span>
          : <span className="cv-drop-text"><b>Drop your CV here, or click to choose</b><small>PDF or Word, up to 4 MB</small></span>}
      </label>
      <p id="apply-cv-hint" className={fileError ? 'field-hint field-hint-error' : 'field-hint'} role={fileError ? 'alert' : undefined}>{fileError || 'Only the hiring team can open it.'}</p>
    </div>

    <div className="field">
      <label htmlFor="apply-note">A few lines about you <small>(optional)</small></label>
      <textarea id="apply-note" name="coverLetter" rows={4} maxLength={5000} placeholder="What have you built that you are proud of? What do you want to work on next?" />
    </div>
    {/* Kept out of sight and out of the tab order; people never reach it. */}
    <div className="enquiry-trap" aria-hidden="true"><label htmlFor="apply-fax">Fax</label><input id="apply-fax" name="fax" type="text" tabIndex={-1} autoComplete="off" /></div>
    <label className="apply-consent">
      <input type="checkbox" name="consent" value="true" required />
      <span>I agree that Lexvaxa may store my application and CV for up to 12 months to consider me for this and similar roles. See the <Link href="/privacy">privacy policy</Link>.</span>
    </label>
    <button className="button enquiry-submit" type="submit" disabled={sending} aria-busy={sending}>{sending ? 'Sending…' : <>Send application <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></>}</button>
    <p className="form-note enquiry-draft-status" role="status">{status}</p>
  </form>;
}
