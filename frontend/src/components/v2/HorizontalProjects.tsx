import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ProjectFrontmatter } from '@/types';
import { ProjectDiagram } from './ProjectDiagram';

type ProjectDocument = {
  path: string;
  frontmatter: ProjectFrontmatter;
};

const panelTones = ['yellow', 'blue', 'green', 'orange', 'purple', 'aqua'];

export function HorizontalProjects({ projects }: { projects: ProjectDocument[] }) {
  const outerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const [travel, setTravel] = useState(0);
  const [holdDistance, setHoldDistance] = useState(0);
  const [focusPoints, setFocusPoints] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  });
  const { scrollYProgress: introScrollProgress } = useScroll({
    target: introRef,
    offset: ['start end', 'center 55%', 'end 15%'],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.35 });
  const horizontalProgress = useTransform(smoothProgress, (progress) => {
    if (travel <= 0) return 0;
    return Math.min(1, (progress * (travel + holdDistance)) / travel);
  });
  const trackX = useTransform(horizontalProgress, [0, 1], [0, -travel]);
  const canAnimate = isDesktop && !reduceMotion;
  const mobileAnimated = !isDesktop && !reduceMotion;
  const animated = canAnimate && travel > 0;
  const handleMobileFocus = useCallback((index: number) => setActiveIndex(index), []);
  const introOpacity = useTransform(introScrollProgress, [0, 0.35, 0.7, 1], [0.55, 1, 1, 0.75]);
  const introY = useTransform(introScrollProgress, [0, 0.35, 0.7, 1], [28, 0, 0, -12]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 769px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    if (!outer || !track || !isDesktop || reduceMotion) {
      setTravel(0);
      setHoldDistance(0);
      setFocusPoints([]);
      return;
    }

    const measure = () => {
      const panels = Array.from(track.querySelectorAll<HTMLElement>('.v2-project-panel'));
      const maximumTravel = Math.max(0, track.scrollWidth - outer.clientWidth);
      const finalPanel = panels[panels.length - 1];
      const finalCenter = finalPanel
        ? finalPanel.offsetLeft + finalPanel.offsetWidth / 2
        : outer.clientWidth;
      const centeredTravel = Math.max(0, finalCenter - outer.clientWidth / 2);
      const extraHold = centeredTravel > 0
        ? Math.min(280, Math.max(150, (maximumTravel / Math.max(projects.length, 1)) * 0.2))
        : 0;
      const nextFocusPoints = centeredTravel > 0
        ? panels.map((panel) => Math.min(
          1,
          Math.max(0, (panel.offsetLeft + panel.offsetWidth / 2 - outer.clientWidth / 2) / centeredTravel),
        ))
        : [];

      setTravel(centeredTravel);
      setHoldDistance(extraHold);
      setFocusPoints(nextFocusPoints);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(track);
    measure();
    return () => observer.disconnect();
  }, [isDesktop, reduceMotion, projects.length]);

  useMotionValueEvent(horizontalProgress, 'change', (progress) => {
    if (!animated || projects.length === 0 || focusPoints.length === 0) return;
    const nextIndex = focusPoints.reduce((closestIndex, focusPoint, index) => (
      Math.abs(focusPoint - progress) < Math.abs(focusPoints[closestIndex] - progress)
        ? index
        : closestIndex
    ), 0);
    setActiveIndex((currentIndex) => currentIndex === nextIndex ? currentIndex : nextIndex);
  });

  return (
    <section
      ref={outerRef}
      className="v2-projects-horizontal"
      data-static={canAnimate ? 'false' : 'true'}
      style={animated ? { height: `calc(100svh + ${travel + holdDistance}px)` } : undefined}
      aria-labelledby="selected-work-heading"
    >
      <div className="v2-project-stage">
        {mobileAnimated && projects.length > 0 ? (
          <div className="v2-project-mobile-progress" aria-hidden="true">
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
            <i>
              <motion.b
                initial={false}
                animate={{ scaleX: (activeIndex + 1) / projects.length }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              />
            </i>
          </div>
        ) : null}

        <motion.div ref={trackRef} className="v2-project-track" style={animated ? { x: trackX } : undefined}>
          <motion.div
            ref={introRef}
            className="v2-project-intro-panel"
            style={mobileAnimated ? { opacity: introOpacity, y: introY } : undefined}
          >
            <div>
              <span className="v2-section-kicker">Selected work</span>
              <h2 id="selected-work-heading">Built as systems, not surfaces.</h2>
              <p>Each project connects product intent, interface behavior and technical structure.</p>
            </div>
            <Link className="v2-text-link" to="/projects">
              View work <ArrowUpRight size={17} strokeWidth={1.7} />
            </Link>
          </motion.div>

          {projects.map((project, index) => (
            <ProjectPanel
              key={project.path}
              project={project}
              index={index}
              total={projects.length}
              progress={horizontalProgress}
              focusPoint={focusPoints[index] ?? (projects.length === 1 ? 1 : index / (projects.length - 1))}
              animated={animated}
              mobileAnimated={mobileAnimated}
              onMobileFocus={handleMobileFocus}
              active={activeIndex === index}
            />
          ))}
        </motion.div>

        {animated && projects.length > 0 ? (
          <div className="v2-project-counter" aria-hidden="true">
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
            <i><motion.b style={{ scaleX: horizontalProgress }} /></i>
          </div>
        ) : null}

      </div>
    </section>
  );
}

