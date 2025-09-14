import OptimizedImage from './OptimizedImage';
import { formatPrice, getProductImageUrl, generateWhatsAppLink } from '../lib/shopify';

const ProductCard = ({ product, agentNumber }) => {
  const variant = product.variants.edges[0]?.node;
  const price = variant?.price ? formatPrice(variant.price.amount, variant.price.currencyCode) : 'Price not available';
  const compareAtPrice = variant?.compareAtPrice ? formatPrice(variant.compareAtPrice.amount, variant.compareAtPrice.currencyCode) : null;
  const isOnSale = compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount);

  const stockStatus = () => {
    if (!product.availableForSale) return { text: 'Out of stock', color: 'text-red-600', available: false };
    if (variant?.quantityAvailable === 0) return { text: 'Out of stock', color: 'text-red-600', available: false };
    if (variant?.quantityAvailable) {
      if (variant.quantityAvailable <= 5) {
        return { text: `Only ${variant.quantityAvailable} left`, color: 'text-orange-600', available: true };
      }
      return { text: `${variant.quantityAvailable} in stock`, color: 'text-green-600', available: true };
    }
    return { text: 'In stock', color: 'text-green-600', available: true };
  };

  const stock = stockStatus();
  const imageUrl = getProductImageUrl(product, 'medium');

  const handleOrderClick = () => {
    if (agentNumber) {
      const whatsappLink = generateWhatsAppLink(agentNumber, product.title, price, imageUrl);
      window.open(whatsappLink, '_blank');
    } else {
      alert('No agent contact available. Please refresh the page with an agent parameter.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="relative h-64 bg-gray-200">
        <OptimizedImage
          src={imageUrl}
          alt={product.images?.edges?.[0]?.node?.altText || product.title}
          className="h-64"
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

      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2" title={product.title}>
          {product.title}
        </h3>

        {product.productType && (
          <p className="text-sm text-gray-500 mb-2">{product.productType}</p>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-gray-900">{price}</span>
          {isOnSale && (
            <span className="text-sm text-gray-500 line-through">{compareAtPrice}</span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-medium ${stock.color}`}>
            {stock.text}
          </span>
        </div>

        <button
          onClick={handleOrderClick}
          disabled={!stock.available}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            stock.available
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {stock.available ? 'Order via Agent' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;