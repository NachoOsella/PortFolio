import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

export function ReadingProgress() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.35 });

  if (reduceMotion) return null;

  return <motion.div className="v2-reading-progress" style={{ scaleX }} aria-hidden="true" />;
}