function ProjectPanel({
  project,
  index,
  total,
  progress,
  focusPoint,
  animated,
  mobileAnimated,
  onMobileFocus,
  active,
}: {
  project: ProjectDocument;
  index: number;
  total: number;
  progress: MotionValue<number>;
  focusPoint: number;
  animated: boolean;
  mobileAnimated: boolean;
  onMobileFocus: (index: number) => void;
  active: boolean;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const panelInView = useInView(panelRef, { amount: 0.38 });
  const { scrollYProgress: mobileScrollProgress } = useScroll({
    target: panelRef,
    offset: ['start end', 'center 55%', 'end start'],
  });
  const mobileSmoothProgress = useSpring(mobileScrollProgress, { stiffness: 110, damping: 24, mass: 0.45 });
  const mobileOpacity = useTransform(mobileSmoothProgress, [0, 0.32, 0.55, 0.78, 1], [0.3, 0.7, 1, 0.76, 0.36]);
  const mobileScale = useTransform(mobileSmoothProgress, [0, 0.32, 0.55, 0.78, 1], [0.93, 0.985, 1, 0.985, 0.94]);
  const mobileArtworkY = useTransform(mobileSmoothProgress, [0, 0.32, 0.55, 0.78, 1], [54, 18, 0, -14, -34]);
  const mobileArtworkScale = useTransform(mobileSmoothProgress, [0, 0.32, 0.55, 0.78, 1], [0.86, 0.97, 1, 0.98, 0.9]);
  const mobileCopyY = useTransform(mobileSmoothProgress, [0, 0.32, 0.55, 0.78, 1], [42, 12, 0, -10, -24]);
  const item = project.frontmatter;
  const tone = panelTones[index % panelTones.length];
  const radius = Math.min(0.18, 0.42 / Math.max(total, 1));
  const isFinalPanel = index === total - 1;
  const focusRange = focusPoint >= 1 - radius
    ? [Math.max(0, focusPoint - radius), focusPoint]
    : focusPoint <= radius
      ? [focusPoint, Math.min(1, focusPoint + radius)]
      : [focusPoint - radius, focusPoint, focusPoint + radius];
  const focusOpacity = isFinalPanel
    ? focusRange.length === 2 ? [0.42, 1] : [0.42, 1, 1]
    : focusRange.length === 2 ? [0.42, 1] : [0.42, 1, 0.42];
  const focusScale = isFinalPanel
    ? focusRange.length === 2 ? [0.975, 1] : [0.975, 1, 1]
    : focusRange.length === 2 ? [0.975, 1] : [0.975, 1, 0.975];
  const focusTitleY = isFinalPanel
    ? focusRange.length === 2 ? [20, 0] : [20, 0, 0]
    : focusRange.length === 2 ? [20, 0] : [20, 0, -20];
  const opacity = useTransform(progress, focusRange, focusOpacity);
  const scale = useTransform(progress, focusRange, focusScale);
  const titleY = useTransform(progress, focusRange, focusTitleY);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const artworkX = useSpring(pointerX, { stiffness: 180, damping: 24 });
  const artworkY = useSpring(pointerY, { stiffness: 180, damping: 24 });

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!animated || !active || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(-((event.clientX - bounds.left) / bounds.width - 0.5) * 16);
    pointerY.set(-((event.clientY - bounds.top) / bounds.height - 0.5) * 16);
  };

  useEffect(() => {
    if (mobileAnimated && panelInView) onMobileFocus(index);
  }, [index, mobileAnimated, onMobileFocus, panelInView]);

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.article
      ref={panelRef}
      className={`v2-project-panel v2-tone-${tone}${mobileAnimated && active ? ' v2-project-panel-active' : ''}`}
      style={animated ? { opacity, scale } : mobileAnimated ? { opacity: mobileOpacity, scale: mobileScale } : undefined}
    >
      <Link
        to={`/projects/${item.slug}`}
        className="v2-project-panel-link"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
      >
        <motion.div
          className="v2-project-artwork"
          aria-hidden="true"
          style={animated && active
            ? { x: artworkX, y: artworkY }
            : mobileAnimated
              ? { y: mobileArtworkY, scale: mobileArtworkScale }
              : undefined}
        >
          <span className="v2-project-type">{String(index + 1).padStart(2, '0')} / {item.projectType}</span>
          <ProjectDiagram slug={item.slug} title={item.title} />
          <div className="v2-project-sweep">
            <span>{item.technologies.slice(0, 3).join(' / ')}</span>
          </div>
        </motion.div>
        <div className="v2-project-copy">
          <div>
            <span>{item.duration}</span>
            <motion.h3 style={animated ? { y: titleY } : mobileAnimated ? { y: mobileCopyY } : undefined}>{item.title}</motion.h3>
            <p>{item.description}</p>
          </div>
          <span className="v2-project-open" aria-hidden="true">
            <ArrowUpRight size={22} strokeWidth={1.6} />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
