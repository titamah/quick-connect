import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDevice } from "../contexts/DeviceContext";
import {
  Copy,
  ExternalLink,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";

const RemixPage = () => {
  const { remixId } = useParams();
  const navigate = useNavigate();
  const { loadTemplateData, takeSnapshot } = useDevice();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remixData, setRemixData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load remix data on mount
  useEffect(() => {
    const loadRemix = async () => {
      if (!remixId) {
        setError("Invalid remix link");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Loading remix:", remixId);

        // Import remixService dynamically
        const { default: remixService } = await import(
          "../services/remixService"
        );
        const data = await remixService.getRemix(remixId);
        setRemixData(data);

        console.log("✅ Remix data loaded:", data);
      } catch (err) {
        console.error("❌ Failed to load remix:", err);
        setError(err.message || "Failed to load remix");
      } finally {
        setLoading(false);
      }
    };

    loadRemix();
  }, [remixId]);

  // Convert remix device_state to your template format
  const convertRemixToTemplate = (remixData) => {
    const { device_state } = remixData;

    console.log("🔄 Converting remix to template:", device_state);

    // Map remix schema to your internal state structure
    const templateData = {
      deviceInfo: {
        name: "Remixed QR Wallpaper",
        type: "iPhone 15 Pro Max",
        size: { x: 1290, y: 2796 },
      },
      background: {
        style: device_state.bg.type,
        color:
          device_state.bg.type === "solid"
            ? device_state.bg.activeTypeValue
            : "#FFFFFF",
        bg:
          device_state.bg.type === "image"
            ? device_state.bg.activeTypeValue
            : "",
        gradient:
          device_state.bg.type === "gradient"
            ? device_state.bg.activeTypeValue
            : {
                type: "linear",
                stops: [
                  0,
                  "rgb(255, 170, 0)",
                  0.5,
                  "rgb(228,88,191)",
                  1,
                  "rgb(177,99,232)",
                ],
                angle: 0,
                pos: { x: 0.5, y: 0.5 },
              },
        grain: device_state.bg.grain || false,
      },
      qrConfig: {
        url: "www.qrki.com",
        scale: device_state.qr.scale || 0.5,
        custom: {
          primaryColor: device_state.qr.primaryColor,
          secondaryColor: device_state.qr.secondaryColor,
          borderColor: device_state.qr.borderColor,
          borderSizeRatio: device_state.qr.borderWidth,
          cornerRadiusRatio: device_state.qr.borderRadius,
        },
        positionPercentages: {
          x: device_state.qr.pos.x,
          y: device_state.qr.pos.y,
        },
        rotation: device_state.qr.rotation || 0,
      },
      imagePalette: [],
      uploadInfo: {
        filename: null,
        originalImageData: null,
        croppedImageData: null,
        crop: null,
      },
      generatedInfo: {
        filename: null,
        originalImageData: null,
        croppedImageData: null,
        crop: null,
      },
    };

    console.log("✅ Template data converted:", templateData);
    return templateData;
  };

  const handleStartRemixing = async () => {
    if (!remixData) return;

    try {
      setIsLoading(true);

      console.log("🎨 Starting remix process...");

      // Convert remix data to template format
      const templateData = convertRemixToTemplate(remixData);

      // Load the template data using your existing function
      loadTemplateData(templateData);

      // Take a snapshot for undo/redo
      takeSnapshot("Loaded remix design");

      console.log("✅ Template loaded, navigating to studio...");

      // Navigate to studio
      navigate("/studio");

      toast.success("Remix loaded! Start customizing your design.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("❌ Failed to start remixing:", err);
      toast.error("Failed to load remix. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyRemixLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Remix link copied to clipboard!", {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link", {
        position: "bottom-right",
        autoClose: 2000,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)] mx-auto" />
          <p className="text-[var(--text-secondary)]">Loading remix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Remix Not Found
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              {error === "Remix not found or has expired"
                ? "This remix link has expired or the design is no longer available."
                : error}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your Own Design
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full border border-[var(--border-color)] text-[var(--text-primary)] px-6 py-3 rounded-lg font-medium hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="flex flex-col h-fit min-h-[calc(100dvh-40px)] md:min-h-[calc(100dvh-60px)] items-center justify-center relative p-10 bg-[var(--bg-secondary)]">
        <section className="  h-fit p-10 sm:p-20 flex flex-col items-center justify-center gap-8 sm:gap-10 relative self-stretch max-w-[850px] w-fit m-auto bg-[var(--bg-main)] rounded-[30px] sm:rounded-[45px] border-[0.5px] border-solid border-[var(--border-color)] ">
          <p className="relative w-fit slab font-black text-3xl sm:text-4xl text-[var(--text-secondary)] text-center tracking-wider [font-variant:all-small-caps] whitespace-nowrap">
            Remix This Qreation
          </p>

          <p className="relative rubik font-extrabold text-[var(--accent)] text-4xl sm:text-5xl text-center tracking-[0] leading-[43.2px]">
            Make it your own!
          </p>

          <p className="md:w-[700px] w-full md:h-[350px] bg-red-500">
            
          </p>

          <div className="flex flex-row items-center space-x-6 text-sm text-[var(--text-secondary)]">
            <div className="flex flex-row items-center gap-2"> <Clock size={16}/> Created {formatDate(remixData.created_at)}</div>
            <div className="flex flex-row items-center gap-2">
              <Eye size={16}/> <span className="font-medium">{`${remixData.view_count || 0} views`}</span>
            </div>
          </div>
          <button
            className="inline-flex flex-col justify-center py-[12px] px-[18px] bg-[#03bec0] rounded-[60px] border border-solid border-[#817e6ba8] items-center gap-2.5 relative flex-[0_0_auto] hover:bg-[#02a8aa] transition-colors duration-200"
            onClick={handleStartRemixing}
            disabled={isLoading}
            aria-label="Start creating from scratch"
          >
            <span className="relative w-fit font-normal text-black text-lg sm:text-xl text-center tracking-wide leading-[normal] whitespace-nowrap uppercase">
              Let's Do This
            </span>
          </button>
        </section>
      </div>
  );
};

export default RemixPage;
