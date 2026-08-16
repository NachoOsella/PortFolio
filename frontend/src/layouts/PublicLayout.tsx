import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { SignatureMark } from '@/components/SignatureMark';
import { useAuth } from '@/context/AuthContext';
import { getRouteRecord } from '@/lib/archive';

const navigation = [
  ['Projects', '/projects'],
  ['Blog', '/blog'],
  ['About', '/about'],
  ['Contact', '/contact'],
] as const;

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    root.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousBehavior;
  }, [location.pathname, location.search]);

  // Escape closes the mobile menu and restores focus to its trigger; opening
  // the menu moves focus to the first item so keyboard users land inside it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const firstItem = menuRef.current?.querySelector<HTMLElement>('a,button');
    firstItem?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);
  const { session } = useAuth();
  const routeRecord = getRouteRecord(location.pathname);

  return (
    <div className="v2-app">
      <aside className="v2-archive-rail" aria-hidden="true">
        <span>{routeRecord.code}</span>
        <span>{routeRecord.section}</span>
        <span>CURRENT / CBA</span>
      </aside>
      <header className="v2-nav">
        <div className="v2-shell v2-nav-inner">
          <Link className="v2-brand" to="/" onClick={closeMenu}>
            <SignatureMark className="v2-brand-mark" />
            <span>Ignacio Osella</span>
          </Link>

          <nav className="v2-nav-links" aria-label="Primary navigation">
            {navigation.map(([label, path]) => (
              <NavLink key={path} to={path} className={({ isActive }) => (isActive ? 'active' : '')}>
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            className="v2-menu-button"
            type="button"
            ref={menuButtonRef}
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              className="v2-mobile-menu"
              initial={reduceMotion ? false : { clipPath: 'inset(0 0 100% 0)' }}
              animate={{ clipPath: 'inset(0 0 0% 0)' }}
              exit={reduceMotion ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <nav aria-label="Mobile navigation" ref={menuRef}>
                {navigation.map(([label, path]) => (
                  <NavLink key={path} to={path} onClick={closeMenu}>
                    {label}
                  </NavLink>
                ))}
                {session ? (
                  <Link to="/admin" onClick={closeMenu}>
                    Open CMS <ArrowUpRight size={18} />
                  </Link>
                ) : null}
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="v2-footer">
        <div className="v2-shell v2-footer-bottom">
          <Link className="v2-brand" to="/">
            <SignatureMark className="v2-brand-mark" />
            <span>Ignacio Osella</span>
          </Link>
          <span>{routeRecord.code} / CURRENT COPY</span>
          <span>Córdoba, AR / UTC−03</span>
          <span>© {new Date().getFullYear()}</span>
          <a href="mailto:nachoosella7@gmail.com">Email <ArrowUpRight size={13} /></a>
        </div>
      </footer>
    </div>
  );
}
