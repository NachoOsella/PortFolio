import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const spring = { stiffness: 95, damping: 18, mass: 0.7 };

export function KineticHero() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, spring);
  const smoothY = useSpring(pointerY, spring);
  const fieldX = useTransform(smoothX, [-0.5, 0.5], [-26, 26]);
  const fieldY = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);
  const reverseX = useTransform(smoothX, [-0.5, 0.5], [18, -18]);
  const reverseY = useTransform(smoothY, [-0.5, 0.5], [12, -12]);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion || !heroRef.current) return;
    const bounds = heroRef.current.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  return (
    <section ref={heroRef} className="kinetic-hero" onPointerMove={handlePointerMove}>
      <div className="kinetic-field" aria-hidden="true">
        <motion.span className="field-glyph field-glyph-i" style={{ x: fieldX, y: fieldY }}>
          I
        </motion.span>
        <motion.span className="field-glyph field-glyph-o" style={{ x: reverseX, y: reverseY }}>
          O
        </motion.span>
        <motion.span
          className="field-cross"
          style={{ x: reverseX, y: fieldY }}
          animate={reduceMotion ? undefined : { rotate: [0, 90, 180] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="page-shell kinetic-hero-inner">
        <motion.p
          className="hero-role"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          Full-stack product developer
        </motion.p>

        <h1 className="kinetic-title">
          <motion.span
            initial={reduceMotion ? false : { y: '110%', rotate: 2 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            I build systems
          </motion.span>
          <motion.span
            className="title-accent"
            initial={reduceMotion ? false : { y: '110%', rotate: -2 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 0.85, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            people can trust.
          </motion.span>
        </h1>

        <motion.div
          className="hero-bottom"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>React, TypeScript, Java and Spring Boot, shaped into products that stay clear as they grow.</p>
          <div className="hero-actions">
            <Link className="kinetic-button kinetic-button-primary" to="/projects">
              View work <ArrowDownRight size={18} strokeWidth={1.8} />
            </Link>
            <Link className="kinetic-button kinetic-button-ghost" to="/contact">
              Contact <ArrowUpRight size={18} strokeWidth={1.8} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
