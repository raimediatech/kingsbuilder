import React, { useState, useEffect } from "react";
import {
  Card,
  Tabs,
  Text,
  Button,
  Modal,
  TextField,
  Select,
  LegacyStack,
  ResourceList,
  ResourceItem,
  Avatar,
  Badge,
  ButtonGroup,
  EmptyState,
  Box,
  Banner,
  Spinner,
} from "@shopify/polaris";
import { useSubmit, useLoaderData } from "@remix-run/react";
import { TeamRole } from "@prisma/client";

interface User {
  id: bigint;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface TeamMember {
  id: string;
  role: TeamRole;
  joinedAt: string;
  user: User;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: bigint;
  role?: TeamRole;
}

export default function TeamCollaboration() {
  const submit = useSubmit();
  const { teams = [], currentUser = {} } = useLoaderData<{
    teams: Team[];
    currentUser: User;
  }>();

  const [selectedTab, setSelectedTab] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Modals
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editTeamModalOpen, setEditTeamModalOpen] = useState(false);
  
  // Form values
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(TeamRole.MEMBER);

  // Load team members when team is selected
  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers();
    }
  }, [selectedTeam]);

  // Load team members
  const loadTeamMembers = async () => {
    if (!selectedTeam) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "getTeamMembers");
      formData.append("teamId", selectedTeam.id);

      submit(formData, { method: "post" });
      
      // This would normally be set by the loader after redirect
      // For demo purposes, we're setting some sample data
      setTeamMembers([
        {
          id: "1",
          role: TeamRole.OWNER,
          joinedAt: new Date().toISOString(),
          user: currentUser,
        },
        {
          id: "2",
          role: TeamRole.MEMBER,
          joinedAt: new Date().toISOString(),
          user: {
            id: BigInt(2),
            email: "team.member@example.com",
            firstName: "Team",
            lastName: "Member",
          },
        },
      ]);
    } catch (err) {
      setError("Failed to load team members");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new team
  const createTeam = async () => {
    if (!teamName.trim()) {
      setError("Team name is required");
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "createTeam");
      formData.append("name", teamName);
      formData.append("description", teamDescription);

      submit(formData, { method: "post" });
      
      // Close modal and reset form
      setCreateTeamModalOpen(false);
      setTeamName("");
      setTeamDescription("");
      
      // Add the new team to the list (this would normally happen via loader)
      const newTeam = {
        id: `team-${Date.now()}`,
        name: teamName,
        description: teamDescription,
        ownerId: currentUser.id,
        role: TeamRole.OWNER,
      };
      
      // Select the new team
      setSelectedTeam(newTeam);
    } catch (err) {
      setError("Failed to create team");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update team details
  const updateTeam = async () => {
    if (!selectedTeam || !teamName.trim()) {
      setError("Team name is required");
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "updateTeam");
      formData.append("teamId", selectedTeam.id);
      formData.append("name", teamName);
      formData.append("description", teamDescription);

      submit(formData, { method: "post" });
      
      // Close modal and reset form
      setEditTeamModalOpen(false);
      
      // Update the team in the list (this would normally happen via loader)
      setSelectedTeam({
        ...selectedTeam,
        name: teamName,
        description: teamDescription,
      });
    } catch (err) {
      setError("Failed to update team");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a team
  const deleteTeam = async () => {
    if (!selectedTeam) return;
    
    if (!confirm(`Are you sure you want to delete the team "${selectedTeam.name}"?`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "deleteTeam");
      formData.append("teamId", selectedTeam.id);

      submit(formData, { method: "post" });
      
      // Reset selected team
      setSelectedTeam(null);
    } catch (err) {
      setError("Failed to delete team");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Invite a user to the team
  const inviteUser = async () => {
    if (!selectedTeam || !inviteEmail.trim()) {
      setError("Email is required");
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "inviteUser");
      formData.append("teamId", selectedTeam.id);
      formData.append("email", inviteEmail);
      formData.append("role", inviteRole);

      submit(formData, { method: "post" });
      
      // Close modal and reset form
      setInviteModalOpen(false);
      setInviteEmail("");
      setInviteRole(TeamRole.MEMBER);
      
      // Refresh team members
      loadTeamMembers();
    } catch (err) {
      setError("Failed to invite user");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a team member's role
  const updateMemberRole = async (memberId: string, role: TeamRole) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "updateMemberRole");
      formData.append("teamId", selectedTeam?.id || "");
      formData.append("memberId", memberId);
      formData.append("role", role);

      submit(formData, { method: "post" });
      
      // Refresh team members
      loadTeamMembers();
    } catch (err) {
      setError("Failed to update member role");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a team member
  const removeMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "removeMember");
      formData.append("teamId", selectedTeam?.id || "");
      formData.append("memberId", memberId);

      submit(formData, { method: "post" });
      
      // Refresh team members
      loadTeamMembers();
    } catch (err) {
      setError("Failed to remove team member");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get role badge
  const getRoleBadge = (role: TeamRole) => {
    switch (role) {
      case TeamRole.OWNER:
        return <Badge status="success">Owner</Badge>;
      case TeamRole.ADMIN:
        return <Badge status="info">Admin</Badge>;
      case TeamRole.MEMBER:
        return <Badge>Member</Badge>;
      case TeamRole.VIEWER:
        return <Badge status="attention">Viewer</Badge>;
      default:
        return null;
    }
  };

  // Tabs for the component
  const tabs = [
    {
      id: "teams",
      content: "My Teams",
      accessibilityLabel: "My Teams",
      panelID: "teams-panel",
    },
    {
      id: "members",
      content: "Team Members",
      accessibilityLabel: "Team Members",
      panelID: "members-panel",
    },
  ];

  return (
    <Card>
      <Card.Section>
        <Text variant="headingMd" as="h2">
          Team Collaboration
        </Text>
      </Card.Section>

      {error && (
        <Card.Section>
          <Banner status="critical" onDismiss={() => setError("")}>
            {error}
          </Banner>
        </Card.Section>
      )}

      <Tabs
        tabs={tabs}
        selected={selectedTab}
        onSelect={(index) => setSelectedTab(index)}
      />

      {selectedTab === 0 && (
        <Card.Section>
          <LegacyStack distribution="trailing">
            <Button primary onClick={() => setCreateTeamModalOpen(true)}>
              Create Team
            </Button>
          </LegacyStack>

          {isLoading ? (
            <Box padding="4">
              <LegacyStack distribution="center">
                <Spinner accessibilityLabel="Loading teams" size="large" />
              </LegacyStack>
            </Box>
          ) : teams.length === 0 ? (
            <EmptyState
              heading="No teams yet"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Create a team to start collaborating with others.</p>
            </EmptyState>
          ) : (
            <ResourceList
              resourceName={{ singular: "team", plural: "teams" }}
              items={teams}
              renderItem={(team) => (
                <ResourceItem
                  id={team.id}
                  onClick={() => setSelectedTeam(team)}
                  accessibilityLabel={`View details for ${team.name}`}
                  selected={selectedTeam?.id === team.id}
                >
                  <LegacyStack>
                    <LegacyStack.Item fill>
                      <Text variant="bodyMd" fontWeight="bold" as="h3">
                        {team.name}
                      </Text>
                      {team.description && (
                        <Text variant="bodyMd" as="p" color="subdued">
                          {team.description}
                        </Text>
                      )}
                    </LegacyStack.Item>
                    <LegacyStack.Item>
                      {team.role && getRoleBadge(team.role)}
                    </LegacyStack.Item>
                  </LegacyStack>
                </ResourceItem>
              )}
            />
          )}
        </Card.Section>
      )}

      {selectedTab === 1 && (
        <Card.Section>
          {!selectedTeam ? (
            <EmptyState
              heading="Select a team"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Select a team from the "My Teams" tab to view its members.</p>
            </EmptyState>
          ) : (
            <>
              <LegacyStack distribution="equalSpacing" alignment="center">
                <Text variant="headingMd" as="h3">
                  {selectedTeam.name} - Members
                </Text>
                <ButtonGroup>
                  <Button onClick={() => setInviteModalOpen(true)}>
                    Invite Member
                  </Button>
                  <Button onClick={() => {
                    setTeamName(selectedTeam.name);
                    setTeamDescription(selectedTeam.description || "");
                    setEditTeamModalOpen(true);
                  }}>
                    Edit Team
                  </Button>
                  {selectedTeam.role === TeamRole.OWNER && (
                    <Button destructive onClick={deleteTeam}>
                      Delete Team
                    </Button>
                  )}
                </ButtonGroup>
              </LegacyStack>

              {isLoading ? (
                <Box padding="4">
                  <LegacyStack distribution="center">
                    <Spinner accessibilityLabel="Loading team members" size="large" />
                  </LegacyStack>
                </Box>
              ) : teamMembers.length === 0 ? (
                <EmptyState
                  heading="No team members"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Invite members to start collaborating.</p>
                </EmptyState>
              ) : (
                <ResourceList
                  resourceName={{ singular: "member", plural: "members" }}
                  items={teamMembers}
                  renderItem={(member) => (
                    <ResourceItem
                      id={member.id}
                      media={
                        <Avatar
                          customer
                          size="medium"
                          name={`${member.user.firstName || ""} ${member.user.lastName || ""}`}
                        />
                      }
                      accessibilityLabel={`View details for ${member.user.email}`}
                    >
                      <LegacyStack>
                        <LegacyStack.Item fill>
                          <Text variant="bodyMd" fontWeight="bold" as="h3">
                            {member.user.firstName} {member.user.lastName}
                          </Text>
                          <Text variant="bodyMd" as="p" color="subdued">
                            {member.user.email}
                          </Text>
                        </LegacyStack.Item>
                        <LegacyStack.Item>
                          {getRoleBadge(member.role)}
                        </LegacyStack.Item>
                        {selectedTeam.role === TeamRole.OWNER && member.role !== TeamRole.OWNER && (
                          <LegacyStack.Item>
                            <ButtonGroup>
                              <Select
                                label="Role"
                                labelHidden
                                options={[
                                  { label: "Admin", value: TeamRole.ADMIN },
                                  { label: "Member", value: TeamRole.MEMBER },
                                  { label: "Viewer", value: TeamRole.VIEWER },
                                ]}
                                value={member.role}
                                onChange={(value) => updateMemberRole(member.id, value as TeamRole)}
                              />
                              <Button destructive onClick={() => removeMember(member.id)}>
                                Remove
                              </Button>
                            </ButtonGroup>
                          </LegacyStack.Item>
                        )}
                      </LegacyStack>
                    </ResourceItem>
                  )}
                />
              )}
            </>
          )}
        </Card.Section>
      )}

      {/* Create Team Modal */}
      <Modal
        open={createTeamModalOpen}
        onClose={() => setCreateTeamModalOpen(false)}
        title="Create New Team"
        primaryAction={{
          content: "Create",
          onAction: createTeam,
          loading: isLoading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setCreateTeamModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <LegacyStack vertical>
            <TextField
              label="Team Name"
              value={teamName}
              onChange={setTeamName}
              autoComplete="off"
              error={!teamName.trim() ? "Team name is required" : undefined}
            />
            <TextField
              label="Description (Optional)"
              value={teamDescription}
              onChange={setTeamDescription}
              multiline={3}
              autoComplete="off"
            />
          </LegacyStack>
        </Modal.Section>
      </Modal>

      {/* Edit Team Modal */}
      <Modal
        open={editTeamModalOpen}
        onClose={() => setEditTeamModalOpen(false)}
        title="Edit Team"
        primaryAction={{
          content: "Save",
          onAction: updateTeam,
          loading: isLoading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setEditTeamModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <LegacyStack vertical>
            <TextField
              label="Team Name"
              value={teamName}
              onChange={setTeamName}
              autoComplete="off"
              error={!teamName.trim() ? "Team name is required" : undefined}
            />
            <TextField
              label="Description (Optional)"
              value={teamDescription}
              onChange={setTeamDescription}
              multiline={3}
              autoComplete="off"
            />
          </LegacyStack>
        </Modal.Section>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
        primaryAction={{
          content: "Invite",
          onAction: inviteUser,
          loading: isLoading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setInviteModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <LegacyStack vertical>
            <TextField
              label="Email Address"
              type="email"
              value={inviteEmail}
              onChange={setInviteEmail}
              autoComplete="off"
              error={!inviteEmail.trim() ? "Email is required" : undefined}
            />
            <Select
              label="Role"
              options={[
                { label: "Admin", value: TeamRole.ADMIN },
                { label: "Member", value: TeamRole.MEMBER },
                { label: "Viewer", value: TeamRole.VIEWER },
              ]}
              value={inviteRole}
              onChange={(value) => setInviteRole(value as TeamRole)}
            />
          </LegacyStack>
        </Modal.Section>
      </Modal>
    </Card>
  );
}