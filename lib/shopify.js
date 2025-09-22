const shopifyStorefront = async (query, variables = {}) => {
  const response = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-07/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_API_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data;
};

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          productType
          tags
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const PRODUCT_TYPES_QUERY = `
  query GetProductTypes {
    productTypes(first: 50) {
      edges {
        node
      }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            id
            url
            altText
          }
        }
      }
    }
  }
`;

const PRODUCTS_BY_COLLECTION_QUERY = `
  query GetProductsByCollection($handle: String!, $first: Int!, $after: String) {
    collectionByHandle(handle: $handle) {
      id
      title
      description
      products(first: $first, after: $after) {
        edges {
          node {
            id
            title
            handle
            description
            availableForSale
            productType
            tags
            images(first: 5) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                  }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  availableForSale
                  quantityAvailable
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`;

export const getAllProducts = async (cursor = null, query = null) => {
  const variables = {
    first: 50,
    ...(cursor && { after: cursor }),
    ...(query && { query }),
  };

  try {
    const data = await shopifyStorefront(PRODUCTS_QUERY, variables);
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductTypes = async () => {
  try {
    const data = await shopifyStorefront(PRODUCT_TYPES_QUERY);
    return data.productTypes.edges.map(edge => edge.node);
  } catch (error) {
    console.error('Error fetching product types:', error);
    return [];
  }
};

export const getAllCollections = async () => {
  const variables = { first: 50 };

  try {
    const data = await shopifyStorefront(COLLECTIONS_QUERY, variables);
    return data.collections.edges.map(edge => edge.node);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
};

export const getProductsByCollection = async (collectionHandle, cursor = null) => {
  const variables = {
    handle: collectionHandle,
    first: 50,
    ...(cursor && { after: cursor }),
  };

  try {
    const data = await shopifyStorefront(PRODUCTS_BY_COLLECTION_QUERY, variables);
    return data.collectionByHandle;
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    return null;
  }
};

export const formatPrice = (amount, currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
};

export const getProductImageUrl = (product, size = 'medium') => {
  if (!product.images?.edges?.length) {
    return '/placeholder-product.svg';
  }

  let imageUrl = product.images.edges[0].node.url;

  // For Shopify images, we can use URL parameters to resize
  if (imageUrl.includes('cdn.shopify.com')) {
    const sizeMap = {
      small: '300x300',
      medium: '600x600',
      large: '1200x1200',
    };

    const targetSize = sizeMap[size] || sizeMap.medium;

    // Remove existing size parameters and add new one
    imageUrl = imageUrl.split('?')[0]; // Remove query params
    imageUrl = imageUrl.replace(/_\d+x\d+/g, ''); // Remove existing size suffix

    // Add size parameter (akan gunakan format WebP default dari Shopify)
    imageUrl = `${imageUrl}_${targetSize}`;
  }

  return imageUrl;
};

export const generateWhatsAppLink = (agentNumber, productName, productPrice, productImageUrl = null) => {
  let message = `Hi, I want to order *${productName}* (${productPrice}). Can you help me with this?`;

  if (productImageUrl) {
    message += `\n\n📸 *Product Photo:*\n${productImageUrl}`;
  }

  return `https://wa.me/${agentNumber}?text=${encodeURIComponent(message)}`;
};