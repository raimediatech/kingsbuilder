/**
 * Cache Manager Utility
 * Handles caching strategies for the application
 */

import { createHash } from 'crypto';
import { prisma } from '~/db.server';

/**
 * Cache types
 */
export enum CacheType {
  PAGE = 'page',
  TEMPLATE = 'template',
  THEME_ASSET = 'theme_asset',
  API_RESPONSE = 'api_response',
}

/**
 * Interface for cache entry
 */
interface CacheEntry {
  key: string;
  type: CacheType;
  data: string;
  expiresAt: Date;
}

/**
 * Cache manager class
 */
export class CacheManager {
  /**
   * Default cache expiration time in seconds (1 hour)
   */
  private static DEFAULT_EXPIRATION = 3600;

  /**
   * Generate a cache key
   */
  static generateCacheKey(type: CacheType, identifier: string, params: Record<string, any> = {}): string {
    // Create a string representation of the params
    const paramsString = Object.keys(params).length > 0
      ? JSON.stringify(params)
      : '';
    
    // Create a hash of the identifier and params
    const hash = createHash('md5')
      .update(`${type}:${identifier}:${paramsString}`)
      .digest('hex');
    
    return hash;
  }

  /**
   * Set a cache entry
   */
  static async setCache(
    type: CacheType,
    identifier: string,
    data: any,
    expirationSeconds: number = this.DEFAULT_EXPIRATION,
    params: Record<string, any> = {}
  ): Promise<void> {
    try {
      const key = this.generateCacheKey(type, identifier, params);
      const expiresAt = new Date(Date.now() + expirationSeconds * 1000);
      
      // Store data as string
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Use upsert to create or update the cache entry
      await prisma.cache.upsert({
        where: { key },
        update: {
          data: dataString,
          expiresAt,
        },
        create: {
          key,
          type,
          data: dataString,
          expiresAt,
        },
      });
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * Get a cache entry
   */
  static async getCache<T>(
    type: CacheType,
    identifier: string,
    params: Record<string, any> = {}
  ): Promise<T | null> {
    try {
      const key = this.generateCacheKey(type, identifier, params);
      
      // Get the cache entry
      const cacheEntry = await prisma.cache.findUnique({
        where: { key },
      });
      
      // Check if the cache entry exists and is not expired
      if (!cacheEntry || cacheEntry.expiresAt < new Date()) {
        // If expired, delete the cache entry
        if (cacheEntry) {
          await prisma.cache.delete({
            where: { key },
          });
        }
        return null;
      }
      
      // Parse the data if it's JSON
      try {
        return JSON.parse(cacheEntry.data) as T;
      } catch {
        // If it's not JSON, return as is
        return cacheEntry.data as unknown as T;
      }
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  /**
   * Delete a cache entry
   */
  static async deleteCache(
    type: CacheType,
    identifier: string,
    params: Record<string, any> = {}
  ): Promise<void> {
    try {
      const key = this.generateCacheKey(type, identifier, params);
      
      await prisma.cache.delete({
        where: { key },
      });
    } catch (error) {
      console.error('Error deleting cache:', error);
    }
  }

  /**
   * Clear all cache entries of a specific type
   */
  static async clearCacheByType(type: CacheType): Promise<void> {
    try {
      await prisma.cache.deleteMany({
        where: { type },
      });
    } catch (error) {
      console.error('Error clearing cache by type:', error);
    }
  }

  /**
   * Clear all expired cache entries
   */
  static async clearExpiredCache(): Promise<void> {
    try {
      await prisma.cache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  /**
   * Cache a page
   */
  static async cachePage(pageId: string, content: string, expirationSeconds: number = this.DEFAULT_EXPIRATION): Promise<void> {
    await this.setCache(CacheType.PAGE, pageId, content, expirationSeconds);
  }

  /**
   * Get a cached page
   */
  static async getCachedPage(pageId: string): Promise<string | null> {
    return this.getCache<string>(CacheType.PAGE, pageId);
  }

  /**
   * Cache a template
   */
  static async cacheTemplate(templateId: string, content: string, expirationSeconds: number = this.DEFAULT_EXPIRATION): Promise<void> {
    await this.setCache(CacheType.TEMPLATE, templateId, content, expirationSeconds);
  }

  /**
   * Get a cached template
   */
  static async getCachedTemplate(templateId: string): Promise<string | null> {
    return this.getCache<string>(CacheType.TEMPLATE, templateId);
  }

  /**
   * Cache a theme asset
   */
  static async cacheThemeAsset(themeId: string, assetKey: string, content: string, expirationSeconds: number = this.DEFAULT_EXPIRATION): Promise<void> {
    await this.setCache(CacheType.THEME_ASSET, `${themeId}:${assetKey}`, content, expirationSeconds);
  }

  /**
   * Get a cached theme asset
   */
  static async getCachedThemeAsset(themeId: string, assetKey: string): Promise<string | null> {
    return this.getCache<string>(CacheType.THEME_ASSET, `${themeId}:${assetKey}`);
  }

  /**
   * Cache an API response
   */
  static async cacheApiResponse(endpoint: string, params: Record<string, any>, response: any, expirationSeconds: number = this.DEFAULT_EXPIRATION): Promise<void> {
    await this.setCache(CacheType.API_RESPONSE, endpoint, response, expirationSeconds, params);
  }

  /**
   * Get a cached API response
   */
  static async getCachedApiResponse<T>(endpoint: string, params: Record<string, any>): Promise<T | null> {
    return this.getCache<T>(CacheType.API_RESPONSE, endpoint, params);
  }
}