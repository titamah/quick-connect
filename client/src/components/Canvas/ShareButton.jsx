import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Share,
  Share2,
  Copy,
  Facebook,
  Linkedin,
  Twitter,
  AlertCircle,
} from "lucide-react";
import { useDevice } from "../../contexts/DeviceContext";
import { useToast } from "../Toast";
import chroma from "chroma-js";
const Thumbnail = React.lazy(() => import("./Thumbnail.jsx"));
const ShareButton = ({
  wallpaperRef,
  getBackgroundImage,
  backgroundLayerRef,
}) => {
  const { qrConfig, background } = useDevice();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [remixLink, setRemixLink] = useState(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [activeState, setActiveState] = useState(null);
  const [linkError, setLinkError] = useState(null);
  const thumbnailRef = useRef(null);
  const [shouldRenderThumbnail, setShouldRenderThumbnail] = useState(false);
  const buttonRef = useRef(null);
  const createDeviceStateSchema = useCallback(() => {
    const schema = {
      qr: {
        scale: qrConfig.scale,
        primaryColor: qrConfig.custom.primaryColor,
        secondaryColor: qrConfig.custom.secondaryColor,
        borderColor: qrConfig.custom.borderColor,
        borderRadius: qrConfig.custom.cornerRadiusRatio,
        borderWidth: qrConfig.custom.borderSizeRatio,
        rotation: qrConfig.rotation,
        pos: {
          x: qrConfig.positionPercentages.x,
          y: qrConfig.positionPercentages.y,
        },
      },
      bg: {
        type: background.style,
        grain: background.grain,
        activeTypeValue:
          background.style === "solid"
            ? background.color
            : background.style === "gradient"
            ? background.gradient
            : background.style === "image"
            ? background.bg
            : null,
      },
    };
    console.log("📋 Created device state schema:", schema);
    return schema;
  }, [qrConfig, background]);
  useEffect(() => {
    if (isMenuOpen && !shouldRenderThumbnail) {
      const generateThumbnailData = async () => {
        setIsGeneratingThumbnail(true);
        setShouldRenderThumbnail(true);
        try {
          console.log("🖼️ Generating thumbnail data...");
          let bgImage = null;
          if (background.style !== "image" || background.bg) {
            try {
              bgImage = await getBackgroundImage();
              setBackgroundImage(bgImage);
            } catch (error) {
              console.warn("⚠️ Failed to generate background image:", error);
              setBackgroundImage(null);
            }
          }
          setActiveState(createDeviceStateSchema());
        } catch (error) {
          console.error("❌ Failed to generate thumbnail data:", error);
          setActiveState(createDeviceStateSchema());
        } finally {
          setIsGeneratingThumbnail(false);
        }
      };
      const timeoutId = setTimeout(generateThumbnailData, 100);
      return () => clearTimeout(timeoutId);
    } else if (!isMenuOpen) {
      setBackgroundImage(null);
      setActiveState(null);
      setRemixLink(null);
      setLinkError(null);
      setShouldRenderThumbnail(false);
    }
  }, [
    isMenuOpen,
    getBackgroundImage,
    background.style,
    background.bg,
    createDeviceStateSchema,
  ]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);
  const dataURLtoFile = (dataURL, filename) => {
    if (!dataURL || !dataURL.startsWith("data:")) {
      return null;
    }
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };
  const generateRemixLink = async () => {
    if (remixLink) return remixLink;
    setIsGeneratingLink(true);
    try {
      const { default: remixService } = await import(
        "../../services/remixService"
      );
      const deviceStateSchema = createDeviceStateSchema();
      let thumbnailUrl = null;
      if (thumbnailRef.current?.exportAsBlob) {
        try {
          console.log("🖼️ Generating thumbnail...");
          const thumbnailBlob = await thumbnailRef.current.exportAsBlob();
          thumbnailUrl = await remixService.uploadThumbnail(thumbnailBlob);
          console.log("✅ Thumbnail uploaded:", thumbnailUrl);
        } catch (error) {
          console.warn(
            "⚠️ Thumbnail upload failed, continuing without:",
            error
          );
        }
      }
      console.log("🖼️ Thumbnail URL:", thumbnailUrl);
      let backgroundImageFile = null;
      if (
        background.style === "image" &&
        background.bg &&
        background.bg.startsWith("data:")
      ) {
        console.log("🖼️ Converting background image for upload...");
        backgroundImageFile = dataURLtoFile(
          background.bg,
          "background-image.jpg"
        );
        console.log(
          "✅ Background image file created:",
          backgroundImageFile.name,
          `${Math.round(backgroundImageFile.size / 1024)}KB`
        );
      }
      console.log("🔗 Creating remix link with schema:", deviceStateSchema);
      console.log(
        "📎 Background image file:",
        backgroundImageFile ? "Yes" : "None"
      );
      const remixId = await remixService.createRemix(
        deviceStateSchema,
        backgroundImageFile,
        thumbnailUrl
      );
      const link = `${window.location.origin}/remix/${remixId}`;
      setRemixLink(link);
      console.log("✅ Remix link created:", link);
      return link;
    } catch (error) {
      console.error("Failed to create remix link:", error);
      let errorMessage = "Failed to create share link. Please try again.";
      if (error.message.includes("wait")) {
        errorMessage = error.message;
      } else if (error.message.includes("too large")) {
        errorMessage = "Design is too complex to share. Try simplifying it.";
      } else if (error.message.includes("upload")) {
        errorMessage = "Failed to upload background image. Please try again.";
      }
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 4000,
      });
      return null;
    } finally {
      setIsGeneratingLink(false);
    }
  };
  const handleShareClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleShareOption = async (platform) => {
    const link = await generateRemixLink();
    if (!link) {
      toast.error("Failed to generate share link. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }
    setIsMenuOpen(false);
    const shareText = "Check out my QReation! Remix it yourself";
    const fullShareText = `${shareText} ${link}`;
    switch (platform) {
      case "twitter":
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}`;
        window.open(twitterUrl, "_blank", "width=600,height=400");
        break;
      case "facebook":
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(shareText)}`;
        window.open(facebookUrl, "_blank", "width=600,height=400");
        break;
      case "linkedin":
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(shareText)}`;
        window.open(linkedinUrl, "_blank", "width=600,height=400");
        break;
      case "copy-link":
        try {
          await navigator.clipboard.writeText(fullShareText);
          toast.success("Link copied to clipboard!", {
            position: "bottom-right",
            autoClose: 2000,
          });
        } catch (err) {
          const textArea = document.createElement("textarea");
          textArea.value = fullShareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          toast.success("Link copied to clipboard!", {
            position: "bottom-right",
            autoClose: 2000,
          });
        }
        break;
      case "native":
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Check out my QR wallpaper!",
              text: shareText,
              url: link,
            });
          } catch (err) {
            console.log("Native sharing cancelled or failed");
          }
        } else {
          handleShareOption("copy-link");
        }
        break;
      default:
        console.log(`Sharing to ${platform}`);
    }
  };
  return (
    <div className="absolute bottom-6 right-6 z-50" ref={buttonRef}>
      {}
      {isMenuOpen && (
        <div className="absolute bottom-13 right-0 mb-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg shadow-lg w-[350px] max-w-[90vw]">
          <h3 className="text-sm font-medium text-[var(--text-primary)] px-4 py-3">
            Share your Qreation
          </h3>
          {}
          {isGeneratingThumbnail && (
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--bg-main)] bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin size-6 border-2 border-current border-t-transparent text-[var(--accent)] rounded-full"></div>
                  <span className="text-sm text-[var(--text-secondary)]">
                    Generating preview...
                  </span>
                </div>
              </div>
              <div className="h-40 bg-[var(--bg-secondary)] rounded-md mx-3.5 mb-3.5 opacity-30"></div>
            </div>
          )}
          {}
          {!isGeneratingThumbnail && shouldRenderThumbnail && activeState && (
            <React.Suspense
              fallback={
                <div className="h-40 bg-[var(--bg-secondary)] rounded-md mx-3.5 mb-3.5 flex items-center justify-center">
                  <div className="animate-spin size-6 border-2 border-current border-t-transparent text-[var(--accent)] rounded-full"></div>
                </div>
              }
            >
              <Thumbnail
                wallpaperRef={wallpaperRef}
                activeState={activeState}
                backgroundImage={backgroundImage}
                dark={
                  chroma(
                    activeState?.qr.primaryColor || "#000000"
                  ).luminance() > 0.5
                }
              />
            </React.Suspense>
          )}
          {}
          {isGeneratingLink && (
            <div className="px-4 py-2 text-sm text-[var(--text-secondary)] flex items-center gap-2">
              <div className="animate-spin size-4 border-2 border-current border-t-transparent text-[var(--accent)] rounded-full"></div>
              Generating share link...
            </div>
          )}
          {}
          {linkError && (
            <div className="mx-4 mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-xs text-red-600 dark:text-red-400">
                {linkError}
              </p>
            </div>
          )}
          <div className="border-t border-[var(--border-color)] my-1"></div>
          <div className="flex flex-row-wrap w-full space-y-0.5 px-2 pt-1 pb-3">
            <button
              onClick={() => handleShareOption("copy-link")}
              disabled={isGeneratingLink}
              className="w-full justify-center text-left px-1 py-1 text-sm text-[var(--text-secondary)] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-1">
                <Copy
                  size={28}
                  aria-label="Copy Link"
                  className="hover:text-[var(--accent)] hover:cursor-pointer"
                />
                <span className="text-[10px] text-center">Copy Link</span>
              </div>
            </button>
            <button
              onClick={() => handleShareOption("twitter")}
              disabled={isGeneratingLink}
              className="w-full justify-center px-1 py-1 text-sm text-[var(--text-secondary)] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-1">
                <Twitter
                  size={28}
                  aria-label="Twitter"
                  className="hover:text-[var(--accent)] hover:cursor-pointer"
                />
                <span className="text-[10px] text-center">Twitter</span>
              </div>
            </button>
            <button
              onClick={() => handleShareOption("facebook")}
              disabled={isGeneratingLink}
              className="w-full justify-center px-1 py-1 text-sm text-[var(--text-secondary)] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-1">
                <Facebook
                  size={28}
                  aria-label="Facebook"
                  className="hover:text-[var(--accent)] hover:cursor-pointer"
                />
                <span className="text-[10px] text-center">Facebook</span>
              </div>
            </button>
            <button
              onClick={() => handleShareOption("linkedin")}
              disabled={isGeneratingLink}
              className="w-full justify-center px-1 py-1 text-sm text-[var(--text-secondary)] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-1">
                <Linkedin
                  size={28}
                  aria-label="LinkedIn"
                  className="hover:text-[var(--accent)] hover:cursor-pointer"
                />
                <span className="text-[10px] text-center">LinkedIn</span>
              </div>
            </button>
            <button
              onClick={() => handleShareOption("native")}
              disabled={isGeneratingLink}
              className="w-full justify-center px-1 py-1 text-sm text-[var(--text-secondary)] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-1">
                <Share
                  size={28}
                  aria-label="More Options"
                  className="hover:text-[var(--accent)] hover:cursor-pointer"
                />
                <span className="text-[10px] leading-none text-center">
                  More Options
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
      {}
      <button
        onClick={handleShareClick}
        className="w-12 h-12 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title="Share your design"
      >
        <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
      </button>
    </div>
  );
};
export default ShareButton;
