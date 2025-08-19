import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export default function InfiniteScroll({
  children,
  hasMore,
  loading,
  onLoadMore,
  threshold = 100,
}: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(loading);

  // Update loading ref to avoid stale closure
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loadingRef.current) {
        onLoadMore();
      }
    },
    [hasMore, onLoadMore]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0,
      rootMargin: `${threshold}px`,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver, threshold]);

  return (
    <div>
      {children}
      
      {hasMore && (
        <div
          ref={observerRef}
          className="flex justify-center items-center py-8"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-white/70">
              <Loader2 className="animate-spin" size={20} />
              <span>Loading more...</span>
            </div>
          ) : (
            <div className="w-full h-4" />
          )}
        </div>
      )}
      
      {!hasMore && (
        <div className="text-center py-8">
          <p className="text-white/50 text-sm">
            You've reached the end! 🎉
          </p>
        </div>
      )}
    </div>
  );
}