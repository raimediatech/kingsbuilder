import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Text,
  TextField,
  InlineStack,
  VerticalStack,
  ResourceList,
  ResourceItem,
  Avatar,
  Badge,
  ButtonGroup,
  EmptyState,
  Box,
  Banner,
  Spinner,
  Collapsible,
  TextContainer,
} from "@shopify/polaris";
import { useSubmit, useLoaderData } from "@remix-run/react";

interface User {
  id: bigint;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface Comment {
  id: string;
  content: string;
  pageId: string;
  userId: bigint;
  parentId?: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  replies?: Comment[];
}

export default function CommentsFeedback({ pageId }: { pageId: string }) {
  const submit = useSubmit();
  const { comments = [], currentUser = {} } = useLoaderData<{
    comments: Comment[];
    currentUser: User;
  }>();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showResolved, setShowResolved] = useState(false);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [pageId, showResolved]);

  // Load comments
  const loadComments = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "getPageComments");
      formData.append("pageId", pageId);
      formData.append("showResolved", showResolved.toString());

      submit(formData, { method: "post" });
      
      // This would normally be set by the loader after redirect
      // For demo purposes, we're setting it directly
      // setComments(comments);
    } catch (err) {
      setError("Failed to load comments");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new comment
  const addComment = async () => {
    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "createComment");
      formData.append("pageId", pageId);
      formData.append("content", newComment);

      submit(formData, { method: "post" });
      
      // Reset form
      setNewComment("");
      
      // Refresh comments
      loadComments();
    } catch (err) {
      setError("Failed to add comment");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a reply to a comment
  const addReply = async (parentId: string) => {
    const content = replyContent[parentId];
    if (!content || !content.trim()) {
      setError("Reply cannot be empty");
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "createComment");
      formData.append("pageId", pageId);
      formData.append("content", content);
      formData.append("parentId", parentId);

      submit(formData, { method: "post" });
      
      // Reset form
      setReplyContent((prev) => ({ ...prev, [parentId]: "" }));
      
      // Refresh comments
      loadComments();
    } catch (err) {
      setError("Failed to add reply");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a comment
  const updateComment = async (commentId: string) => {
    if (!editContent.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "updateComment");
      formData.append("commentId", commentId);
      formData.append("content", editContent);

      submit(formData, { method: "post" });
      
      // Reset form
      setEditingComment(null);
      setEditContent("");
      
      // Refresh comments
      loadComments();
    } catch (err) {
      setError("Failed to update comment");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a comment
  const deleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "deleteComment");
      formData.append("commentId", commentId);

      submit(formData, { method: "post" });
      
      // Refresh comments
      loadComments();
    } catch (err) {
      setError("Failed to delete comment");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve/unresolve a comment
  const toggleResolveComment = async (commentId: string, resolved: boolean) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("action", "resolveComment");
      formData.append("commentId", commentId);
      formData.append("resolved", (!resolved).toString());

      submit(formData, { method: "post" });
      
      // Refresh comments
      loadComments();
    } catch (err) {
      setError("Failed to update comment status");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle reply section
  const toggleReplies = (commentId: string) => {
    setOpenReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Start editing a comment
  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Filter comments based on resolved status
  const filteredComments = showResolved
    ? comments
    : comments.filter((comment) => !comment.resolved);

  return (
    <Card>
      <Card.Section>
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">
            Comments & Feedback
          </Text>
          <ButtonGroup>
            <Button
              onClick={() => setShowResolved(!showResolved)}
              pressed={showResolved}
            >
              {showResolved ? "Hide Resolved" : "Show Resolved"}
            </Button>
            <Button primary onClick={loadComments}>
              Refresh
            </Button>
          </ButtonGroup>
        </InlineStack>
      </Card.Section>

      {error && (
        <Card.Section>
          <Banner status="critical" onDismiss={() => setError("")}>
            {error}
          </Banner>
        </Card.Section>
      )}

      <Card.Section>
        <VerticalStack gap="400">
          <TextField
            label="Add a comment"
            value={newComment}
            onChange={setNewComment}
            multiline={3}
            autoComplete="off"
            placeholder="Type your comment here..."
          />
          <InlineStack align="end">
            <Button primary onClick={addComment} loading={isLoading}>
              Add Comment
            </Button>
          </InlineStack>
        </VerticalStack>
      </Card.Section>

      <Card.Section>
        {isLoading && !filteredComments.length ? (
          <Box padding="4">
            <InlineStack align="center">
              <Spinner accessibilityLabel="Loading comments" size="large" />
            </InlineStack>
          </Box>
        ) : filteredComments.length === 0 ? (
          <EmptyState
            heading="No comments yet"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Add a comment to start the conversation.</p>
          </EmptyState>
        ) : (
          <ResourceList
            resourceName={{ singular: "comment", plural: "comments" }}
            items={filteredComments}
            renderItem={(comment) => (
              <ResourceItem
                id={comment.id}
                media={
                  <Avatar
                    customer
                    size="medium"
                    name={`${comment.user.firstName || ""} ${comment.user.lastName || ""}`}
                  />
                }
                accessibilityLabel={`Comment by ${comment.user.email}`}
              >
                <LegacyStack vertical spacing="tight">
                  <LegacyStack>
                    <LegacyStack.Item fill>
                      <LegacyStack spacing="tight">
                        <Text variant="bodyMd" fontWeight="bold" as="h3">
                          {comment.user.firstName} {comment.user.lastName}
                        </Text>
                        <Text variant="bodyMd" as="span" color="subdued">
                          {formatDate(comment.createdAt)}
                        </Text>
                        {comment.resolved && (
                          <Badge status="success">Resolved</Badge>
                        )}
                      </LegacyStack>
                    </LegacyStack.Item>
                    <LegacyStack.Item>
                      <ButtonGroup>
                        <Button
                          plain
                          onClick={() => toggleResolveComment(comment.id, comment.resolved)}
                        >
                          {comment.resolved ? "Unresolve" : "Resolve"}
                        </Button>
                        {comment.userId.toString() === currentUser.id?.toString() && (
                          <>
                            <Button
                              plain
                              onClick={() => startEditing(comment)}
                            >
                              Edit
                            </Button>
                            <Button
                              plain
                              destructive
                              onClick={() => deleteComment(comment.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </ButtonGroup>
                    </LegacyStack.Item>
                  </LegacyStack>

                  {editingComment === comment.id ? (
                    <LegacyStack vertical>
                      <TextField
                        label="Edit comment"
                        labelHidden
                        value={editContent}
                        onChange={setEditContent}
                        multiline={3}
                        autoComplete="off"
                      />
                      <LegacyStack distribution="trailing">
                        <ButtonGroup>
                          <Button onClick={() => setEditingComment(null)}>
                            Cancel
                          </Button>
                          <Button primary onClick={() => updateComment(comment.id)}>
                            Save
                          </Button>
                        </ButtonGroup>
                      </LegacyStack>
                    </LegacyStack>
                  ) : (
                    <TextContainer>
                      <p>{comment.content}</p>
                    </TextContainer>
                  )}

                  <LegacyStack distribution="trailing">
                    <Button
                      plain
                      onClick={() => toggleReplies(comment.id)}
                      ariaExpanded={openReplies[comment.id]}
                      ariaControls={`replies-${comment.id}`}
                    >
                      {comment.replies && comment.replies.length > 0
                        ? `${openReplies[comment.id] ? "Hide" : "Show"} ${comment.replies.length} ${
                            comment.replies.length === 1 ? "reply" : "replies"
                          }`
                        : "Reply"}
                    </Button>
                  </LegacyStack>

                  <Collapsible
                    open={openReplies[comment.id] || false}
                    id={`replies-${comment.id}`}
                  >
                    <Box paddingBlockStart="4" paddingInlineStart="5">
                      {comment.replies && comment.replies.length > 0 && (
                        <LegacyStack vertical spacing="tight">
                          {comment.replies.map((reply) => (
                            <Card key={reply.id} sectioned>
                              <LegacyStack>
                                <Avatar
                                  customer
                                  size="small"
                                  name={`${reply.user.firstName || ""} ${reply.user.lastName || ""}`}
                                />
                                <LegacyStack.Item fill>
                                  <LegacyStack spacing="tight">
                                    <Text variant="bodyMd" fontWeight="bold" as="h4">
                                      {reply.user.firstName} {reply.user.lastName}
                                    </Text>
                                    <Text variant="bodyMd" as="span" color="subdued">
                                      {formatDate(reply.createdAt)}
                                    </Text>
                                  </LegacyStack>
                                  <TextContainer>
                                    <p>{reply.content}</p>
                                  </TextContainer>
                                </LegacyStack.Item>
                                {reply.userId.toString() === currentUser.id?.toString() && (
                                  <ButtonGroup>
                                    <Button
                                      plain
                                      destructive
                                      onClick={() => deleteComment(reply.id)}
                                    >
                                      Delete
                                    </Button>
                                  </ButtonGroup>
                                )}
                              </LegacyStack>
                            </Card>
                          ))}
                        </LegacyStack>
                      )}

                      <Box paddingBlockStart="4">
                        <LegacyStack vertical>
                          <TextField
                            label="Reply"
                            labelHidden
                            value={replyContent[comment.id] || ""}
                            onChange={(value) =>
                              setReplyContent((prev) => ({
                                ...prev,
                                [comment.id]: value,
                              }))
                            }
                            multiline={2}
                            autoComplete="off"
                            placeholder="Type your reply here..."
                          />
                          <LegacyStack distribution="trailing">
                            <Button
                              primary
                              onClick={() => addReply(comment.id)}
                              loading={isLoading}
                            >
                              Reply
                            </Button>
                          </LegacyStack>
                        </LegacyStack>
                      </Box>
                    </Box>
                  </Collapsible>
                </LegacyStack>
              </ResourceItem>
            )}
          />
        )}
      </Card.Section>
    </Card>
  );
}