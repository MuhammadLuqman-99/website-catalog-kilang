import { useState } from 'react';
import OptimizedImage from './OptimizedImage';
import { formatPrice, getProductImageUrl, generateWhatsAppLink } from '../lib/shopify';
import { trackLead } from '../lib/fbpixel';

const ProductCard = ({ product, agentNumber }) => {
  const [showModal, setShowModal] = useState(false);
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
  const imageUrl = getProductImageUrl(product, 'medium');

  const handleOrderClick = () => {
    if (agentNumber) {
      // Track Facebook Pixel Lead event
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

  return (
    <>
      <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group cursor-pointer" onClick={() => setShowModal(true)}>
        <div className="relative aspect-square bg-gray-200">
          <OptimizedImage
            src={imageUrl}
            alt={product.images?.edges?.[0]?.node?.altText || product.title}
            className="w-full h-full object-cover"
          />
          {isOnSale && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
              Sale
            </div>
          )}
          {!stock.available && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
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
            <img
              src={imageUrl.replace('_medium', '_grande')}
              alt={product.images?.edges?.[0]?.node?.altText || product.title}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <h3 className="font-medium text-lg">{product.title}</h3>
              <p className="text-yellow-300 font-bold text-xl">{price}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;