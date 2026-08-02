import * as React from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type CarouselApi = UseEmblaCarouselType[1];
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];
type CarouselPlugin = Parameters<typeof useEmblaCarousel>[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextValue = CarouselProps & {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  scrollPrevious: () => void;
  scrollNext: () => void;
  canScrollPrevious: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('Carousel controls must be used within Carousel.');
  return context;
}

export function Carousel({
  opts,
  plugins,
  setApi,
  className,
  children,
  ...props
}: React.ComponentProps<'section'> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(opts, plugins);
  const [canScrollPrevious, setCanScrollPrevious] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    setCanScrollPrevious(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrevious = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  React.useEffect(() => {
    if (api && setApi) setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    return () => {
      api.off('reInit', onSelect);
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        plugins,
        setApi,
        scrollPrevious,
        scrollNext,
        canScrollPrevious,
        canScrollNext,
      }}
    >
      <section
        className={cn('carousel', className)}
        role="region"
        aria-roledescription="carousel"
        onKeyDownCapture={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            scrollPrevious();
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            scrollNext();
          }
        }}
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { carouselRef } = useCarousel();
  return (
    <div ref={carouselRef} className="carousel-content" data-slot="carousel-content">
      <div className={cn('carousel-track', className)} {...props} />
    </div>
  );
}

export function CarouselItem({ className, ...props }: React.ComponentProps<'article'>) {
  return <article className={cn('carousel-item', className)} data-slot="carousel-item" {...props} />;
}

export function CarouselPrevious({ className, ...props }: React.ComponentProps<'button'>) {
  const { scrollPrevious, canScrollPrevious } = useCarousel();
  return (
    <button
      type="button"
      className={cn('carousel-previous', className)}
      aria-label="Previous article"
      disabled={!canScrollPrevious}
      onClick={scrollPrevious}
      {...props}
    >
      <ArrowLeft size={20} strokeWidth={1.7} />
    </button>
  );
}

export function CarouselNext({ className, ...props }: React.ComponentProps<'button'>) {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      type="button"
      className={cn('carousel-next', className)}
      aria-label="Next article"
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight size={20} strokeWidth={1.7} />
    </button>
  );
}

export type { CarouselApi };
