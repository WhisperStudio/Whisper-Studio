import React, { useState, useRef, useEffect } from 'react';
import './OptimizedImage.css';

const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  loading = 'lazy',
  preload = false,
  cacheControl = 'public, max-age=31536000, immutable'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(preload);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (preload) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [preload]);

  // Preload critical images
  useEffect(() => {
    if (preload && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [preload, src]);

  return (
    <div ref={imgRef} className={`optimized-image-container ${className || ''}`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            // Add cache control via data attribute (note: this doesn't actually set HTTP headers)
            'data-cache-control': cacheControl
          }}
        />
      )}
      {!isLoaded && (
        <div className="image-placeholder" />
      )}
    </div>
  );
};

export default OptimizedImage;
