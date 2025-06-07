# KingsBuilder Deployment Guide

## How to Deploy and Test KingsBuilder

### Prerequisites
- Shopify Partner account
- Development store
- KingsBuilder app code
- Shopify API credentials

### Step 1: Configure Your Shopify App
1. Log in to your [Shopify Partners account](https://partners.shopify.com)
2. Navigate to "Apps" and click "Create app"
3. Enter app details:
   - Name: KingsBuilder
   - App URL: https://kingsbuilder-git-main-ajay-rais-projects.vercel.app
   - Allowed redirection URL(s): https://kingsbuilder-git-main-ajay-rais-projects.vercel.app/auth/callback
4. Save your API credentials (API Key and API Secret Key)
5. Add these credentials to your Vercel environment variables

### Step 2: Deploy to Vercel
1. Make sure your code is pushed to GitHub
2. Log in to Vercel and import your GitHub repository
3. Configure the following environment variables:
   - DATABASE_URL: mongodb+srv://kingsbuilder_admin:2BAvGrHLw63hWd3@cluster0.3wvn3jk.mongodb.net/kingsbuilder?retryWrites=true&w=majority&appName=Cluster0
   - SHOPIFY_APP_URL: https://kingsbuilder-git-main-ajay-rais-projects.vercel.app
   - SHOPIFY_API_KEY: (your Shopify API key)
   - SHOPIFY_API_SECRET: (your Shopify API secret)
   - SCOPES: write_products,read_products,write_customers,read_customers,write_orders,read_orders
   - NODE_ENV: production
4. Deploy your app

### Step 3: Install on Development Store
1. In your Shopify Partners dashboard, create a development store if you don't have one
2. Go to Apps > Add apps > Add unlisted app
3. Enter your app URL: https://kingsbuilder-git-main-ajay-rais-projects.vercel.app
4. Complete the OAuth flow to install your app

### Step 4: Test Your App
1. After installation, you should be redirected to your app in the Shopify admin
2. Test all features according to the testing checklist
3. Report any issues using the feedback form

## Troubleshooting
- If you see "server IP address could not be found" error, check your DNS settings and Vercel deployment
- Make sure your environment variables are correctly set in Vercel
- Verify that your MongoDB connection string is correct
- Check Vercel deployment logs for any errors
