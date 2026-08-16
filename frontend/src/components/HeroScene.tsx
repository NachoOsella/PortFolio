import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const cubeFaces = [
  { side: 'front', tone: 'yellow', index: '01', label: 'PRODUCT', value: 'ANGULAR', detail: 'interfaces' },
  { side: 'right', tone: 'blue', index: '02', label: 'SYSTEM', value: 'JAVA', detail: 'services' },
  { side: 'back', tone: 'green', index: '03', label: 'DATA', value: 'POSTGRES', detail: 'contracts' },
  { side: 'left', tone: 'orange', index: '04', label: 'FLOW', value: 'SPRING', detail: 'runtime' },
  { side: 'top', tone: 'aqua', index: '05', label: 'SHIP', value: 'DOCKER', detail: 'delivery' },
  { side: 'bottom', tone: 'purple', index: '06', label: 'TYPESCRIPT', value: 'TS', detail: 'clarity' },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroScene() {
  const reduceMotion = useReducedMotion();
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, rotationX: -14, rotationY: -28 });
  const rotationX = useMotionValue(-14);
  const rotationY = useMotionValue(-28);
  const smoothRotationX = useSpring(rotationX, { stiffness: 180, damping: 24, mass: 0.7 });
  const smoothRotationY = useSpring(rotationY, { stiffness: 180, damping: 24, mass: 0.7 });

  useAnimationFrame((_, delta) => {
    if (reduceMotion || dragging.current) return;
    rotationY.set(rotationY.get() + delta * 0.008);
  });

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging.current = true;
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      rotationX: rotationX.get(),
      rotationY: rotationY.get(),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;
    rotationY.set(dragStart.current.rotationY + deltaX * 0.45);
    rotationX.set(Math.max(-78, Math.min(78, dragStart.current.rotationX - deltaY * 0.45)));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const increments: Record<string, [number, number]> = {
      ArrowLeft: [0, -12],
      ArrowRight: [0, 12],
      ArrowUp: [-10, 0],
      ArrowDown: [10, 0],
    };
    const increment = increments[event.key];
    if (!increment) return;
    event.preventDefault();
    rotationX.set(Math.max(-78, Math.min(78, rotationX.get() + increment[0])));
    rotationY.set(rotationY.get() + increment[1]);
  };

  return (
    <section className="v2-hero">
      <div className="v2-shell v2-hero-inner">
        <div className="v2-hero-copy">
          <motion.p
            className="v2-hero-record"
            initial={reduceMotion ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.02, ease }}
          >
            IGNACIO OSELLA / BACKEND DEVELOPER / CÓRDOBA
          </motion.p>
          <h1 className="v2-hero-title">
            {['Backend', 'systems,', 'built to', 'last.'].map((line, index) => (
              <span className="v2-title-mask" key={line}>
                <motion.span
                  initial={reduceMotion ? false : { y: '108%', rotate: index % 2 === 0 ? 1.5 : -1.5 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.06 + index * 0.08, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
        </div>

        <div className="v2-hero-art">
          <span className="v2-cube-instruction" aria-hidden="true">Drag to rotate / Arrow keys</span>
          <div className="v2-cube-stage">
            <motion.div
              className="v2-cube"
              role="group"
              aria-label="Interactive product systems cube. Drag to rotate or use the arrow keys."
              tabIndex={0}
              style={{ rotateX: smoothRotationX, rotateY: smoothRotationY }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onKeyDown={handleKeyDown}
            >
              {cubeFaces.map((face) => (
                <div
                  className={`v2-cube-face v2-cube-face-${face.side} v2-cube-tone-${face.tone}`}
                  key={face.side}
                >
                  <span>{face.index} / {face.label}</span>
                  <strong>{face.value}</strong>
                  <small>{face.detail}</small>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          className="v2-hero-footer"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.46, ease }}
        >
          <p>Clear interfaces and dependable systems, built across React, TypeScript, Java and Spring Boot.</p>
          <div className="v2-hero-actions">
            <Link className="v2-action v2-action-primary" to="/projects">
              View work <ArrowDownRight size={18} strokeWidth={1.7} />
            </Link>
            <Link className="v2-action v2-action-secondary" to="/contact">
              Contact <ArrowUpRight size={18} strokeWidth={1.7} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
