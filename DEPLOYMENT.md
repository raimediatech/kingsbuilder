# KingsBuilder Deployment Guide

This document provides instructions for deploying the KingsBuilder Shopify app to Vercel.

## Prerequisites

Before deploying, ensure you have:

1. A Shopify Partners account
2. A MongoDB database (Atlas recommended)
3. A Vercel account
4. A GitHub repository for your code

## Environment Variables

The following environment variables are required for deployment:

```
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SCOPES=write_products
SHOPIFY_APP_URL=https://your-vercel-app-url.vercel.app
NODE_ENV=production
DATABASE_URL=your_mongodb_connection_string
```

## Deployment Steps

### 1. Prepare Your Code

Ensure your code is ready for deployment:

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Commit changes
git add .
git commit -m "Prepare for deployment"
git push
```

### 2. Set Up Vercel

1. Log in to your Vercel account
2. Create a new project and connect it to your GitHub repository
3. Configure the environment variables listed above
4. Deploy the project

### 3. Update Shopify App Settings

In your Shopify Partners dashboard:

1. Update the App URL to your Vercel deployment URL
2. Add the following Allowed Redirection URL(s):
   - `https://your-vercel-app-url.vercel.app/auth/callback`
   - `https://your-vercel-app-url.vercel.app/auth/shopify/callback`
   - `https://your-vercel-app-url.vercel.app/api/auth/callback`

### 4. Verify Deployment

1. Visit your Vercel deployment URL
2. Check the Vercel logs for any errors
3. Test the app installation flow in a development store

## Troubleshooting

### 500 Error on Deployment

If you encounter a 500 error:

1. Check the Vercel logs for specific error messages
2. Verify that all environment variables are correctly set
3. Ensure your MongoDB connection string is valid
4. Check that your Shopify API credentials are correct

### MongoDB Connection Issues

If you have issues connecting to MongoDB:

1. Verify your connection string is correct
2. Ensure your IP address is whitelisted in MongoDB Atlas
3. Check that your database user has the correct permissions

### Shopify Authentication Problems

If Shopify authentication fails:

1. Verify your API key and secret are correct
2. Ensure your app URL is correctly set in both Vercel and Shopify
3. Check that your redirect URLs are properly configured

## Maintenance

### Updating Your App

To update your deployed app:

1. Make your changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Vercel will automatically deploy the changes

### Monitoring

Monitor your app's performance using:

1. Vercel analytics
2. MongoDB Atlas monitoring
3. Shopify Partner Dashboard

## Support

If you encounter issues not covered in this guide, please contact the development team or refer to the following resources:

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Shopify App Development Documentation](https://shopify.dev/docs/apps)