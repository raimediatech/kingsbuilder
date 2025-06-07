# KingsBuilder - Shopify Page Builder App

## Deployment Instructions

To deploy and test the KingsBuilder app:

1. **Configure Shopify App**:
   - Create a new app in your Shopify Partners dashboard
   - Set App URL to: https://kingsbuilder-git-main-ajay-rais-projects.vercel.app
   - Set Redirect URL to: https://kingsbuilder-git-main-ajay-rais-projects.vercel.app/auth/callback
   - Copy your API Key and API Secret

2. **Configure Environment Variables**:
   - Add the following to your Vercel project:
     - SHOPIFY_API_KEY: (your API key)
     - SHOPIFY_API_SECRET: (your API secret)
     - DATABASE_URL: mongodb+srv://kingsbuilder_admin:2BAvGrHLw63hWd3@cluster0.3wvn3jk.mongodb.net/kingsbuilder?retryWrites=true&w=majority&appName=Cluster0
     - SHOPIFY_APP_URL: https://kingsbuilder-git-main-ajay-rais-projects.vercel.app
     - SCOPES: write_products,read_products,write_customers,read_customers,write_orders,read_orders
     - NODE_ENV: production

3. **Deploy to Vercel**:
   - Connect your GitHub repository
   - Configure build settings
   - Deploy

4. **Install on Development Store**:
   - Go to your development store
   - Add the app using the URL: https://kingsbuilder-git-main-ajay-rais-projects.vercel.app
   - Complete the installation process

5. **Test the App**:
   - Create test pages
   - Try all features
   - Report any issues

For detailed instructions, see the deployment guide in the beta folder.
