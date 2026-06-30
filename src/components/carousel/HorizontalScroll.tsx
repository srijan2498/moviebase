import { useRef } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
  title: string;
  viewAllLink?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export default function HorizontalScroll({ title, viewAllLink, children, icon }: HorizontalScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    const amount = trackRef.current.clientWidth * 0.75;
    trackRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <section className="h-scroll-section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="accent-dot" />
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        {viewAllLink && (
          <a href={viewAllLink} className="btn btn-ghost btn-sm text-accent">
            View All →
          </a>
        )}
      </div>
      <div className="h-scroll-wrapper">
        <button className="scroll-arrow scroll-arrow-left hide-mobile" onClick={() => scroll('left')}>
          <ChevronLeft size={18} />
        </button>
        <div className="h-scroll-track" ref={trackRef}>
          {children}
        </div>
        <button className="scroll-arrow scroll-arrow-right hide-mobile" onClick={() => scroll('right')}>
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
