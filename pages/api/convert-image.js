import sharp from 'sharp';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Skip placeholder images and non-Shopify CDN images
    if (imageUrl.includes('placeholder') || !imageUrl.includes('cdn.shopify.com')) {
      return res.status(400).json({ error: 'Only Shopify CDN images are supported for conversion' });
    }

    console.log('Processing image URL:', imageUrl);

    // Fetch the image from Shopify
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    console.log('Original image content type:', contentType);

    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    console.log('Original image size:', buffer.length, 'bytes');

    // Check if image is already PNG and under 2MB
    if (contentType === 'image/png' && buffer.length < 2 * 1024 * 1024) {
      console.log('Image is already PNG and under 2MB, returning as-is');
      const base64Image = buffer.toString('base64');
      return res.status(200).json({
        success: true,
        image: `data:image/png;base64,${base64Image}`,
        size: buffer.length,
        quality: 'original',
        originalFormat: contentType
      });
    }

    // Convert to PNG - no quality loss but may be larger
    let convertedBuffer = await sharp(buffer)
      .png({
        compressionLevel: 6,
        palette: true
      })
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();

    console.log(`PNG conversion: ${convertedBuffer.length} bytes`);

    // If PNG is over 2MB, fall back to high-quality JPG
    if (convertedBuffer.length > 2 * 1024 * 1024) {
      console.log('PNG too large, converting to JPG...');
      let quality = 85;

      do {
        convertedBuffer = await sharp(buffer)
          .jpeg({
            quality,
            progressive: true,
            mozjpeg: true
          })
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .toBuffer();

        console.log(`JPG Quality ${quality}: ${convertedBuffer.length} bytes`);

        if (convertedBuffer.length > 2 * 1024 * 1024) {
          quality -= 10;
        }
      } while (convertedBuffer.length > 2 * 1024 * 1024 && quality > 30);

      const base64Image = convertedBuffer.toString('base64');

      return res.status(200).json({
        success: true,
        image: `data:image/jpeg;base64,${base64Image}`,
        size: convertedBuffer.length,
        quality: quality,
        originalFormat: contentType,
        convertedTo: 'JPG (PNG was too large)'
      });
    }

    // Return PNG
    const base64Image = convertedBuffer.toString('base64');

    console.log('Final PNG size:', convertedBuffer.length, 'bytes');

    res.status(200).json({
      success: true,
      image: `data:image/png;base64,${base64Image}`,
      size: convertedBuffer.length,
      quality: 'lossless',
      originalFormat: contentType,
      convertedTo: 'PNG'
    });

  } catch (error) {
    console.error('Image conversion error:', error);
    res.status(500).json({
      error: 'Failed to convert image',
      details: error.message
    });
  }
}