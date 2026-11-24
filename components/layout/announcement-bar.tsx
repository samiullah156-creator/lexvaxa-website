import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cmsAnnouncement } from '@/lib/cms';

/** One-line site notice managed from the admin panel. Renders nothing while it is switched off. */
export async function AnnouncementBar() {
  const notice = await cmsAnnouncement();
  if (!notice.enabled) return null;
  const hasLink = Boolean(notice.linkLabel && notice.linkHref);
  return (
    <aside className="announcement" aria-label="Announcement">
      <div className="container">
        <p>{notice.text}</p>
        {hasLink && (notice.linkHref.startsWith('/')
          ? <Link href={notice.linkHref}>{notice.linkLabel} <ArrowRight size="1em" className="inline-icon" aria-hidden="true" /></Link>
          : <a href={notice.linkHref} target="_blank" rel="noopener noreferrer">{notice.linkLabel} <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>)}
      </div>
    </aside>
  );
}
