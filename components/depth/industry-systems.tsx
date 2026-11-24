'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Bell, Check, Mail, MessageSquare, Phone, PhoneCall, RotateCcw, Zap } from 'lucide-react';
import { systemStories, type IndustrySystemsData } from '@/lib/data/industry-systems';
import styles from './industry-systems.module.css';

const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties;

function channelIcon(text: string) {
  if (/SMS|WhatsApp/i.test(text)) return MessageSquare;
  if (/call/i.test(text) && /task/i.test(text)) return Phone;
  if (/email|deck|guide|proposal|quote|checklist|brochure|confirmation/i.test(text)) return Mail;
  return Bell;
}

function CallScene({ data }: { data: IndustrySystemsData['call'] }) {
  return <div className={`${styles.device} ${styles.phone}`}>
    <div className={styles.callHead}>
      <span className={styles.ring}><PhoneCall size={16} aria-hidden="true" /></span>
      <span className={styles.caller}><b>Incoming call</b><small>{data.caller}</small></span>
      <span className={styles.wave} aria-hidden="true"><i /><i /><i /><i /><i /></span>
    </div>
    <span className={`${styles.answered} ${styles.anim}`} style={delay(0.35)}>AI agent answered on the first ring</span>
    <ol className={styles.transcript}>{data.lines.map((line, index) => <li key={line.text} data-who={line.who} className={styles.anim} style={delay(0.9 + index * 0.85)}><small>{line.who === 'agent' ? 'AI agent' : 'Caller'}</small>{line.text}</li>)}</ol>
    <span className={`${styles.outcome} ${styles.anim}`} style={delay(0.9 + data.lines.length * 0.85)}><Check size={14} aria-hidden="true" />{data.outcome}</span>
  </div>;
}

function LeadScene({ data }: { data: IndustrySystemsData['lead'] }) {
  const end = 0.6 + data.fields.length * 0.45;
  return <div className={styles.device}>
    <div className={styles.deviceBar}><span className={styles.live} /> New lead <small>{data.source}</small></div>
    <ul className={styles.fields}>{data.fields.map(([label, value], index) => <li key={label} className={styles.anim} style={delay(0.5 + index * 0.45)}>
      <span>{label}</span><b>{value}</b><Check size={14} aria-hidden="true" />
    </li>)}</ul>
    <div className={styles.score}>
      <span className={styles.scoreTop}><span>Fit score</span><b className={styles.anim} style={delay(end + 0.7)}>{data.score} / 100</b></span>
      <span className={styles.meter}><i className={styles.fill} style={{ ...delay(end), '--s': data.score / 100 } as CSSProperties} /></span>
    </div>
    <span className={`${styles.outcome} ${styles.anim}`} style={delay(end + 1.1)}><Zap size={14} aria-hidden="true" />{data.route}</span>
  </div>;
}

function FollowUpScene({ data }: { data: IndustrySystemsData['followUp'] }) {
  return <div className={styles.device}>
    <div className={styles.deviceBar}><span className={styles.live} /> Follow-up sequence <small>Stops when they reply</small></div>
    <ol className={styles.timeline}>{data.steps.map(([when, what], index) => { const Icon = channelIcon(what); return <li key={what} className={styles.anim} style={delay(0.5 + index * 0.7)}>
      <span className={styles.when}>{when}</span>
      <span className={styles.node}><Icon size={13} aria-hidden="true" /></span>
      <span className={styles.what}>{what}</span>
      <Check className={styles.tick} size={14} aria-hidden="true" />
    </li>; })}</ol>
    <span className={`${styles.outcome} ${styles.anim}`} style={delay(0.6 + data.steps.length * 0.7)}><Check size={14} aria-hidden="true" />{data.outcome}</span>
  </div>;
}

