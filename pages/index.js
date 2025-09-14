import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { getAllProducts, getProductTypes, getAllCollections } from '../lib/shopify';

export default function Home({ initialProducts, productTypes, collections, hasNextPage, endCursor }) {
  const router = useRouter();
  const { agent } = router.query;

  const [products, setProducts] = useState(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(hasNextPage);
  const [cursor, setCursor] = useState(endCursor);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedType, products]);

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(product => product.productType === selectedType);
    }

    setFilteredProducts(filtered);
  };

  const loadMoreProducts = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const data = await fetch(`/api/products?cursor=${cursor}&search=${searchTerm}&type=${selectedType}`);
      const result = await data.json();

      if (result.success) {
        setProducts(prev => [...prev, ...result.products]);
        setHasMore(result.hasNextPage);
        setCursor(result.endCursor);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const agentNumber = agent || process.env.NEXT_PUBLIC_DEFAULT_AGENT_NUMBER;

  return (
    <>
      <Head>
        <title>Product Catalog - Kilang Desa Murni Batik</title>
        <meta name="description" content="Browse our beautiful collection of traditional Malaysian batik from Terengganu" />
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
                <select
                  className="w-full py-3 px-4 text-sm font-medium border-none bg-white focus:outline-none appearance-none"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      window.location.href = e.target.value;
                    }
                  }}
                >
                  <option value="">📂 Browse Collections</option>
                  <option value={`/${agent ? `?agent=${agent}` : ''}`}>📦 All Products</option>
                  {collections
                    .filter(collection =>
                      collection.title.toLowerCase().includes('batik') &&
                      !collection.title.toLowerCase().includes('sedondon')
                    )
                    .map(collection => (
                    <option
                      key={collection.id}
                      value={`/collections/${collection.handle}${agent ? `?agent=${agent}` : ''}`}
                    >
                      👘 {collection.title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Desktop horizontal scroll with navigation arrows */}
              <div className="hidden md:block">
                <div className="relative flex items-center">
                  {/* Left scroll button */}
                  <button
                    onClick={() => {
                      const scrollContainer = document.getElementById('nav-scroll-container');
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
                    id="nav-scroll-container"
                    className="flex items-center space-x-2 py-4 overflow-x-auto scrollbar-hidden mx-8"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <div className="flex space-x-2 min-w-max px-4">
                      <Link
                        href={`/${agent ? `?agent=${agent}` : ''}`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-full hover:bg-primary-700 transition-colors whitespace-nowrap shadow-sm"
                      >
                        📦 All Products
                      </Link>
                      {collections
                        .filter(collection =>
                          collection.title.toLowerCase().includes('batik') &&
                          !collection.title.toLowerCase().includes('sedondon')
                        )
                        .map(collection => (
                        <Link
                          key={collection.id}
                          href={`/collections/${collection.handle}${agent ? `?agent=${agent}` : ''}`}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-full transition-colors whitespace-nowrap shadow-sm"
                        >
                          👘 {collection.title}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right scroll button */}
                  <button
                    onClick={() => {
                      const scrollContainer = document.getElementById('nav-scroll-container');
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

        {/* Search and Filter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="sm:w-64">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  id="category"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {productTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Showing {filteredProducts.length} products
              {searchTerm && ` for "${searchTerm}"`}
              {selectedType && ` in "${selectedType}"`}
            </p>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
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
          {hasMore && !searchTerm && !selectedType && (
            <div className="text-center">
              <button
                onClick={loadMoreProducts}
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Load More Products'}
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
    const [productsData, productTypes, collections] = await Promise.all([
      getAllProducts(),
      getProductTypes(),
      getAllCollections()
    ]);

    const products = productsData?.edges?.map(edge => edge.node) || [];

    return {
      props: {
        initialProducts: products,
        productTypes,
        collections,
        hasNextPage: productsData?.pageInfo?.hasNextPage || false,
        endCursor: productsData?.pageInfo?.endCursor || null,
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);

    return {
      props: {
        initialProducts: [],
        productTypes: [],
        collections: [],
        hasNextPage: false,
        endCursor: null,
        error: 'Failed to load products. Please check your Shopify configuration.'
      }
    };
  }
}