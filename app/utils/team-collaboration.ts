/**
 * Team Collaboration Utility
 * Handles team management and collaboration features
 */

import { prisma } from "~/db.server";
import { TeamRole } from "@prisma/client";

/**
 * Interface for team creation data
 */
interface TeamCreateData {
  name: string;
  description?: string;
  ownerId: bigint;
}

/**
 * Interface for team member data
 */
interface TeamMemberData {
  userId: bigint;
  role: TeamRole;
}

/**
 * Team collaboration manager class
 */
export class TeamCollaborationManager {
  /**
   * Create a new team
   */
  static async createTeam(data: TeamCreateData) {
    try {
      const team = await prisma.team.create({
        data: {
          name: data.name,
          description: data.description,
          ownerId: data.ownerId,
          members: {
            create: {
              userId: data.ownerId,
              role: TeamRole.OWNER,
            },
          },
        },
        include: {
          members: true,
        },
      });

      return team;
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    }
  }

  /**
   * Update team details
   */
  static async updateTeam(
    teamId: string,
    data: { name?: string; description?: string }
  ) {
    try {
      const team = await prisma.team.update({
        where: { id: teamId },
        data: {
          name: data.name,
          description: data.description,
        },
      });

      return team;
    } catch (error) {
      console.error("Error updating team:", error);
      throw error;
    }
  }

  /**
   * Delete a team
   */
  static async deleteTeam(teamId: string) {
    try {
      await prisma.team.delete({
        where: { id: teamId },
      });

      return true;
    } catch (error) {
      console.error("Error deleting team:", error);
      throw error;
    }
  }

  /**
   * Add a member to a team
   */
  static async addTeamMember(
    teamId: string,
    memberData: TeamMemberData
  ) {
    try {
      const teamMember = await prisma.teamMember.create({
        data: {
          teamId,
          userId: memberData.userId,
          role: memberData.role,
        },
      });

      return teamMember;
    } catch (error) {
      console.error("Error adding team member:", error);
      throw error;
    }
  }

  /**
   * Update a team member's role
   */
  static async updateTeamMemberRole(
    teamId: string,
    userId: bigint,
    role: TeamRole
  ) {
    try {
      const teamMember = await prisma.teamMember.update({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
        data: {
          role,
        },
      });

      return teamMember;
    } catch (error) {
      console.error("Error updating team member role:", error);
      throw error;
    }
  }

  /**
   * Remove a member from a team
   */
  static async removeTeamMember(teamId: string, userId: bigint) {
    try {
      await prisma.teamMember.delete({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
      });

      return true;
    } catch (error) {
      console.error("Error removing team member:", error);
      throw error;
    }
  }

  /**
   * Get all teams for a user
   */
  static async getUserTeams(userId: bigint) {
    try {
      const teamMembers = await prisma.teamMember.findMany({
        where: {
          userId,
        },
        include: {
          team: true,
        },
      });

      return teamMembers.map((member) => ({
        ...member.team,
        role: member.role,
      }));
    } catch (error) {
      console.error("Error fetching user teams:", error);
      throw error;
    }
  }

  /**
   * Get all members of a team
   */
  static async getTeamMembers(teamId: string) {
    try {
      const teamMembers = await prisma.teamMember.findMany({
        where: {
          teamId,
        },
        include: {
          user: true,
        },
      });

      return teamMembers.map((member) => ({
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: {
          id: member.user.id,
          email: member.user.email,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
        },
      }));
    } catch (error) {
      console.error("Error fetching team members:", error);
      throw error;
    }
  }

  /**
   * Share a page with a team
   */
  static async sharePageWithTeam(pageId: string, teamId: string) {
    try {
      const page = await prisma.page.update({
        where: { id: pageId },
        data: {
          teamId,
        },
      });

      return page;
    } catch (error) {
      console.error("Error sharing page with team:", error);
      throw error;
    }
  }

  /**
   * Share a template with a team
   */
  static async shareTemplateWithTeam(templateId: string, teamId: string) {
    try {
      const template = await prisma.template.update({
        where: { id: templateId },
        data: {
          teamId,
        },
      });

      return template;
    } catch (error) {
      console.error("Error sharing template with team:", error);
      throw error;
    }
  }
}