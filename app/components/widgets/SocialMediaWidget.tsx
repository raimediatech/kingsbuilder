import React from "react";

// Social media platform types
export type SocialPlatform =
  | "facebook"
  | "twitter"
  | "instagram"
  | "pinterest"
  | "youtube"
  | "linkedin"
  | "tiktok"
  | "snapchat"
  | "reddit"
  | "tumblr";

// Social media content types
export type ContentType =
  | "profile"
  | "post"
  | "feed"
  | "timeline"
  | "video"
  | "page"
  | "group"
  | "share";

// Social media widget configuration
export interface SocialMediaConfig {
  platform: SocialPlatform;
  contentType: ContentType;
  url?: string;
  username?: string;
  id?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  width?: string | number;
  height?: string | number;
  theme?: "light" | "dark";
  language?: string;
}

interface SocialMediaWidgetProps {
  config: SocialMediaConfig;
  containerStyle?: React.CSSProperties;
}

const SocialMediaWidget: React.FC<SocialMediaWidgetProps> = ({
  config,
  containerStyle = {},
}) => {
  const {
    platform,
    contentType,
    url,
    username,
    id,
    showHeader = true,
    showFooter = true,
    width = "100%",
    height = "500px",
    theme = "light",
    language = "en_US",
  } = config;

  // Helper function to build embed URLs for different platforms
  const getEmbedUrl = (): string => {
    switch (platform) {
      case "facebook":
        if (contentType === "post" && id) {
          return `https://www.facebook.com/plugins/post.php?href=https://www.facebook.com/${username || "permalink"}/posts/${id}&width=${width}&show_text=true`;
        } else if (contentType === "page" && username) {
          return `https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/${username}&tabs=timeline&width=${width}&height=${height}&small_header=${!showHeader}&adapt_container_width=true&hide_cover=false`;
        } else if (contentType === "timeline" && username) {
          return `https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/${username}&tabs=timeline&width=${width}&height=${height}&small_header=${!showHeader}&adapt_container_width=true&hide_cover=false`;
        }
        return "";

      case "twitter":
        if (contentType === "timeline" && username) {
          const options = `chrome=nofooter&dnt=true&theme=${theme}`;
          return `https://platform.twitter.com/widgets/timeline.html?${options}&screen_name=${username}`;
        } else if (contentType === "post" && id) {
          return `https://platform.twitter.com/embed/Tweet.html?id=${id}`;
        }
        return "";

      case "instagram":
        if (contentType === "post" && id) {
          return `https://www.instagram.com/p/${id}/embed/`;
        } else if (contentType === "profile" && username) {
          return `https://www.instagram.com/${username}/embed`;
        }
        return "";

      case "youtube":
        if (contentType === "video" && id) {
          return `https://www.youtube.com/embed/${id}`;
        } else if (contentType === "channel" && username) {
          return `https://www.youtube.com/embed/videoseries?list=UU${username}`;
        }
        return "";

      case "pinterest":
        if (contentType === "profile" && username) {
          return `https://www.pinterest.com/${username}/embed/`;
        } else if (contentType === "pin" && id) {
          return `https://www.pinterest.com/pin/${id}/embed/`;
        }
        return "";

      case "linkedin":
        if (contentType === "profile" && username) {
          return `https://www.linkedin.com/embed/feed/update/urn:li:share:${username}`;
        } else if (contentType === "post" && id) {
          return `https://www.linkedin.com/embed/feed/update/urn:li:share:${id}`;
        }
        return "";

      case "tiktok":
        if (contentType === "video" && id) {
          return `https://www.tiktok.com/embed/v2/${id}`;
        }
        return "";

      default:
        // For custom URLs or other platforms
        return url || "";
    }
  };

  const embedUrl = getEmbedUrl();

  // If no valid embed URL can be generated, show a placeholder
  if (!embedUrl) {
    return (
      <div
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
          color: "#666",
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "20px",
          textAlign: "center",
          ...containerStyle,
        }}
      >
        <div>
          <p>Invalid social media configuration</p>
          <p>Please check your platform, content type, and identifier settings</p>
        </div>
      </div>
    );
  }

  // Render the social media embed
  return (
    <div
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        overflow: "hidden",
        borderRadius: "4px",
        ...containerStyle,
      }}
    >
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: "none", overflow: "hidden" }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen={true}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        title={`${platform} ${contentType}`}
      ></iframe>
    </div>
  );
};

// Helper component for Facebook posts
export const FacebookPost: React.FC<{
  postId: string;
  width?: string | number;
  height?: string | number;
}> = ({ postId, width = "100%", height = "auto" }) => {
  return (
    <SocialMediaWidget
      config={{
        platform: "facebook",
        contentType: "post",
        id: postId,
        width,
        height,
      }}
    />
  );
};

// Helper component for Twitter posts
export const TwitterPost: React.FC<{
  tweetId: string;
  theme?: "light" | "dark";
}> = ({ tweetId, theme = "light" }) => {
  return (
    <SocialMediaWidget
      config={{
        platform: "twitter",
        contentType: "post",
        id: tweetId,
        theme,
      }}
    />
  );
};

// Helper component for Instagram posts
export const InstagramPost: React.FC<{
  postId: string;
}> = ({ postId }) => {
  return (
    <SocialMediaWidget
      config={{
        platform: "instagram",
        contentType: "post",
        id: postId,
      }}
    />
  );
};

// Helper component for YouTube videos
export const YouTubeVideo: React.FC<{
  videoId: string;
  width?: string | number;
  height?: string | number;
}> = ({ videoId, width = "100%", height = "315px" }) => {
  return (
    <SocialMediaWidget
      config={{
        platform: "youtube",
        contentType: "video",
        id: videoId,
        width,
        height,
      }}
    />
  );
};

export default SocialMediaWidget;