import React, { useState, useEffect, useCallback } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
}

interface OptimizedImage {
  src: string;
  loading: boolean;
  error: boolean;
  loaded: boolean;
}

export function useOptimizedImages(
  images: string[],
  options: ImageOptimizationOptions = {}
) {
  const {
    quality = 80,
    maxWidth = 800,
    maxHeight = 600,
    format = 'webp',
    lazy = true
  } = options;

  const [optimizedImages, setOptimizedImages] = useState<Map<string, OptimizedImage>>(
    new Map(images.map(src => [src, { src, loading: false, error: false, loaded: false }]))
  );

  const optimizeImage = useCallback(async (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate new dimensions
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and optimize
        ctx.drawImage(img, 0, 0, width, height);
        
        const optimizedSrc = canvas.toDataURL(
          format === 'webp' ? 'image/webp' : `image/${format}`,
          quality / 100
        );
        
        resolve(optimizedSrc);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }, [quality, maxWidth, maxHeight, format]);

  const loadImage = useCallback(async (src: string) => {
    setOptimizedImages(prev => new Map(prev.set(src, {
      ...prev.get(src)!,
      loading: true,
      error: false
    })));

    try {
      const optimizedSrc = await optimizeImage(src);
      
      setOptimizedImages(prev => new Map(prev.set(src, {
        src: optimizedSrc,
        loading: false,
        error: false,
        loaded: true
      })));
    } catch (error) {
      setOptimizedImages(prev => new Map(prev.set(src, {
        ...prev.get(src)!,
        loading: false,
        error: true
      })));
    }
  }, [optimizeImage]);

  // Load images based on lazy loading setting
  useEffect(() => {
    if (!lazy) {
      images.forEach(loadImage);
    }
  }, [images, lazy, loadImage]);

  return {
    images: optimizedImages,
    loadImage,
    preloadImage: loadImage,
    
    // Utility functions
    isLoading: (src: string) => optimizedImages.get(src)?.loading || false,
    hasError: (src: string) => optimizedImages.get(src)?.error || false,
    isLoaded: (src: string) => optimizedImages.get(src)?.loaded || false,
    getOptimizedSrc: (src: string) => optimizedImages.get(src)?.src || src,
  };
}

// Optimized Image component
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  optimization?: ImageOptimizationOptions;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  fallback,
  optimization = {},
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const { images, loadImage, isLoading, hasError, getOptimizedSrc } = useOptimizedImages(
    [src],
    optimization
  );

  const [inView, setInView] = useState(!optimization.lazy);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!optimization.lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const imgElement = document.querySelector(`[data-src="${src}"]`);
    if (imgElement) {
      observer.observe(imgElement);
    }

    return () => observer.disconnect();
  }, [src, optimization.lazy]);

  // Load image when in view
  useEffect(() => {
    if (inView && !images.get(src)?.loaded && !isLoading(src)) {
      loadImage(src);
    }
  }, [inView, src, loadImage, images, isLoading]);

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  if (!inView && optimization.lazy) {
    return (
      <div
        data-src={src}
        className={`bg-gray-200 animate-pulse ${props.className || ''}`}
        style={{ width: props.width, height: props.height }}
      />
    );
  }

  if (isLoading(src)) {
    return (
      <div
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${props.className || ''}`}
        style={{ width: props.width, height: props.height }}
      >
        <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (hasError(src) && fallback) {
    return (
      <img
        {...props}
        src={fallback}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  return (
    <img
      {...props}
      src={getOptimizedSrc(src)}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}