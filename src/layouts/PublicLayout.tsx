import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { BrandMark } from '@/components/BrandMark';
import { useAuth } from '@/context/AuthContext';

const links = [
  ['Projects', '/projects'],
  ['Blog', '/blog'],
  ['About', '/about'],
  ['Contact', '/contact'],
];
export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { session } = useAuth();
  return (
    <div className="public-app">
      <header className="public-nav">
        <div className="nav-inner">
          <Link to="/" className="wordmark" onClick={() => setOpen(false)}>
            <BrandMark className="wordmark-mark" />
            <span>Ignacio Osella</span>
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {links.map(([label, to]) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {label}
              </NavLink>
            ))}
            <a className="resume-link" href="/ignacio-osella-resume.pdf" download>
              Résumé <ArrowUpRight size={14} />
            </a>
          </nav>
          <button
            className="mobile-menu-button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <AnimatePresence>
          {open ? (
            <motion.div
              className="mobile-nav"
              initial={reduceMotion ? false : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <nav aria-label="Mobile navigation">
                {links.map(([label, to]) => (
                  <NavLink key={to} to={to} onClick={() => setOpen(false)}>
                    {label}
                  </NavLink>
                ))}
                <a href="/ignacio-osella-resume.pdf" download onClick={() => setOpen(false)}>
                  Download résumé <ArrowUpRight size={15} />
                </a>
                {session ? (
                  <Link to="/admin" onClick={() => setOpen(false)}>
                    Open CMS <ArrowUpRight size={15} />
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
      <footer className="public-footer">
        <div className="footer-inner">
          <div>
            <Link to="/" className="wordmark">
              <BrandMark className="wordmark-mark" />
              <span>Ignacio Osella</span>
            </Link>
            <p>Full-stack developer building thoughtful, maintainable digital products.</p>
          </div>
          <div className="footer-links">
            <span>© {new Date().getFullYear()} Ignacio Osella</span>
            <a href="mailto:hello@ignacioosella.dev">
              Email <ArrowUpRight size={13} />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
