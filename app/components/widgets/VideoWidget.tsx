import React from "react";

interface VideoWidgetProps {
  videoType: "youtube" | "vimeo" | "custom";
  videoId?: string;
  videoUrl?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  title?: string;
  width?: string;
  height?: string;
}

const VideoWidget: React.FC<VideoWidgetProps> = ({
  videoType,
  videoId = "",
  videoUrl = "",
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  title = "Video",
  width = "100%",
  height = "400px",
}) => {
  // Build the source URL based on video type
  let src = "";
  let hasValidSource = false;

  switch (videoType) {
    case "youtube":
      if (videoId) {
        hasValidSource = true;
        src = `https://www.youtube.com/embed/${videoId}?rel=0`;
        if (autoplay) src += "&autoplay=1";
        if (loop) src += "&loop=1";
        if (muted) src += "&mute=1";
        if (!controls) src += "&controls=0";
      }
      break;
    case "vimeo":
      if (videoId) {
        hasValidSource = true;
        src = `https://player.vimeo.com/video/${videoId}`;
        if (autoplay) src += "?autoplay=1";
        if (loop) src += (src.includes("?") ? "&" : "?") + "loop=1";
        if (muted) src += (src.includes("?") ? "&" : "?") + "muted=1";
        if (!controls) src += (src.includes("?") ? "&" : "?") + "controls=0";
      }
      break;
    case "custom":
      if (videoUrl) {
        hasValidSource = true;
        src = videoUrl;
      }
      break;
    default:
      break;
  }

  if (!hasValidSource) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
          color: "#666",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        No video source provided
      </div>
    );
  }

  // Render different video elements based on type
  if (videoType === "youtube" || videoType === "vimeo") {
    return (
      <iframe
        src={src}
        title={title}
        width={width}
        height={height}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: "4px" }}
      />
    );
  } else {
    // Custom video
    return (
      <video
        src={src}
        title={title}
        width={width}
        height={height}
        controls={controls}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        style={{ borderRadius: "4px", maxWidth: "100%" }}
      />
    );
  }
};

export default VideoWidget;
