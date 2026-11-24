'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Briefcase, ChevronDown, Menu, X } from 'lucide-react';
import { services } from '@/lib/data/services';
import { industries } from '@/lib/data/industries';
import { MegaMenu } from './mega-menu';
import { NavPanel, type NavLatest } from './nav-panel';
import { ServiceBadge } from '../depth/service-badge';
import { INDUSTRY_ICONS } from '../depth/industry-badge';


type MenuName = 'what' | 'who' | 'think';
const MENUS: { name: MenuName; label: string; match: (path: string) => boolean }[] = [
  { name: 'what', label: 'What We Do', match: (path) => path.startsWith('/services') || path.startsWith('/industries') },
  { name: 'who', label: 'Who We Are', match: (path) => ['/about', '/work', '/careers', '/contact'].some((base) => path.startsWith(base)) },
  { name: 'think', label: 'What We Think', match: (path) => path.startsWith('/insights') },
];

/** Header: three plain-word menus (like large consultancies use) and one call to action. */
export function Header({ latest = [] }: { latest?: readonly NavLatest[] }) {
  const [open, setOpen] = useState<MenuName | null>(null);
  const buttons = useRef<Partial<Record<MenuName, HTMLButtonElement | null>>>({});
  const closeTimer = useRef<number | undefined>(undefined);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const homeLink = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // The bar tightens and gains a soft shadow once the page moves, so it stays readable over content.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Close overlays on route change
  useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
  }, [pathname]);

  // Mega menu: Escape returns focus to its trigger; a click outside closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(null); buttons.current[open]?.focus(); } };
    const onPointer = (event: PointerEvent) => { if (!(event.target as Element).closest('.mega-trigger')) setOpen(null); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); };
  }, [open]);

  function openMenu(name: MenuName) { window.clearTimeout(closeTimer.current); setOpen(name); }
  function scheduleClose() { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setOpen(null), 160); }

  // Native modal dialogs contain keyboard focus and make the background inert.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !mobileOpen) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    dialog.querySelector<HTMLButtonElement>('.nav-overlay-close-btn')?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      const returnTarget = opener?.isConnected && opener.getClientRects().length ? opener : homeLink.current;
      returnTarget?.focus({ preventScroll: true });
    };
  }, [mobileOpen]);

  function closeNavigation() {
    setOpen(null);
    setMobileOpen(false);
  }

  return (
    <>
      <header className="site-header" data-scrolled={scrolled || undefined}>
        <div className="container header-inner">
          {/* Logo */}
          <Link ref={homeLink} href="/" aria-label="Lexvaxa home" className="brand">
            <Image
              src="/brand/lexvaxa-logo.svg"
              alt="Lexvaxa: Engineering With Intelligence"
              width={187}
              height={48}
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation: three menus in plain words */}
          <nav className="desktop-nav desktop-only" aria-label="Primary navigation">
            {MENUS.map((menu) => <div key={menu.name} className="mega-trigger" onPointerEnter={(event) => { if (event.pointerType === 'mouse') openMenu(menu.name); }} onPointerLeave={(event) => { if (event.pointerType === 'mouse') scheduleClose(); }}>
              <button
                ref={(node) => { buttons.current[menu.name] = node; }}
                type="button"
                aria-expanded={open === menu.name}
                aria-controls={`${menu.name}-menu`}
                onClick={(event) => setOpen((value) => (event.detail === 0 ? (value === menu.name ? null : menu.name) : menu.name))}
                className="nav-dropdown-trigger"
                data-current={menu.match(pathname) || undefined}
              >
                <span>{menu.label}</span>
                <ChevronDown className="dropdown-chevron" style={{ transform: open === menu.name ? 'rotate(180deg)' : 'none' }} aria-hidden="true" />
              </button>
              {open === menu.name && (menu.name === 'what'
                ? <MegaMenu id="what-menu" onNavigate={() => setOpen(null)} />
                : <NavPanel id={`${menu.name}-menu`} kind={menu.name} latest={latest} onNavigate={() => setOpen(null)} />)}
            </div>)}
          </nav>

          {/* Header Action CTA */}
          <div className="desktop-only">
            <Link href="/contact" className="button button-small header-cta">
              Start a project <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="mobile-only">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              aria-controls={mobileOpen ? 'mobile-navigation' : undefined}
              className="mobile-menu-toggle"
            >
              {mobileOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <dialog
          ref={dialogRef}
          id="mobile-navigation"
          onCancel={closeNavigation}
          className="mobile-navigation-dialog"
          aria-label="Mobile Navigation"
        >
          <div className="nav-overlay-topbar">
            <Link href="/" onClick={() => setMobileOpen(false)} className="brand">
              <Image
                src="/brand/lexvaxa-logo.svg"
                alt="Lexvaxa"
                width={160}
                height={42}
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="nav-overlay-close-btn"
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="mobile-navigation-links">
            <Link href="/" onClick={closeNavigation} className="mobile-navlink">Home</Link>
            <div>
              <span className="mobile-section-header">CAPABILITIES</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {services.map((s) => {
                  return (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="mobile-sublink"
                    >
                      <ServiceBadge slug={s.slug} size="sm" />
                      <span>{s.shortName || s.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="mobile-section-header">INDUSTRIES</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {industries.map((ind) => {
                  const Icon = INDUSTRY_ICONS[ind.slug] || Briefcase;
                  return (
                    <Link
                      key={ind.slug}
                      href={`/industries/${ind.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="mobile-sublink"
                    >
                      <Icon style={{ width: '16px', height: '16px', color: '#167dfe', flexShrink: 0 }} />
                      <span>{ind.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mobile-company-links">
              <Link href="/work" onClick={() => setMobileOpen(false)} className="mobile-navlink">
                Our Work
              </Link>
              <Link href="/about" onClick={() => setMobileOpen(false)} className="mobile-navlink">
                About
              </Link>
              <Link href="/insights" onClick={() => setMobileOpen(false)} className="mobile-navlink">
                Insights
              </Link>
              <Link href="/careers" onClick={() => setMobileOpen(false)} className="mobile-navlink">
                Careers <span className="nav-hiring">Hiring</span>
              </Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="mobile-navlink">
                Contact
              </Link>
            </div>

            <div className="mobile-navigation-cta">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="button"
              >
                Discuss Your Project <ArrowUpRight size="1em" className="inline-icon" aria-hidden="true" />
              </Link>
            </div>
          </nav>
        </dialog>
      )}
    </>
  );
}
