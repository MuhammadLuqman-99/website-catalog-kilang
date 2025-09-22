import { useState, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';
import { formatPrice, getProductImageUrl, generateWhatsAppLink } from '../lib/shopify';
import { trackLead } from '../lib/fbpixel';

const ProductCard = ({ product, agentNumber }) => {
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const variant = product.variants.edges[0]?.node;
  const price = variant?.price ? formatPrice(variant.price.amount, variant.price.currencyCode) : 'Price not available';
  const compareAtPrice = variant?.compareAtPrice ? formatPrice(variant.compareAtPrice.amount, variant.compareAtPrice.currencyCode) : null;
  const isOnSale = compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount);

  const stockStatus = () => {
    if (!product.availableForSale) return { text: '0', color: 'text-red-600', available: false };
    if (variant?.quantityAvailable === 0) return { text: '0', color: 'text-red-600', available: false };
    if (variant?.quantityAvailable) {
      if (variant.quantityAvailable <= 5) {
        return { text: `${variant.quantityAvailable}`, color: 'text-orange-600', available: true };
      }
      return { text: `${variant.quantityAvailable}`, color: 'text-green-600', available: true };
    }
    return { text: '✓', color: 'text-green-600', available: true };
  };

  const stock = stockStatus();
  
  // Convert WebP to JPG by modifying the URL
  const getConvertedImageUrl = (size = 'medium') => {
    let imageUrl = getProductImageUrl(product, size);
    
    // Convert WebP to JPG format in the URL
    if (imageUrl && imageUrl.includes('cdn.shopify.com')) {
      imageUrl = imageUrl.split('?')[0];
      const sizeMap = {
        small: '300x300',
        medium: '600x600',
        large: '1200x1200',
        grande: '1024x1024'
      };
      const targetSize = sizeMap[size] || sizeMap.medium;
      imageUrl = `${imageUrl}?width=${targetSize.split('x')[0]}&height=${targetSize.split('x')[1]}&format=jpg&quality=95`;
    }
    
    return imageUrl;
  };

  const imageUrl = getConvertedImageUrl('medium');
  const largeImageUrl = getConvertedImageUrl('grande');

  const handleOrderClick = () => {
    if (agentNumber) {
      trackLead(
        product.title,
        product.id,
        parseFloat(variant?.price?.amount || 0),
        variant?.price?.currencyCode || 'MYR'
      );

      const whatsappLink = generateWhatsAppLink(agentNumber, product.title, price, imageUrl);
      window.open(whatsappLink, '_blank');
    } else {
      alert('No agent contact available. Please refresh the page with an agent parameter.');
    }
  };

  // Handle drag start for the product card image
  const handleDragStart = (e, imageUrl) => {
    e.stopPropagation();
    setIsDragging(true);
    
    // Set the drag data
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/uri-list', imageUrl);
    e.dataTransfer.setData('text/plain', imageUrl);
    
    // Create a custom drag image
    const dragImage = new Image();
    dragImage.src = imageUrl;
    e.dataTransfer.setDragImage(dragImage, 50, 50);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <>
      <div 
        className={`bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer relative ${
          isDragging ? 'opacity-50 scale-95' : ''
        }`} 
        onClick={() => setShowModal(true)}
      >
        <div className="relative aspect-square bg-gray-200">
          {/* Draggable image wrapper */}
          <div
            draggable="true"
            onDragStart={(e) => handleDragStart(e, largeImageUrl)}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 z-10"
            title="Drag this image to Shopee, TikTok, or any other app"
          >
            <OptimizedImage
              src={imageUrl}
              alt={product.images?.edges?.[0]?.node?.altText || product.title}
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />
          </div>
          
          {/* Drag indicator (shows on hover) */}
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          
          {isOnSale && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium z-20 pointer-events-none">
              Sale
            </div>
          )}
          {!stock.available && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-20 pointer-events-none">
              <span className="text-white font-medium text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-2">
          <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2" title={product.title}>
            {product.title}
          </h3>

          {product.productType && (
            <p className="text-xs text-gray-500 mb-1">{product.productType}</p>
          )}

          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm font-bold text-gray-900">{price}</span>
            {isOnSale && (
              <span className="text-xs text-gray-500 line-through">{compareAtPrice}</span>
            )}
          </div>

          <div className="flex items-center justify-between mb-2">
            <div></div>
            <span className={`text-lg font-bold ${stock.color}`}>
              {stock.text}
            </span>
          </div>
        </div>
      </div>

      {/* Modal for full-size image */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Draggable modal image */}
            <img
              src={largeImageUrl}
              alt={product.images?.edges?.[0]?.node?.altText || product.title}
              className={`max-w-full max-h-full object-contain rounded-lg cursor-move ${
                isDragging ? 'opacity-50' : ''
              }`}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, largeImageUrl)}
              onDragEnd={handleDragEnd}
              onClick={(e) => e.stopPropagation()}
              title="Drag this image to Shopee, TikTok, or any other app"
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg pointer-events-none">
              <h3 className="font-medium text-lg">{product.title}</h3>
              <p className="text-yellow-300 font-bold text-xl">{price}</p>
              <div className="flex items-center gap-2 text-sm mt-2 text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span>Drag image directly to Shopee, TikTok, or any app - no download needed!</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;