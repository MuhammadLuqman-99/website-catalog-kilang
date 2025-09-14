import { getProductsByCollection } from '../../../lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { handle, cursor, search } = req.query;

    const collectionData = await getProductsByCollection(handle, cursor);

    if (!collectionData) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    let products = collectionData.products?.edges?.map(edge => edge.node) || [];

    // Apply search filter if provided
    if (search) {
      products = products.filter(product =>
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return res.status(200).json({
      success: true,
      collection: {
        id: collectionData.id,
        title: collectionData.title,
        description: collectionData.description
      },
      products,
      hasNextPage: collectionData.products?.pageInfo?.hasNextPage || false,
      endCursor: collectionData.products?.pageInfo?.endCursor || null,
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch collection products',
      message: error.message
    });
  }
}