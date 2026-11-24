'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ArrowUpRight, CalendarDays, X } from 'lucide-react';
import { SITE } from '@/lib/site';

const EMBED = `${SITE.calendlyUrl}?hide_gdpr_banner=1&hide_landing_page_details=1&primary_color=167dfe`;

/** Plain clicks open the popup; modified clicks (new tab/window) keep the normal link behaviour. */
const opensInPage = (event: MouseEvent | globalThis.MouseEvent) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

/**
 * Fixed right-edge tab on every page. Booking opens in an on-site popup with the Calendly scheduler,
 * so visitors stay on Lexvaxa. Any link marked `data-book-call` uses the same popup. Without
 * JavaScript the tab is still a normal link to the booking page.
 */
export function BookCallTab() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);

  const open = () => { setLoaded(true); if (!dialog.current?.open) dialog.current?.showModal(); };

  useEffect(() => {
    const onClick = (event: globalThis.MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[data-book-call]');
      if (!link || !opensInPage(event)) return;
      event.preventDefault();
      open();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return <>
    <a href={SITE.calendlyUrl} className="book-call-tab" aria-haspopup="dialog" aria-label="Book a free call, 30 minutes"
      onClick={(event) => { if (!opensInPage(event)) return; event.preventDefault(); open(); }}>
      <CalendarDays size={16} strokeWidth={2} aria-hidden="true" />
      <span>Book a free call</span>
    </a>
    <dialog ref={dialog} className="booking-dialog" aria-labelledby="booking-dialog-title"
      onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="booking-dialog-panel">
        <header>
          <div><p>30-minute discovery call</p><h2 id="booking-dialog-title">Book a free call with Lexvaxa</h2></div>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close booking"><X size={20} aria-hidden="true" /></button>
        </header>
        <div className="booking-dialog-frame">
          {loaded && <iframe src={EMBED} title="Book a 30-minute discovery call with Lexvaxa" referrerPolicy="strict-origin-when-cross-origin" />}
        </div>
        <p className="booking-dialog-fallback">Calendar not loading? <a href={SITE.calendlyUrl} target="_blank" rel="noopener noreferrer">Open the booking page <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /></a></p>
      </div>
    </dialog>
  </>;
}
