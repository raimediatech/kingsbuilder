/**
 * Comments Utility
 * Handles comments and feedback functionality
 */

import { prisma } from "~/db.server";

/**
 * Interface for comment creation data
 */
interface CommentCreateData {
  content: string;
  pageId: string;
  userId: bigint;
  parentId?: string;
}

/**
 * Comments manager class
 */
export class CommentsManager {
  /**
   * Create a new comment
   */
  static async createComment(data: CommentCreateData) {
    try {
      const comment = await prisma.comment.create({
        data: {
          content: data.content,
          pageId: data.pageId,
          userId: data.userId,
          parentId: data.parentId,
        },
        include: {
          user: true,
        },
      });

      return comment;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  /**
   * Update a comment
   */
  static async updateComment(commentId: string, content: string) {
    try {
      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          content,
          updatedAt: new Date(),
        },
      });

      return comment;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string) {
    try {
      await prisma.comment.delete({
        where: { id: commentId },
      });

      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  /**
   * Mark a comment as resolved
   */
  static async resolveComment(commentId: string, resolved: boolean = true) {
    try {
      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          resolved,
        },
      });

      return comment;
    } catch (error) {
      console.error("Error resolving comment:", error);
      throw error;
    }
  }

  /**
   * Get all comments for a page
   */
  static async getPageComments(pageId: string) {
    try {
      const comments = await prisma.comment.findMany({
        where: {
          pageId,
          parentId: null, // Only get top-level comments
        },
        include: {
          user: true,
          replies: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return comments;
    } catch (error) {
      console.error("Error fetching page comments:", error);
      throw error;
    }
  }

  /**
   * Get a specific comment with its replies
   */
  static async getCommentWithReplies(commentId: string) {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          user: true,
          replies: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return comment;
    } catch (error) {
      console.error("Error fetching comment with replies:", error);
      throw error;
    }
  }

  /**
   * Get all unresolved comments for a page
   */
  static async getUnresolvedComments(pageId: string) {
    try {
      const comments = await prisma.comment.findMany({
        where: {
          pageId,
          resolved: false,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return comments;
    } catch (error) {
      console.error("Error fetching unresolved comments:", error);
      throw error;
    }
  }
}