import { useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { SignatureMark } from '@/components/v2/SignatureMark';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  ['Projects', '/projects'],
  ['Blog', '/blog'],
  ['About', '/about'],
  ['Contact', '/contact'],
] as const;

export function PublicLayoutV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    root.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousBehavior;
  }, [location.pathname, location.search]);
  const { session } = useAuth();
  const isContactPage = location.pathname === '/contact';

  return (
    <div className="v2-app">
      <header className="v2-nav">
        <div className="v2-shell v2-nav-inner">
          <Link className="v2-brand" to="/" onClick={() => setMenuOpen(false)}>
            <SignatureMark className="v2-brand-mark" />
            <span>Ignacio Osella</span>
          </Link>

          <nav className="v2-nav-links" aria-label="Primary navigation">
            {navigation.map(([label, path]) => (
              <NavLink key={path} to={path} className={({ isActive }) => (isActive ? 'active' : '')}>
                {label}
              </NavLink>
            ))}
            <a className="v2-resume" href="/ignacio-osella-resume.pdf" download>
              Résumé <ArrowUpRight size={14} strokeWidth={1.7} />
            </a>
          </nav>

          <button
            className="v2-menu-button"
            type="button"
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
              <nav aria-label="Mobile navigation">
                {navigation.map(([label, path]) => (
                  <NavLink key={path} to={path} onClick={() => setMenuOpen(false)}>
                    {label}
                  </NavLink>
                ))}
                <a href="/ignacio-osella-resume.pdf" download onClick={() => setMenuOpen(false)}>
                  Résumé <ArrowUpRight size={18} />
                </a>
                {session ? (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}>
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

      <footer className={`v2-footer${isContactPage ? ' v2-footer-contact' : ''}`}>
        <div className="v2-shell">
          {!isContactPage ? (
            <motion.div
              className="v2-footer-main"
              initial={reduceMotion ? false : { opacity: 0, y: 42 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="v2-footer-heading">
                <p>Good work starts<br />before the answer.</p>
                <span>Bring the question that has not found its shape yet.</span>
              </div>
              <motion.div
                className="v2-footer-inquiry"
                initial={false}
                whileInView={reduceMotion ? undefined : { clipPath: 'inset(0 0 0% 0)' }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <p>A rough note is enough to begin.</p>
                <a href="mailto:hello@ignacioosella.dev">
                  hello@ignacioosella.dev <ArrowUpRight size={20} strokeWidth={1.6} />
                </a>
                <Link to="/contact">
                  Write the rest <ArrowUpRight size={18} strokeWidth={1.6} />
                </Link>
              </motion.div>
            </motion.div>
          ) : null}
          <div className="v2-footer-bottom">
            <Link className="v2-brand" to="/">
              <SignatureMark className="v2-brand-mark" />
              <span>Ignacio Osella</span>
            </Link>
            <span>© {new Date().getFullYear()}</span>
            <a href="mailto:hello@ignacioosella.dev">Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
