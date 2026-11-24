import { BarChart3, BellRing, BookOpen, Boxes, CalendarClock, CalendarX, Database, FilePen, FileText, GitBranch, Inbox, Megaphone, MessagesSquare, PenLine, Receipt, RefreshCw, ShieldCheck, Star, UserMinus, UserPlus, type LucideIcon } from 'lucide-react';
import type { IndustryPain, PainIcon } from '@/lib/data/industry-pains';
import styles from './industry-pains.module.css';

const icons: Record<PainIcon, LucideIcon> = {
  data: Database, payments: Receipt, docs: FileText, quotes: FilePen, reviews: Star, noshow: CalendarX, email: Inbox, reporting: BarChart3,
  scheduling: CalendarClock, alerts: BellRing, compliance: ShieldCheck, churn: UserMinus, support: MessagesSquare, renewals: RefreshCw,
  routing: GitBranch, knowledge: BookOpen, inventory: Boxes, content: PenLine, onboarding: UserPlus, social: Megaphone,
};

/** A compact matrix of everyday problems in an industry and the fix for each. Server-rendered, no JavaScript. */
export function IndustryPains({ pains, label }: { pains: IndustryPain[]; label: string }) {
  if (!pains?.length) return null;
  return <div className={styles.wrap}>
    <div className={styles.head}>
      <h3>More problems we solve in {label.toLowerCase()}</h3>
      <p aria-hidden="true"><span>Problem</span><i />Fix</p>
    </div>
    <ul className={styles.grid}>
      {pains.map((item) => {
        const Icon = icons[item.icon];
        return <li key={item.pain} className={styles.cell}>
          <span className={styles.icon}><Icon size={17} aria-hidden="true" /></span>
          <div><b>{item.pain}</b><p>{item.fix}</p></div>
        </li>;
      })}
    </ul>
  </div>;
}
