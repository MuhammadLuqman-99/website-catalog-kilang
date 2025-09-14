import { getAllProducts } from '../../lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cursor, search, type } = req.query;

    let query = null;
    if (search || type) {
      const searchQueries = [];
      if (search) {
        searchQueries.push(`title:*${search}* OR body:*${search}*`);
      }
      if (type) {
        searchQueries.push(`product_type:${type}`);
      }
      query = searchQueries.join(' AND ');
    }

    const productsData = await getAllProducts(cursor, query);
    const products = productsData?.edges?.map(edge => edge.node) || [];

    return res.status(200).json({
      success: true,
      products,
      hasNextPage: productsData?.pageInfo?.hasNextPage || false,
      endCursor: productsData?.pageInfo?.endCursor || null,
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
}