// Update your existing ShareButton.jsx with these changes:

import React, { useState, useRef, useEffect } from "react";
import { Share, Share2, Copy, Facebook, Linkedin, Twitter } from "lucide-react";
import { useDevice } from "../../contexts/DeviceContext";
import Thumbnail from "./Thumbnail copy.jsx";
import ThumbnailDiv from "./Thumbnail.jsx";
import { toast } from "react-toastify";

const ShareButton = ({ wallpaperRef }) => {
  // Add props
  const { deviceState, qrConfig, background } = useDevice();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [remixLink, setRemixLink] = useState(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [activeState, setActiveState] = useState(null);

  const thumbnailHeight = 160;
  const thumbnailWidth = 320;
  const thumbnailPadding = thumbnailWidth / 10;
  const phoneWidth = thumbnailWidth * 0.35;
  const phoneHeight = thumbnailWidth * 0.8;
  const QRsize = phoneWidth / 2;
  const QRborderWidth = QRsize + QRsize * (activeState?.qr.borderWidth / 100);

  // Base positions (your padding/offset values)
  const baseX = phoneWidth / 4;
  const baseY = thumbnailWidth / 10;

  // Offset calculations (same pattern for both)
  const xOffset = (0.5 - activeState?.qr.pos.x) * phoneWidth;
  const yOffset = (0.5 - activeState?.qr.pos.y) * phoneHeight;

  // Final positions
  const QRXpos = baseX + xOffset;
  const PhoneYpos = baseY + yOffset;

  const buttonRef = useRef(null);

  // Function to create a schema of active device state values for sharing
  const createDeviceStateSchema = () => {
    const schema = {
      qr: {
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
    console.log(schema);
    return schema;
  };

  useEffect(() => {
    if (isMenuOpen) {
      // setIsGeneratingLink(true);
      // generateRemixLink();
      setActiveState(createDeviceStateSchema());
    }
  }, [isMenuOpen]);

  // Close menu when clicking outside
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

  const generateRemixLink = async () => {
    if (remixLink) return remixLink; // Already generated
    setIsGeneratingLink(true);
    try {
      // Create schema for sharing
      const deviceSchema = createDeviceStateSchema();

      // TODO: Replace with your actual createRemix function
      // You can pass the schema instead of the full deviceState
      const remixId = await createRemix(deviceSchema);
      const link = `${window.location.origin}/remix/${remixId}`;
      setRemixLink(link);
      return link;
    } catch (error) {
      console.error("Failed to create remix link:", error);
      return null;
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleShareClick = async () => {
    setIsMenuOpen(!isMenuOpen);

    // Pre-generate the remix link when menu opens
    if (!remixLink && !isGeneratingLink) {
      await generateRemixLink();
    }
  };

  const handleShareOption = async (platform) => {
    setIsMenuOpen(false);

    const link = await generateRemixLink();
    if (!link) {
      alert("Failed to generate share link. Please try again.");
      return;
    }

    const shareText = "Check out my QReation! Remix it yourself";
    const fullShareText = `${shareText} ${link}`;

    switch (platform) {
      case "twitter":
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          fullShareText
        )}`;
        window.open(twitterUrl, "_blank", "width=600,height=400");
        break;

      case "facebook":
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          link
        )}&quote=${encodeURIComponent(shareText)}`;
        window.open(facebookUrl, "_blank", "width=600,height=400");
        break;

      case "linkedin":
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          link
        )}&summary=${encodeURIComponent(shareText)}`;
        window.open(linkedinUrl, "_blank", "width=600,height=400");
        break;

      case "copy-link":
        try {
          await navigator.clipboard.writeText(fullShareText);
          toast.success("Download complete", {
            position: "bottom-right",
            autoClose: 2000,
          });
          console.log("Link copied to clipboard!");
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = fullShareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          console.log("Link copied to clipboard!");
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
          // Fallback: copy to clipboard
          handleShareOption("copy-link");
        }
        break;

      default:
        console.log(`Sharing to ${platform}`);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={buttonRef}>
      {/* Share Menu */}
      {!isMenuOpen && (
        <div className="absolute bottom-13 right-0 mb-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg shadow-lg w-[350px] max-w-[90vw]">
          <h3 className="text-sm font-medium text-[var(--text-primary)] px-4 py-3">
            Share your Qreation
          </h3>
          <Thumbnail activeState={activeState} />
          <ThumbnailDiv activeState={activeState} />
          {isGeneratingLink && (
            <h4 className="px-2 py-2 text-sm text-[var(--text-secondary)]">
              Generating share link...
            </h4>
          )}
          <div className="border-t border-[var(--border-color)] my-1"></div>

          <div className="flex flex-row-wrap w-full space-y-0.5 px-2 pt-1 pb-3">
            <button
              onClick={() => handleShareOption("copy-link")}
              disabled={isGeneratingLink}
              className="w-full justify-center  text-left px-1 py-1 text-sm text-[var(--text-secondary)] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
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
              className="w-full justify-center  px-1 py-1 text-sm text-[var(--text-secondary)] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
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

            {/* <div className="border-t border-[var(--border-color)] my-1"></div> */}

            <button
              onClick={() => handleShareOption("native")}
              disabled={isGeneratingLink}
              className="w-full justify-center  px-1 py-1 text-sm text-[var(--text-secondary)] rounded transition-colors flex items-center gap-2 disabled:opacity-50"
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

      {/* Share Button */}
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
