'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  itemCount: number;
  children: ReactNode;
};

export function ForumScrollRow({ itemCount, children }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el || itemCount <= 1) return;

    let closest = 0;
    let minDistance = Infinity;

    Array.from(el.children).forEach((child, index) => {
      const distance = Math.abs((child as HTMLElement).offsetLeft - el.scrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
  }, [itemCount]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || itemCount <= 1) return;

    updateActiveIndex();
    el.addEventListener('scroll', updateActiveIndex, { passive: true });
    window.addEventListener('resize', updateActiveIndex);

    return () => {
      el.removeEventListener('scroll', updateActiveIndex);
      window.removeEventListener('resize', updateActiveIndex);
    };
  }, [itemCount, updateActiveIndex]);

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    const child = el?.children[index] as HTMLElement | undefined;
    if (!el || !child) return;

    el.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
    setActiveIndex(index);
  };

  return (
    <div className="forum-scroll-wrap">
      <div className="forum-scroll" ref={scrollRef}>
        {children}
      </div>
      {itemCount > 1 && (
        <div className="forum-scroll-dots" aria-hidden>
          {Array.from({ length: itemCount }, (_, index) => (
            <button
              key={index}
              type="button"
              className={`forum-scroll-dots__dot${index === activeIndex ? ' is-active' : ''}`}
              onClick={() => scrollTo(index)}
              tabIndex={-1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
