import { useEffect, useRef, useState } from 'react';

/**
 * Intersection Observer hook for lazy loading and infinite scroll
 * @param {Object} options - IntersectionObserver options
 * @returns {[React.Ref, boolean]} - [ref to attach, isIntersecting]
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      ...options
    });

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [options.threshold, options.root, options.rootMargin]);

  return [targetRef, isIntersecting];
}
