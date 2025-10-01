import { useState } from 'react';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';

const OptimizedImage = ({ src, alt, width = 600, height = 600, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  // Fallback to original URL if it's a Shopify image with issues
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc) return '/placeholder-product.svg';

    // For Shopify images, try to use the original URL first
    if (originalSrc.includes('cdn.shopify.com')) {
      // Remove size parameters and use original
      return originalSrc.split('?')[0];
    }

    return originalSrc;
  };

  return (
    <div className={`relative bg-gray-200 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="medium" />
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image not available</p>
          </div>
        </div>
      ) : (
        <Image
          src={getOptimizedSrc(src)}
          alt={alt}
          fill
          className={`object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={handleLoad}
          onError={handleError}
          priority={false}
          unoptimized
        />
      )}
    </div>
  );
};

export default OptimizedImage;