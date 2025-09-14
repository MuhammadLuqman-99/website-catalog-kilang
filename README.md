# Shopify Product Catalog Website

A view-only product catalog website that displays products from your Shopify store with agent contact integration. Built with Next.js and Tailwind CSS.

## Features

- 🛍️ **View-Only Catalog**: Display products without checkout functionality
- 📱 **Responsive Design**: Works perfectly on mobile and desktop
- 🔍 **Search & Filter**: Find products by name, description, or category
- 📞 **Agent Integration**: WhatsApp contact buttons for ordering
- 🚀 **Fast Loading**: Optimized images and pagination
- 💳 **No E-commerce**: Intentionally removes cart/checkout features

## Tech Stack

- **Next.js 14** - React framework
- **Tailwind CSS** - Utility-first CSS framework
- **Shopify Storefront API** - GraphQL API for product data
- **Vercel/Netlify Ready** - Serverless deployment

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Shopify credentials:

```env
# Shopify Configuration
SHOPIFY_STORE_DOMAIN=your-store-name.myshopify.com
SHOPIFY_STOREFRONT_API_TOKEN=your-storefront-access-token

# Default Agent Configuration (optional)
NEXT_PUBLIC_DEFAULT_AGENT_NUMBER=0187624392
```

### 3. Get Shopify Credentials

#### Store Domain
Your store domain is: `your-store-name.myshopify.com`

#### Storefront Access Token
1. Go to your Shopify Admin
2. Navigate to **Apps** → **Manage private apps**
3. Create a new private app or use an existing one
4. Enable **Storefront API access**
5. Copy the **Storefront access token**

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your catalog.

## Usage

### Basic URL
```
https://your-domain.com
```

### With Agent Parameter
```
https://your-domain.com?agent=0187624392
```

When customers click "Order via Agent", they'll be redirected to WhatsApp with a pre-filled message containing the product details.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `SHOPIFY_STORE_DOMAIN`
   - `SHOPIFY_STOREFRONT_API_TOKEN`
   - `NEXT_PUBLIC_DEFAULT_AGENT_NUMBER` (optional)
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Deploy!

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

## Project Structure

```
shopify-catalog-viewer/
├── components/
│   └── ProductCard.js          # Individual product display
├── lib/
│   └── shopify.js              # Shopify API integration
├── pages/
│   ├── api/
│   │   └── products.js         # API route for pagination
│   ├── _app.js                 # App configuration
│   └── index.js                # Main catalog page
├── public/
│   └── placeholder-product.svg # Fallback product image
├── styles/
│   └── globals.css             # Global styles and Tailwind
├── .env.example                # Environment template
├── .env.local                  # Your environment variables
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies
```

## Features Explained

### Product Display
- **Images**: Optimized with Next.js Image component
- **Pricing**: Displays regular and sale prices
- **Stock Status**: Shows availability and quantity
- **Categories**: Product type filtering

### Agent Integration
- **WhatsApp Links**: Auto-generates messages with product details
- **Dynamic Agent**: URL parameter overrides default agent
- **Contact Info**: Displays active agent in header

### Search & Filtering
- **Real-time Search**: Filter by product name or description
- **Category Filter**: Filter by product type
- **Combined Filters**: Search and category work together

### Performance
- **Server-Side Rendering**: Fast initial page load
- **Lazy Loading**: Images load as needed
- **Pagination**: Load more products on demand

## Customization

### Styling
Edit `tailwind.config.js` to customize colors, fonts, and spacing:

```js
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-brand-color',
      }
    }
  }
}
```

### Product Data
The Shopify GraphQL query in `lib/shopify.js` fetches:
- Product title, description, images
- Variants with pricing and stock
- Product types for filtering

### WhatsApp Message
Customize the WhatsApp message template in `lib/shopify.js`:

```js
const message = encodeURIComponent(
  `Hi, I want to order ${productName} (${productPrice}). Can you help me with this?`
);
```

## Troubleshooting

### Common Issues

**Products not loading**
- Verify your Shopify credentials in `.env.local`
- Check that your Storefront API is enabled
- Ensure your access token has the right permissions

**Images not displaying**
- Add your Shopify CDN domain to `next.config.js`:
```js
images: {
  domains: ['cdn.shopify.com'],
}
```

**WhatsApp links not working**
- Verify the agent number format (country code without +)
- Test the generated WhatsApp URL manually

### API Limits
The Shopify Storefront API has rate limits:
- **Unauthenticated**: 200 requests per minute
- **Authenticated**: 1000 requests per minute

## Support

For issues related to:
- **Shopify API**: Check [Shopify Storefront API documentation](https://shopify.dev/api/storefront)
- **Next.js**: Visit [Next.js documentation](https://nextjs.org/docs)
- **Deployment**: Check Vercel or Netlify documentation

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ for small businesses wanting to showcase their Shopify products without the complexity of full e-commerce functionality.