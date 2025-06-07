/**
 * Permissions Utility
 * Handles user roles and permissions for the application
 */

import { prisma } from "~/db.server";
import { UserRole, TeamRole } from "@prisma/client";

/**
 * Permission levels for different actions
 */
export enum PermissionLevel {
  NONE = 0,
  VIEW = 1,
  EDIT = 2,
  MANAGE = 3,
  ADMIN = 4,
}

/**
 * Resource types that can have permissions
 */
export enum ResourceType {
  PAGE = "page",
  TEMPLATE = "template",
  TEAM = "team",
  USER = "user",
  THEME_ASSET = "theme_asset",
}

/**
 * Permission checker class
 */
export class PermissionChecker {
  /**
   * Check if a user has permission to perform an action on a resource
   */
  static async hasPermission(
    userId: bigint,
    resourceType: ResourceType,
    resourceId: string,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    // Admin users have all permissions
    if (user.role === UserRole.ADMIN) return true;

    // Check resource-specific permissions
    switch (resourceType) {
      case ResourceType.PAGE:
        return this.hasPagePermission(userId, resourceId, requiredLevel);
      case ResourceType.TEMPLATE:
        return this.hasTemplatePermission(userId, resourceId, requiredLevel);
      case ResourceType.TEAM:
        return this.hasTeamPermission(userId, resourceId, requiredLevel);
      case ResourceType.THEME_ASSET:
        return this.hasThemeAssetPermission(userId, resourceId, requiredLevel);
      default:
        return false;
    }
  }

  /**
   * Check page permissions
   */
  private static async hasPagePermission(
    userId: bigint,
    pageId: string,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        team: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!page) return false;

    // If page has no team, only admins can access (already checked above)
    if (!page.teamId) return false;

    // Check team membership
    if (page.team?.members.length === 0) return false;

    const memberRole = page.team?.members[0].role;

    // Map team roles to permission levels
    switch (memberRole) {
      case TeamRole.OWNER:
      case TeamRole.ADMIN:
        return true; // All permissions
      case TeamRole.MEMBER:
        return requiredLevel <= PermissionLevel.EDIT; // Can view and edit
      case TeamRole.VIEWER:
        return requiredLevel <= PermissionLevel.VIEW; // Can only view
      default:
        return false;
    }
  }

  /**
   * Check template permissions
   */
  private static async hasTemplatePermission(
    userId: bigint,
    templateId: string,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        team: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!template) return false;

    // If template has no team, only admins can access (already checked above)
    if (!template.teamId) return false;

    // Check team membership
    if (template.team?.members.length === 0) return false;

    const memberRole = template.team?.members[0].role;

    // Map team roles to permission levels
    switch (memberRole) {
      case TeamRole.OWNER:
      case TeamRole.ADMIN:
        return true; // All permissions
      case TeamRole.MEMBER:
        return requiredLevel <= PermissionLevel.EDIT; // Can view and edit
      case TeamRole.VIEWER:
        return requiredLevel <= PermissionLevel.VIEW; // Can only view
      default:
        return false;
    }
  }

  /**
   * Check team permissions
   */
  private static async hasTeamPermission(
    userId: bigint,
    teamId: string,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!team) return false;

    // Check if user is team owner
    if (team.ownerId === userId) return true;

    // Check team membership
    if (team.members.length === 0) return false;

    const memberRole = team.members[0].role;

    // Map team roles to permission levels
    switch (memberRole) {
      case TeamRole.OWNER:
      case TeamRole.ADMIN:
        return true; // All permissions
      case TeamRole.MEMBER:
        return requiredLevel <= PermissionLevel.EDIT; // Can view and edit
      case TeamRole.VIEWER:
        return requiredLevel <= PermissionLevel.VIEW; // Can only view
      default:
        return false;
    }
  }

  /**
   * Check theme asset permissions
   */
  private static async hasThemeAssetPermission(
    userId: bigint,
    assetId: string,
    requiredLevel: PermissionLevel
  ): Promise<boolean> {
    const themeAsset = await prisma.themeAsset.findUnique({
      where: { id: assetId },
      include: {
        page: {
          include: {
            team: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!themeAsset) return false;

    // If page has no team, only admins can access (already checked above)
    if (!themeAsset.page.teamId) return false;

    // Check team membership
    if (themeAsset.page.team?.members.length === 0) return false;

    const memberRole = themeAsset.page.team?.members[0].role;

    // Map team roles to permission levels
    switch (memberRole) {
      case TeamRole.OWNER:
      case TeamRole.ADMIN:
        return true; // All permissions
      case TeamRole.MEMBER:
        return requiredLevel <= PermissionLevel.EDIT; // Can view and edit
      case TeamRole.VIEWER:
        return requiredLevel <= PermissionLevel.VIEW; // Can only view
      default:
        return false;
    }
  }
}