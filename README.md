# KingsBuilder - Shopify Page Builder App

KingsBuilder is a powerful page builder app for Shopify that allows merchants to create custom pages without writing any code. With an intuitive drag-and-drop interface and real-time preview, creating beautiful pages has never been easier.

![KingsBuilder Logo](https://via.placeholder.com/200x200.png?text=KB)

## Features

- **Drag-and-Drop Editor**: Create pages visually with no coding required
- **Real-time Preview**: See your changes as you make them
- **Mobile Responsive**: All pages look great on any device
- **SEO Optimization**: Built-in tools to improve your page's search ranking
- **Shopify Integration**: Seamlessly integrates with your Shopify store
- **Save & Publish**: Save drafts and publish when ready
- **Dashboard**: Manage all your pages in one place

## Deployment Instructions

### 1. Configure Shopify App in Partner Dashboard

1. Log in to your [Shopify Partners Dashboard](https://partners.shopify.com)
2. Navigate to Apps > Create App
3. Enter app name: "KingsBuilder"
4. Set App URL to: `https://kingsbuilder-git-main-ajay-rais-projects.vercel.app`
5. Add the following Redirect URLs:
   - `https://kingsbuilder-git-main-ajay-rais-projects.vercel.app/auth/callback`
   - `https://kingsbuilder-git-main-ajay-rais-projects.vercel.app/auth/shopify/callback`
   - `https://kingsbuilder-git-main-ajay-rais-projects.vercel.app/api/auth/callback`
6. Under "App setup", request the following scopes:
   - `write_products`, `read_products`
   - `write_customers`, `read_customers`
   - `write_orders`, `read_orders`
7. Copy your API Key and API Secret for the next step

### 2. Deploy to Vercel

1. Fork this repository to your GitHub account
2. Sign up for [Vercel](https://vercel.com) if you haven't already
3. Create a new project and import your GitHub repository
4. Configure the following environment variables:
   ```
   SHOPIFY_API_KEY=your_api_key_from_shopify
   SHOPIFY_API_SECRET=your_api_secret_from_shopify
   DATABASE_URL=mongodb+srv://kingsbuilder_admin:2BAvGrHLw63hWd3@cluster0.3wvn3jk.mongodb.net/kingsbuilder?retryWrites=true&w=majority&appName=Cluster0
   SHOPIFY_APP_URL=https://kingsbuilder-git-main-ajay-rais-projects.vercel.app
   HOST=https://kingsbuilder-git-main-ajay-rais-projects.vercel.app
   SCOPES=write_products,read_products,write_customers,read_customers,write_orders,read_orders
   NODE_ENV=production
   ```
5. Deploy the project

### 3. Update Configuration Files

1. Update the `.shopify.app.toml` file with your API key
2. Update the `vercel.json` file with your API key and secret
3. Update the `api/index.js` file with your API key

### 4. Install on Your Shopify Store

1. Go to your Shopify admin: `https://admin.shopify.com/store/your-store-name`
2. Navigate to Apps > Add apps
3. Search for your app or use the direct URL: `https://kingsbuilder-git-main-ajay-rais-projects.vercel.app`
4. Complete the installation process
5. You should now see the KingsBuilder app in your Shopify admin

### 5. Troubleshooting Common Issues

If you encounter the "accounts.shopify.com refused to connect" error:

1. Check that your API key is correctly set in all files
2. Verify that your redirect URLs are properly configured in the Shopify Partner Dashboard
3. Make sure CORS is properly configured for Shopify domains
4. Check that your app is using the correct AppBridge version

If pages aren't loading from Shopify:

1. Check that your access token is being properly stored and retrieved
2. Verify that your Shopify API version is correct (currently using 2023-10)
3. Check the browser console and server logs for any API errors
4. Make sure your app has the necessary scopes (write_content, read_content)

If you can't save or update pages:

1. Check that your API endpoints are correctly configured
2. Verify that your MongoDB connection is working
3. Check that your shop domain is being properly passed in the headers
4. Make sure your access token has the necessary permissions

## Local Development

To run the app locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Support

If you need help or have any questions, please contact us at support@kingsbuilder.com.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
