import { useRef, useEffect } from 'react';

/**
 * Custom hook to track whether an element is visible in the viewport
 * 
 * @param onVisibilityChange - Callback function when visibility changes
 * @param threshold - Intersection observer threshold (0-1)
 * @returns A ref object to attach to the element being observed
 */
export const usePlayerVisibility = (
  onVisibilityChange: (isVisible: boolean) => void,
  threshold: number = 0.3
) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = elementRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        onVisibilityChange(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onVisibilityChange, threshold]);

  return elementRef;
}; 