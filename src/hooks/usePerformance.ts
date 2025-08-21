import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
  loadTime: number;
}

interface UsePerformanceOptions {
  trackRender?: boolean;
  trackMemory?: boolean;
  trackFPS?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export function usePerformance(options: UsePerformanceOptions = {}) {
  const {
    trackRender = true,
    trackMemory = true,
    trackFPS = true,
    onMetricsUpdate
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
    loadTime: 0,
  });

  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const fpsInterval = useRef<NodeJS.Timeout | null>(null);

  // Track render performance
  useEffect(() => {
    if (!trackRender) return;

    renderStartTime.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => {
        const newMetrics = { ...prev, renderTime };
        onMetricsUpdate?.(newMetrics);
        return newMetrics;
      });
    };
  });

  // Track memory usage
  useEffect(() => {
    if (!trackMemory || !(performance as any).memory) return;

    const updateMemory = () => {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      
      setMetrics(prev => {
        const newMetrics = { ...prev, memoryUsage };
        onMetricsUpdate?.(newMetrics);
        return newMetrics;
      });
    };

    updateMemory();
    const interval = setInterval(updateMemory, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [trackMemory, onMetricsUpdate]);

  // Track FPS
  useEffect(() => {
    if (!trackFPS) return;

    const calculateFPS = (currentTime: number) => {
      frameCount.current++;
      
      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        
        setMetrics(prev => {
          const newMetrics = { ...prev, fps };
          onMetricsUpdate?.(newMetrics);
          return newMetrics;
        });

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      requestAnimationFrame(calculateFPS);
    };

    lastTime.current = performance.now();
    requestAnimationFrame(calculateFPS);
  }, [trackFPS, onMetricsUpdate]);

  // Track page load time
  useEffect(() => {
    const loadTime = performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0;
    
    setMetrics(prev => {
      const newMetrics = { ...prev, loadTime };
      onMetricsUpdate?.(newMetrics);
      return newMetrics;
    });
  }, [onMetricsUpdate]);

  return {
    metrics,
    // Performance utilities
    measureAsync: async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
      const start = performance.now();
      const result = await fn();
      const duration = performance.now() - start;
      return { result, duration };
    },
    
    measureSync: <T>(fn: () => T): { result: T; duration: number } => {
      const start = performance.now();
      const result = fn();
      const duration = performance.now() - start;
      return { result, duration };
    },

    // Get performance insights
    getInsights: (): string[] => {
      const insights: string[] = [];
      
      if (metrics.renderTime > 16) {
        insights.push('Render time is high - consider optimizing components');
      }
      
      if (metrics.memoryUsage > 50) {
        insights.push('Memory usage is high - check for memory leaks');
      }
      
      if (metrics.fps < 30) {
        insights.push('Low FPS detected - optimize animations');
      }
      
      if (metrics.loadTime > 3000) {
        insights.push('Slow page load - optimize bundle size');
      }

      return insights;
    }
  };
}

// Performance monitoring component
export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  const { metrics, getInsights } = usePerformance({
    onMetricsUpdate: (metrics) => {
      // Log performance issues in development
      if (process.env.NODE_ENV === 'development') {
        const insights = getInsights();
        if (insights.length > 0) {
          console.warn('Performance insights:', insights);
        }
      }
    }
  });

  // Show performance overlay in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <>
        {children}
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded font-mono z-50">
          <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
          <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
          <div>FPS: {metrics.fps}</div>
          <div>Load: {metrics.loadTime}ms</div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}