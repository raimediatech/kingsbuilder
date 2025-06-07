import React, { useState } from "react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  LegacyCard,
  Tabs,
  Text,
  LegacyStack,
} from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import { prisma } from "~/db.server";
import TeamCollaboration from "~/components/TeamCollaboration";
import ThemeAssetManager from "~/components/ThemeAssetManager";
import CommentsFeedback from "~/components/CommentsFeedback";
import { ThemeAssetManager as ThemeAssetManagerUtil } from "~/utils/theme-asset-manager";
import { TeamCollaborationManager } from "~/utils/team-collaboration";
import { CommentsManager } from "~/utils/comments";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Get current user
  const currentUser = {
    id: BigInt(session.userId || 0),
    email: session.email || "",
    firstName: session.firstName || "",
    lastName: session.lastName || "",
  };

  // Get user teams
  let teams = [];
  try {
    // In a real implementation, this would fetch from the database
    // teams = await TeamCollaborationManager.getUserTeams(currentUser.id);
    
    // For demo purposes, we'll return sample data
    teams = [
      {
        id: "team-1",
        name: "Marketing Team",
        description: "Team responsible for marketing activities",
        ownerId: currentUser.id,
        role: "OWNER",
      },
      {
        id: "team-2",
        name: "Development Team",
        description: "Team responsible for development activities",
        ownerId: currentUser.id,
        role: "MEMBER",
      },
    ];
  } catch (error) {
    console.error("Error fetching teams:", error);
  }

  // Get Shopify themes
  let themes = [];
  try {
    // In a real implementation, this would fetch from Shopify API
    // themes = await ThemeAssetManagerUtil.getThemes(session);
    
    // For demo purposes, we'll return sample data
    themes = [
      {
        id: "theme-1",
        name: "Dawn",
        role: "main",
      },
      {
        id: "theme-2",
        name: "Minimal",
        role: "unpublished",
      },
    ];
  } catch (error) {
    console.error("Error fetching themes:", error);
  }

  // Get sample page for comments
  const samplePageId = "page-1";
  
  // Get comments for the sample page
  let comments = [];
  try {
    // In a real implementation, this would fetch from the database
    // comments = await CommentsManager.getPageComments(samplePageId);
    
    // For demo purposes, we'll return sample data
    comments = [
      {
        id: "comment-1",
        content: "This page looks great! I love the layout.",
        pageId: samplePageId,
        userId: currentUser.id,
        resolved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: currentUser,
        replies: [
          {
            id: "reply-1",
            content: "Thanks for the feedback!",
            pageId: samplePageId,
            userId: BigInt(2),
            parentId: "comment-1",
            resolved: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: BigInt(2),
              email: "team.member@example.com",
              firstName: "Team",
              lastName: "Member",
            },
          },
        ],
      },
      {
        id: "comment-2",
        content: "Can we add more product images to this section?",
        pageId: samplePageId,
        userId: BigInt(2),
        resolved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: BigInt(2),
          email: "team.member@example.com",
          firstName: "Team",
          lastName: "Member",
        },
        replies: [],
      },
    ];
  } catch (error) {
    console.error("Error fetching comments:", error);
  }

  return json({
    currentUser,
    teams,
    themes,
    comments,
    samplePageId,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  
  const formData = await request.formData();
  const action = formData.get("action") as string;

  // Handle different actions based on the form submission
  switch (action) {
    case "createTeam":
      // Implementation would go here
      break;
    case "updateTeam":
      // Implementation would go here
      break;
    case "deleteTeam":
      // Implementation would go here
      break;
    case "inviteUser":
      // Implementation would go here
      break;
    case "updateMemberRole":
      // Implementation would go here
      break;
    case "removeMember":
      // Implementation would go here
      break;
    case "getThemeAssets":
      // Implementation would go here
      break;
    case "getThemeAsset":
      // Implementation would go here
      break;
    case "updateThemeAsset":
      // Implementation would go here
      break;
    case "deleteThemeAsset":
      // Implementation would go here
      break;
    case "createComment":
      // Implementation would go here
      break;
    case "updateComment":
      // Implementation would go here
      break;
    case "deleteComment":
      // Implementation would go here
      break;
    case "resolveComment":
      // Implementation would go here
      break;
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }

  // Return success response
  return json({ success: true });
};

export default function CollaborationPage() {
  const { currentUser, teams, themes, comments, samplePageId } = useLoaderData<typeof loader>();
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    {
      id: "team-collaboration",
      content: "Team Collaboration",
      accessibilityLabel: "Team Collaboration",
      panelID: "team-collaboration-panel",
    },
    {
      id: "theme-assets",
      content: "Theme Assets",
      accessibilityLabel: "Theme Assets",
      panelID: "theme-assets-panel",
    },
    {
      id: "comments",
      content: "Comments & Feedback",
      accessibilityLabel: "Comments & Feedback",
      panelID: "comments-panel",
    },
  ];

  return (
    <Page
      title="Collaboration"
      subtitle="Manage teams, theme assets, and feedback"
      backAction={{ content: "Dashboard", url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          <LegacyCard>
            <Tabs
              tabs={tabs}
              selected={selectedTab}
              onSelect={(index) => setSelectedTab(index)}
            />
            <LegacyCard.Section>
              {selectedTab === 0 && <TeamCollaboration />}
              {selectedTab === 1 && <ThemeAssetManager pageId={samplePageId} />}
              {selectedTab === 2 && <CommentsFeedback pageId={samplePageId} />}
            </LegacyCard.Section>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}