function SignatureScene({ data }: { data: IndustrySystemsData['signature'] }) {
  return <div className={styles.device}>
    <div className={styles.deviceBar}><span className={styles.live} /> {data.name} <small>Automated</small></div>
    <ol className={styles.pipeline}>{data.steps.map((step, index) => <li key={step} className={styles.anim} style={delay(0.5 + index * 0.75)}>
      <span className={styles.stepNo}>{String(index + 1).padStart(2, '0')}</span><span>{step}</span>
    </li>)}</ol>
    <span className={styles.track} aria-hidden="true"><i className={styles.fill} style={{ ...delay(0.5), '--s': 1 } as CSSProperties} /></span>
    <span className={`${styles.outcome} ${styles.anim}`} style={delay(0.6 + data.steps.length * 0.75)}><Check size={14} aria-hidden="true" />{data.tagline}</span>
  </div>;
}

/**
 * The systems an industry needs most, each paired with the pain point it removes. Tabs switch the
 * system; the open scene plays once when it scrolls into view (transform/opacity only) and can be
 * replayed. Closed panels are display:none, so they cost nothing, and all text is server-rendered.
 */
export function IndustrySystems({ data, label }: { data: IndustrySystemsData; label: string }) {
  const stories = systemStories(data);
  const [active, setActive] = useState(0);
  const [stage, setStage] = useState<'idle' | 'armed' | 'play'>('idle');
  const [run, setRun] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const element = root.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStage('play'); observer.disconnect(); }
    }, { threshold: 0.3 });
    // Only hide the scene for its entrance if it starts below the fold.
    if (element.getBoundingClientRect().top > window.innerHeight * 0.8) setStage('armed');
    else setStage('play');
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const select = (index: number) => { setActive(index); tabs.current[index]?.focus(); };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (event.key in keys) { event.preventDefault(); select((active + keys[event.key] + stories.length) % stories.length); }
    else if (event.key === 'Home') { event.preventDefault(); select(0); }
    else if (event.key === 'End') { event.preventDefault(); select(stories.length - 1); }
  };

  return <div ref={root} className={styles.systems} data-stage={stage}>
    <div className={styles.tabs} role="tablist" aria-label={`Systems for ${label}`} aria-orientation="vertical">
      {stories.map((story, index) => <button key={story.key} ref={(node) => { tabs.current[index] = node; }} type="button" role="tab" id={`sys-tab-${story.key}`} aria-controls={`sys-panel-${story.key}`} aria-selected={index === active} tabIndex={index === active ? 0 : -1} className={styles.tab} onClick={() => setActive(index)} onKeyDown={onKey}>
        <span className={styles.tabNo}>{String(index + 1).padStart(2, '0')}</span>
        <span className={styles.tabText}><b>{story.name}</b><small>{story.tagline}</small></span>
      </button>)}
    </div>
    {stories.map((story, index) => <div key={story.key} role="tabpanel" id={`sys-panel-${story.key}`} aria-labelledby={`sys-tab-${story.key}`} hidden={index !== active} className={styles.panel}>
      <div className={styles.stage}>
        <div key={run} className={styles.scene} aria-hidden="true">
          {story.key === 'call' && <CallScene data={data.call} />}
          {story.key === 'lead' && <LeadScene data={data.lead} />}
          {story.key === 'followUp' && <FollowUpScene data={data.followUp} />}
          {story.key === 'signature' && <SignatureScene data={data.signature} />}
        </div>
        <button type="button" className={styles.replay} onClick={() => setRun((value) => value + 1)}><RotateCcw size={13} aria-hidden="true" /> Replay</button>
        <span className={styles.note}>Example scenario</span>
      </div>
      <dl className={styles.story}>
        <div data-kind="pain"><dt>The problem</dt><dd>{story.pain}</dd></div>
        <div data-kind="build"><dt>What we build</dt><dd>{story.build}</dd></div>
        <div data-kind="result"><dt>The result</dt><dd>{story.result}</dd></div>
      </dl>
    </div>)}
  </div>;
}
