import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/carousel';
import { formatDate, readingTime } from '@/lib/content';
import type { BlogPostFrontmatter } from '@/types';

type PostDocument = {
  path: string;
  body: string;
  frontmatter: BlogPostFrontmatter;
};

const previewTones = ['yellow', 'blue', 'green', 'orange', 'purple'];
const carouselId = 'writing-carousel';

export function WritingIndex({ posts }: { posts: PostDocument[] }) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const total = posts.length;
  const carouselOptions = useMemo(
    () => ({ align: 'start' as const, loop: total > 1, duration: reduceMotion ? 0 : 24 }),
    [reduceMotion, total],
  );

  useEffect(() => {
    if (!carouselApi) return;
    const updateActiveSlide = () => setActiveIndex(carouselApi.selectedScrollSnap());
    updateActiveSlide();
    carouselApi.on('select', updateActiveSlide);
    carouselApi.on('reInit', updateActiveSlide);
    return () => {
      carouselApi.off('select', updateActiveSlide);
      carouselApi.off('reInit', updateActiveSlide);
    };
  }, [carouselApi]);

  if (!total) return null;

  return (
    <section className="v2-writing" aria-labelledby="writing-heading">
      <div className="v2-shell">
        <div className="v2-writing-heading">
          <h2 id="writing-heading">Notes for the<br /><span>real work.</span></h2>
          <p>Product engineering notes for the decisions, systems and interfaces that need to hold up after the first release.</p>
        </div>

        <div className="v2-writing-carousel" aria-roledescription="carousel" aria-label="Technical writing">
          <div className="v2-writing-carousel-meta" aria-live="polite">
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            <i aria-hidden="true"><b style={{ transform: `scaleX(${(activeIndex + 1) / total})` }} /></i>
            <span>{posts[activeIndex].frontmatter.category}</span>
          </div>

          <Carousel
            className="v2-writing-viewport"
            aria-label="Technical writing"
            opts={carouselOptions}
            setApi={setCarouselApi}
          >
            <CarouselContent className="v2-writing-track" id={carouselId}>
              {posts.map((post, index) => {
                const item = post.frontmatter;
                return (
                  <CarouselItem
                    key={post.path}
                    className={`v2-writing-slide v2-tone-${previewTones[index % previewTones.length]}`}
                    aria-label={`${index + 1} of ${total}`}
                    aria-hidden={index !== activeIndex}
                  >
                    <Link to={`/blog/${item.slug}`} tabIndex={index === activeIndex ? 0 : -1}>
                      <div className="v2-writing-slide-top">
                        <span>{item.category}</span>
                        <span>{formatDate(item.publishedAt)}</span>
                      </div>
                      <div className="v2-writing-slide-copy">
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                      <div className="v2-writing-slide-bottom">
                        <span>{readingTime(post.body)} min read</span>
                        <span>Read note <ArrowUpRight size={20} strokeWidth={1.6} /></span>
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <div className="v2-writing-side-controls">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
          <div className="v2-writing-carousel-footer">
            <Link to="/blog">All notes <ArrowUpRight size={17} strokeWidth={1.7} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
