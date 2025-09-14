import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAllCollections } from '../../lib/shopify';

export default function Collection({ collections }) {
  const router = useRouter();
  const { agent, handle } = router.query;

  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);

  // Fetch collection data when handle changes
  useEffect(() => {
    if (!handle) return;

    const fetchCollection = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/collections/${handle}`);
        const data = await response.json();

        if (data.success) {
          setCollection(data.collection);
          setProducts(data.products);
          setHasMore(data.hasNextPage);
          setCursor(data.endCursor);
        } else {
          setCollection(null);
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        setCollection(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [handle]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const loadMoreProducts = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const data = await fetch(`/api/collections/${handle}?cursor=${cursor}&search=${searchTerm}`);
      const result = await data.json();

      if (result.success) {
        setProducts(prev => [...prev, ...result.products]);
        setHasMore(result.hasNextPage);
        setCursor(result.endCursor);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const agentNumber = agent || process.env.NEXT_PUBLIC_DEFAULT_AGENT_NUMBER;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
          <Link href="/" className="btn-primary">
            Back to All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{collection.title} - Kilang Desa Murni Batik</title>
        <meta name="description" content={collection.description || `Browse ${collection.title} collection`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kilang Desa Murni Batik</h1>
                <p className="text-gray-600 mt-1">Traditional Malaysian Batik from Terengganu</p>
              </div>
              {agentNumber && (
                <div className="mt-4 sm:mt-0">
                  <div className="bg-green-100 px-3 py-2 rounded-lg">
                    <p className="text-sm text-green-800">
                      Agent: <span className="font-medium">{agentNumber}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Mobile dropdown menu */}
              <div className="md:hidden">
                <div className="relative">
                  <div className="w-full py-3 px-4 text-sm font-medium bg-white border border-gray-200 rounded-lg">
                    <span className="text-gray-700">👘 {collection?.title || 'Current Collection'}</span>
                  </div>
                  <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        window.location.href = e.target.value;
                      }
                    }}
                  >
                    <option value="">👘 {collection?.title || 'Current Collection'}</option>
                    <option value={`/${agent ? `?agent=${agent}` : ''}`}>📦 All Products</option>
                    {collections
                      .filter(col =>
                        col.title.toLowerCase().includes('batik') &&
                        !col.title.toLowerCase().includes('sedondon')
                      )
                      .map(col => (
                      <option
                        key={col.id}
                        value={`/collections/${col.handle}${agent ? `?agent=${agent}` : ''}`}
                      >
                        👘 {col.title}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Desktop horizontal scroll with navigation arrows */}
              <div className="hidden md:block">
                <div className="relative flex items-center">
                  {/* Left scroll button */}
                  <button
                    onClick={() => {
                      const scrollContainer = document.getElementById('collection-nav-scroll-container');
                      scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                    className="absolute left-0 z-10 p-2 bg-white shadow-md rounded-full border hover:bg-gray-50 transition-colors"
                    style={{ transform: 'translateX(-50%)' }}
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Scrollable container */}
                  <div
                    id="collection-nav-scroll-container"
                    className="flex items-center space-x-2 py-4 overflow-x-auto scrollbar-hidden mx-8"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <div className="flex space-x-2 min-w-max px-4">
                      <Link
                        href={`/${agent ? `?agent=${agent}` : ''}`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-full transition-colors whitespace-nowrap shadow-sm"
                      >
                        📦 All Products
                      </Link>
                      {collections
                        .filter(col =>
                          col.title.toLowerCase().includes('batik') &&
                          !col.title.toLowerCase().includes('sedondon')
                        )
                        .map(col => (
                        <Link
                          key={col.id}
                          href={`/collections/${col.handle}${agent ? `?agent=${agent}` : ''}`}
                          className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap shadow-sm ${
                            col.handle === handle
                              ? 'text-white bg-primary-600 hover:bg-primary-700'
                              : 'text-gray-700 bg-gray-100 hover:bg-primary-100 hover:text-primary-700'
                          }`}
                        >
                          👘 {col.title}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right scroll button */}
                  <button
                    onClick={() => {
                      const scrollContainer = document.getElementById('collection-nav-scroll-container');
                      scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                    className="absolute right-0 z-10 p-2 bg-white shadow-md rounded-full border hover:bg-gray-50 transition-colors"
                    style={{ transform: 'translateX(50%)' }}
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Collection Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{collection.title}</h2>
            {collection.description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{collection.description}</p>
            )}
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="max-w-md mx-auto">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search in {collection.title}
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Showing {filteredProducts.length} products in {collection.title}
              {searchTerm && ` for "${searchTerm}"`}
            </p>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    agentNumber={agentNumber}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Load More Button */}
          {hasMore && !searchTerm && (
            <div className="text-center">
              <button
                onClick={loadMoreProducts}
                disabled={isLoadingMore}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {isLoadingMore && <LoadingSpinner size="small" />}
                {isLoadingMore ? 'Loading...' : 'Load More Products'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; 2024 Kilang Desa Murni Batik. All rights reserved.</p>
              <p className="mt-2 text-sm">Contact our agent to place your order!</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const collections = await getAllCollections();

    return {
      props: {
        collections
      }
    };
  } catch (error) {
    console.error('Error fetching collections:', error);

    return {
      props: {
        collections: []
      }
    };
  }
}