import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";

// Configure MongoDB session storage
const mongoUrl = process.env.MONGODB_URI || process.env.DATABASE_URL || "";
console.log("MongoDB URL configured:", mongoUrl ? "Yes" : "No");

const sessionStorage = MongoDBSessionStorage.withCredentials(
  mongoUrl,
  {
    sessionCollectionName: "shopify_sessions",
  }
);

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || "128d69fb5441ba3eda3ae4694c71b175",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(",") || ["write_products", "write_content", "read_content", "write_themes", "read_themes"],
  appUrl: process.env.SHOPIFY_APP_URL || "https://kingsbuilder.vercel.app",
  authPathPrefix: "/auth",
  sessionStorage: sessionStorage,
  distribution: AppDistribution.AppStore,
  isEmbeddedApp: true,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  hooks: {
    afterAuth: async ({ session }) => {
      // This is called after authentication is complete
      shopify.registerWebhooks({ session });
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
