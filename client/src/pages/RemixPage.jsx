import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDevice } from "../contexts/DeviceContext";
import {
  Loader2,
  AlertCircle,
  Eye,
  Clock,
} from "lucide-react";
import { useToast } from "../components/Toast";
const RemixPage = () => {
  const { remixId } = useParams();
  const navigate = useNavigate();
  const { loadTemplateData, takeSnapshot } = useDevice();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remixData, setRemixData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
        const { default: remixService } = await import(
          "../services/remixService"
        );
        const data = await remixService.getRemix(remixId);
        setRemixData(data);
      } catch (err) {
        console.error("❌ Failed to load remix:", err);
        setError(err.message || "Failed to load remix");
      } finally {
        setLoading(false);
      }
    };
    loadRemix();
  }, [remixId]);
  const convertRemixToTemplate = (remixData) => {
    const { device_state } = remixData;
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
        grain: device_state.bg.grain || 0,
      },
      qrConfig: {
        url: "www.qrki.xyz",
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
    return templateData;
  };
  const handleStartRemixing = async () => {
    if (!remixData) return;
    try {
      setIsLoading(true);
      const templateData = convertRemixToTemplate(remixData);
      if (templateData.background.style === 'image' && templateData.background.bg) {
        try {
          const response = await fetch(templateData.background.bg);
          const blob = await response.blob();
          const filename = templateData.background.bg.split('/').pop() || 'remix-background.webp';
          const file = new File([blob], filename, { type: blob.type });
          const reader = new FileReader();
          reader.onload = () => {
            templateData.uploadInfo = {
              filename: filename,
              originalImageData: reader.result,
              croppedImageData: reader.result, 
              crop: {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                unit: '%'
              }
            };
            loadTemplateData(templateData);
            takeSnapshot("Loaded remix design");
            console.log("✅ Background image loaded for editing");
            navigate("/studio");
          };
          reader.readAsDataURL(file);
        } catch (imageError) {
          console.warn("⚠️ Failed to load background image for editing:", imageError);
          loadTemplateData(templateData);
          takeSnapshot("Loaded remix design");
          navigate("/studio");
        }
      } else {
        loadTemplateData(templateData);
        takeSnapshot("Loaded remix design");
        navigate("/studio");
      }
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
  const getDaysUntilExpiry = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Expired";
    if (diffDays === 1) return "Expires in 1 day";
    return `Expires in ${diffDays} days`;
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
    
    <div className="overlow-hidden flex flex-col h-full min-h-[calc(100dvh-40px)] md:min-h-[calc(100dvh-60px)] items-center relative p-10 bg-[var(--bg-secondary)]">
      <section className=" w-full px-5 py-10 sm:p-20 flex flex-col items-center justify-center gap-8 sm:gap-10 relative self-stretch max-w-[850px] w-fit m-auto my-auto top-[45%] bg-[var(--bg-main)] rounded-[30px] sm:rounded-[45px] border-[0.5px] border-solid border-[var(--border-color)] ">
      <p className="relative w-full rubik font-black text-4xl sm:text-5xl text-[var(--text-primary)] text-center leading-[0.75] tracking-wider [font-variant:all-small-caps] ">
          Remix This Qreation
        </p>
        <div className="  w-[95%] bg-[var(--accent)] rounded-lg overflow-hidden flex items-center justify-center">
          {remixData.thumbnail_url ? (
            <img
              src={remixData.thumbnail_url}
              alt="Remix preview"
              className=" w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]"
            style={{ display: remixData.thumbnail_url ? "none" : "flex" }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🎨</div>
              <p>Preview generating...</p>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-around w-full text-sm text-[var(--text-secondary)]">
        <h3 className="flex flex-row items-center gap-2"> <Clock size={21}/>{getDaysUntilExpiry(remixData.expires_at)}</h3>
          <h3 className="flex flex-row items-center gap-2"> <Eye size={21} />{`${remixData.view_count || 0} views`}</h3> 
          </div>
        <button
          className="inline-flex flex-col justify-center py-[8px] px-[12px] bg-[var(--accent)] rounded-[60px] border border-solid border-[#817e6ba8] items-center gap-2.5 relative flex-[0_0_auto] hover:opacity-75 cursor-pointer transition-colors duration-200"
          onClick={handleStartRemixing}
          disabled={isLoading}
          aria-label="Start creating from scratch"
        >
          <span className="relative w-fit font-normal text-black text-lg sm:text-lg text-center tracking-wide leading-[normal] whitespace-nowrap uppercase">
            Make It Yours
          </span>
        </button>
      </section>
    </div>
  );
};
export default RemixPage;