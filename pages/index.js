import { useState, useEffect, useCallback } from 'react';
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

  const filterProducts = useCallback(async () => {
    if (searchTerm || selectedType) {
      // If searching or filtering, fetch from API
      setIsLoading(true);
      try {
        const data = await fetch(`/api/products?search=${searchTerm}&type=${selectedType}`);
        const result = await data.json();
        if (result.success) {
          const sortedProducts = result.products.sort((a, b) => {
            const aInStock = a.availableForSale && a.variants?.edges?.[0]?.node?.quantityAvailable > 0;
            const bInStock = b.availableForSale && b.variants?.edges?.[0]?.node?.quantityAvailable > 0;
            if (aInStock && !bInStock) return -1;
            if (!aInStock && bInStock) return 1;
            return 0;
          });
          setFilteredProducts(sortedProducts);
          setHasMore(result.hasNextPage);
          setCursor(result.endCursor);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // No search/filter, show all loaded products sorted by stock
      const sortedProducts = [...products].sort((a, b) => {
        const aInStock = a.availableForSale && a.variants?.edges?.[0]?.node?.quantityAvailable > 0;
        const bInStock = b.availableForSale && b.variants?.edges?.[0]?.node?.quantityAvailable > 0;
        if (aInStock && !bInStock) return -1;
        if (!aInStock && bInStock) return 1;
        return 0;
      });
      setFilteredProducts(sortedProducts);
    }
  }, [searchTerm, selectedType, products]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const loadMoreProducts = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const data = await fetch(`/api/products?cursor=${cursor}&search=${searchTerm}&type=${selectedType}`);
      const result = await data.json();

      if (result.success) {
        const sortedNewProducts = result.products.sort((a, b) => {
          const aInStock = a.availableForSale && a.variants?.edges?.[0]?.node?.quantityAvailable > 0;
          const bInStock = b.availableForSale && b.variants?.edges?.[0]?.node?.quantityAvailable > 0;
          if (aInStock && !bInStock) return -1;
          if (!aInStock && bInStock) return 1;
          return 0;
        });
        setProducts(prev => [...prev, ...sortedNewProducts]);
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="w-full px-2 sm:px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Kilang Desa Murni Batik</h1>
                <p className="text-gray-600 text-sm">Traditional Malaysian Batik from Terengganu</p>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="w-full px-2 sm:px-4">
            <div className="relative">
              {/* Mobile dropdown menu */}
              <div className="md:hidden">
                <select
                  className="w-full py-2 px-3 text-sm font-medium border-none bg-white focus:outline-none appearance-none"
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
                    .filter(collection => {
                      const title = collection.title.toLowerCase();
                      return !title.includes('sedondon') &&
                             !title.includes('kain ela') &&
                             !title.includes('best selling') &&
                             !title.includes('newest') &&
                             !title.includes('sampin') &&
                             !title.includes('luxe airis') &&
                             !title.includes('baju melayu') &&
                             !title.includes('crepe') &&
                             !title.includes('frabric') &&
                             !title.includes('men') &&
                             !title.includes('women') &&
                             !title.includes('damia cotton 1.0') &&
                             !title.includes('crepe bot') &&
                             !title.includes('kids') &&
                             !title.includes('fabric') &&
                             !title.includes('damia2.0') &&
                             !title.includes('damia 2.0') &&
                             !title.includes('sutera collection') &&
                             !title.includes('cotton bot');
                    })
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

              {/* Desktop dropdown */}
              <div className="hidden md:block">
                <div className="py-2">
                  <select
                    className="w-full py-2 px-3 text-sm font-medium border-none bg-white focus:outline-none appearance-none"
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
                      .filter(collection => {
                        const title = collection.title.toLowerCase();
                        return !title.includes('sedondon') &&
                               !title.includes('kain ela') &&
                               !title.includes('best selling') &&
                               !title.includes('newest') &&
                               !title.includes('sampin') &&
                               !title.includes('luxe airis') &&
                               !title.includes('baju melayu') &&
                               !title.includes('crepe') &&
                               !title.includes('frabric') &&
                               !title.includes('men') &&
                               !title.includes('women') &&
                               !title.includes('damia cotton 1.0') &&
                               !title.includes('crepe bot') &&
                               !title.includes('kids') &&
                               !title.includes('fabric') &&
                               !title.includes('damia2.0') &&
                             !title.includes('damia 2.0') &&
                               !title.includes('sutera collection') &&
                               !title.includes('cotton bot');
                      })
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
              </div>
            </div>
          </div>
        </nav>

        {/* Search */}
        <div className="w-full px-2 sm:px-4 py-3">
          <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
            <div className="max-w-md mx-auto">
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
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3">
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
        <footer className="bg-white border-t mt-6">
          <div className="w-full px-2 sm:px-4 py-4">
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