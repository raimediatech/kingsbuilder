/**
 * Theme Asset Manager
 * Utility for managing Shopify theme assets
 */

import { prisma } from "~/db.server";
import { shopifyApi } from "~/shopify.server";

/**
 * Interface for theme asset data
 */
interface ThemeAssetData {
  key: string;
  value?: string;
  attachment?: string;
  contentType?: string;
}

/**
 * Class for managing Shopify theme assets
 */
export class ThemeAssetManager {
  /**
   * Get all themes for a shop
   */
  static async getThemes(session: any) {
    try {
      const client = new shopifyApi.clients.Rest({
        session,
      });

      const response = await client.get({
        path: "themes",
      });

      return response.body.themes;
    } catch (error) {
      console.error("Error fetching themes:", error);
      throw error;
    }
  }

  /**
   * Get all assets for a theme
   */
  static async getThemeAssets(session: any, themeId: string) {
    try {
      const client = new shopifyApi.clients.Rest({
        session,
      });

      const response = await client.get({
        path: `themes/${themeId}/assets`,
      });

      return response.body.assets;
    } catch (error) {
      console.error("Error fetching theme assets:", error);
      throw error;
    }
  }

  /**
   * Get a specific asset from a theme
   */
  static async getThemeAsset(session: any, themeId: string, key: string) {
    try {
      const client = new shopifyApi.clients.Rest({
        session,
      });

      const response = await client.get({
        path: `themes/${themeId}/assets`,
        query: { "asset[key]": key },
      });

      return response.body.asset;
    } catch (error) {
      console.error("Error fetching theme asset:", error);
      throw error;
    }
  }

  /**
   * Create or update a theme asset
   */
  static async updateThemeAsset(
    session: any,
    themeId: string,
    assetData: ThemeAssetData
  ) {
    try {
      const client = new shopifyApi.clients.Rest({
        session,
      });

      const response = await client.put({
        path: `themes/${themeId}/assets`,
        data: { asset: assetData },
      });

      return response.body.asset;
    } catch (error) {
      console.error("Error updating theme asset:", error);
      throw error;
    }
  }

  /**
   * Delete a theme asset
   */
  static async deleteThemeAsset(session: any, themeId: string, key: string) {
    try {
      const client = new shopifyApi.clients.Rest({
        session,
      });

      await client.delete({
        path: `themes/${themeId}/assets`,
        query: { "asset[key]": key },
      });

      return true;
    } catch (error) {
      console.error("Error deleting theme asset:", error);
      throw error;
    }
  }

  /**
   * Save theme asset to database
   */
  static async saveThemeAssetToDb(
    pageId: string,
    themeId: string,
    key: string,
    value: string
  ) {
    try {
      const themeAsset = await prisma.themeAsset.upsert({
        where: {
          id: `${pageId}-${themeId}-${key}`.replace(/[^a-zA-Z0-9]/g, "_"),
        },
        update: {
          value,
          updatedAt: new Date(),
        },
        create: {
          key,
          value,
          pageId,
          themeId,
        },
      });

      return themeAsset;
    } catch (error) {
      console.error("Error saving theme asset to database:", error);
      throw error;
    }
  }

  /**
   * Get theme assets for a page
   */
  static async getThemeAssetsForPage(pageId: string) {
    try {
      const themeAssets = await prisma.themeAsset.findMany({
        where: {
          pageId,
        },
      });

      return themeAssets;
    } catch (error) {
      console.error("Error fetching theme assets for page:", error);
      throw error;
    }
  }
}