import React from "react";
import { render, screen } from "@testing-library/react";
import VideoWidget from "~/components/widgets/VideoWidget";

describe("VideoWidget", () => {
  it("renders YouTube video correctly", () => {
    const props = {
      videoId: "dQw4w9WgXcQ",
      videoType: "youtube",
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      title: "Test YouTube Video",
      width: "100%",
      height: "400px",
    };

    render(<VideoWidget {...props} />);
    
    const iframe = screen.getByTitle("Test YouTube Video");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", expect.stringContaining("youtube.com/embed/dQw4w9WgXcQ"));
    expect(iframe).toHaveAttribute("width", "100%");
    expect(iframe).toHaveAttribute("height", "400px");
  });

  it("renders Vimeo video correctly", () => {
    const props = {
      videoId: "123456789",
      videoType: "vimeo",
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      title: "Test Vimeo Video",
      width: "100%",
      height: "400px",
    };

    render(<VideoWidget {...props} />);
    
    const iframe = screen.getByTitle("Test Vimeo Video");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", expect.stringContaining("player.vimeo.com/video/123456789"));
    expect(iframe).toHaveAttribute("width", "100%");
    expect(iframe).toHaveAttribute("height", "400px");
  });

  it("renders custom video correctly", () => {
    const props = {
      videoType: "custom",
      videoUrl: "https://example.com/video.mp4",
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      title: "Test Custom Video",
      width: "100%",
      height: "400px",
    };

    render(<VideoWidget {...props} />);
    
    const video = screen.getByTitle("Test Custom Video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", "https://example.com/video.mp4");
    expect(video).toHaveAttribute("controls");
    expect(video).not.toHaveAttribute("autoplay");
    expect(video).not.toHaveAttribute("loop");
    expect(video).not.toHaveAttribute("muted");
  });

  it("applies autoplay, loop, and muted attributes correctly", () => {
    const props = {
      videoType: "custom",
      videoUrl: "https://example.com/video.mp4",
      autoplay: true,
      loop: true,
      muted: true,
      controls: true,
      title: "Test Video with Attributes",
      width: "100%",
      height: "400px",
    };

    render(<VideoWidget {...props} />);
    
    const video = screen.getByTitle("Test Video with Attributes");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveAttribute("muted");
  });

  it("renders placeholder when no video source is provided", () => {
    const props = {
      videoType: "youtube",
      videoId: "",
      title: "Missing Video",
      width: "100%",
      height: "400px",
    };

    render(<VideoWidget {...props} />);
    
    expect(screen.getByText("No video source provided")).toBeInTheDocument();
  });
});
