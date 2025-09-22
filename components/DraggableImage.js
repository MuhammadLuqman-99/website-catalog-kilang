import { useState } from 'react';
import OptimizedImage from './OptimizedImage';
import { getProductImageUrl } from '../lib/shopify';

const DraggableImage = ({ src, alt, className, productTitle, product, size = 'medium' }) => {
  const [isDragging, setIsDragging] = useState(false);

  // Convert WebP to JPG by modifying the URL
  const getConvertedImageUrl = (imageUrl, targetSize = 'medium') => {
    if (!imageUrl) return imageUrl;

    // Convert WebP to JPG format in the URL
    if (imageUrl.includes('cdn.shopify.com')) {
      imageUrl = imageUrl.split('?')[0];
      const sizeMap = {
        small: '300x300',
        medium: '600x600',
        large: '1200x1200',
        grande: '1024x1024'
      };
      const targetSizeValue = sizeMap[targetSize] || sizeMap.medium;
      imageUrl = `${imageUrl}?width=${targetSizeValue.split('x')[0]}&height=${targetSizeValue.split('x')[1]}&format=jpg&quality=95`;
    }

    return imageUrl;
  };

  // Get the appropriate image URL
  const imageUrl = product ? getProductImageUrl(product, size) : src;
  const largeImageUrl = getConvertedImageUrl(imageUrl, 'grande');

  // Handle drag start
  const handleDragStart = (e) => {
    e.stopPropagation();
    setIsDragging(true);

    // Set the drag data
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/uri-list', largeImageUrl);
    e.dataTransfer.setData('text/plain', largeImageUrl);

    // Create a custom drag image
    const dragImage = new Image();
    dragImage.src = largeImageUrl;
    e.dataTransfer.setDragImage(dragImage, 50, 50);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative group">
      {/* Draggable image wrapper */}
      <div
        draggable="true"
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`relative ${isDragging ? 'opacity-50 scale-95' : ''} transition-all duration-200`}
        title="Drag this image to Shopee, TikTok, or any other app"
      >
        <OptimizedImage
          src={imageUrl}
          alt={alt}
          className={`${className} pointer-events-none select-none`}
          draggable={false}
        />
      </div>

      {/* Drag indicator (shows on hover) */}
      <div className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </div>
    </div>
  );
};

export default DraggableImage;