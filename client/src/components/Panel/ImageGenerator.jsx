import React, { useState, useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import {
  Pencil,
  Wand2,
  RotateCcw,
  History,
  X,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_CONFIG } from "../../config/api";
import { 
  canGenerate, 
  recordGeneration, 
  getRemainingGenerations, 
  getGenerationCount 
} from "../../utils/generationLimit";

function ImageGenerator({
  setOriginalFile,
  generatedInfo,
  updateGeneratedInfo,
}) {
  const { device, generationHistory, setGenerationHistory } = useDevice();

  const [prompt, setPrompt] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const abortControllerRef = useRef(null);

  // Get current generation count from localStorage
  const generationCount = getGenerationCount();

  // Navigation functions
  const navigateToPrevious = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      const image = generationHistory[newIndex];
      setCurrentImageIndex(newIndex);
      setCurrentImage(image);
      // Restore prompt and vibe for better UX
      setPrompt(image.prompt || "");
      setSelectedVibe(image.vibe || "");
    }
  };

  const navigateToNext = () => {
    if (currentImageIndex < generationHistory.length - 1) {
      const newIndex = currentImageIndex + 1;
      const image = generationHistory[newIndex];
      setCurrentImageIndex(newIndex);
      setCurrentImage(image);
      // Restore prompt and vibe for better UX
      setPrompt(image.prompt || "");
      setSelectedVibe(image.vibe || "");
    }
  };

  const vibes = [
    { id: "professional", name: "Professional" },
    { id: "creative", name: "Creative" },
    { id: "abstract", name: "Abstract" },
    { id: "minimalist", name: "Minimalist" },
    { id: "nature", name: "Nature" },
  ];

  const buildPrompt = (userPrompt, vibe) => {
    let basePrompt = userPrompt || "abstract background";

    // Add vibe-specific modifiers
    const vibeModifiers = {
      professional: "professional, clean, corporate, minimal, elegant",
      creative: "creative, artistic, dynamic, colorful, expressive",
      minimalist: "minimalist, simple, clean, subtle, refined",
      nature: "natural, organic, nature-inspired, earthy, serene",
      abstract: "abstract, geometric, flowing, modern, artistic",
    };

    if (vibe && vibeModifiers[vibe]) {
      basePrompt += `, ${vibeModifiers[vibe]}`;
    }

    // Add wallpaper-specific terms
    basePrompt +=
      ", wallpaper background, high quality, smooth gradients, mobile wallpaper, vertical orientation";

    return basePrompt;
  };

  const generateImage = async () => {
    if (!API_CONFIG.FAL_API_KEY) {
      setError("AI generation not configured. Add your Fal API key.");
      return;
    }

    // Check generation limit
    if (!canGenerate()) {
      setError(
        "You've reached your daily limit of 5 generations. Try again tomorrow!"
      );
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const finalPrompt = buildPrompt(prompt, selectedVibe);

      // Fal uses different API structure
      const response = await fetch(
        `${API_CONFIG.FAL_BASE_URL}/${API_CONFIG.FAL_MODEL}`,
        {
          method: "POST",
          headers: {
            Authorization: `Key ${API_CONFIG.FAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            negative_prompt:
              "text, letters, words, logos, watermarks, people, faces, low quality, blurry, horizontal, blank, empty",
            image_size: { width: device.size.x, height: device.size.y },
            // num_inference_steps: 25,
            // guidance_scale: 7.5,
            // num_images: 1,
            // enable_safety_checker: false,
            seed: Math.floor(Math.random() * 1000000),
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Generation failed");
      }

      const data = await response.json();

      // Fal returns direct image URLs
      const imageUrl = data.images[0].url;

      // Fetch the actual image to create a blob
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      const localImageUrl = URL.createObjectURL(blob);

      const newImage = {
        id: Date.now(),
        url: localImageUrl,
        blob: blob,
        prompt: finalPrompt,
        vibe: selectedVibe,
        timestamp: Date.now(),
      };

      setCurrentImage(newImage);

      // Add to history and record generation
      setGenerationHistory((prev) => [...prev.slice(-4), newImage]);
      setCurrentImageIndex(generationHistory.length); // New image is at the end
      recordGeneration(); // Record in localStorage

    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Generation cancelled");
      } else {
        setError("Sorry, generation failed. Please try again later.");
        console.error("Fal AI Generation Error:", err);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const useImage = (image) => {
    // Convert blob to File for your existing workflow
    const file = new File([image.blob], `ai-generated-${image.id}.png`, {
      type: "image/png",
    });
    setOriginalFile(file);
  };

  const selectFromHistory = (image) => {
    setCurrentImage(image);
    setShowHistory(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isGenerating) {
      generateImage();
    }
  };

  return (
    <>
      <div className="pointer-events-auto relative p-1 h-full w-full mb-[1.5px] rounded-sm border border-[5px] bg-[var(--bg-main)] border-[var(--bg-main)] !shadow-[0_0_0_.95px_var(--border-color)] flex flex-col gap-1.5 relative">
        {/* Loading State */}
        {isGenerating && (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center py-8 text-center z-10">
            <Loader2 className="animate-spin mb-2" size={48} />
          </div>
        )}
        {/* Generation Counter */}
                 {!currentImage && (
           <div className="absolute bottom-0 right-0 w-full h-fit text-end">
             {getRemainingGenerations() > 0 ? (
               <h4 className="opacity-80 !text-[8px]">
                 {getRemainingGenerations()}/5 left
               </h4>
             ) : (
               <h4 className="!text-red-500 opacity-80 !text-[8px]">
                 Daily limit reached.
               </h4>
             )}
           </div>
         )}

        {!currentImage && (
          <>
            <h3 className="px-0.5 ">Prompt</h3>
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="">
              <textarea
                value={prompt}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.target.blur();
                    generateImage();
                  }
                }}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your background..."
                disabled={isGenerating || generationCount >= 5}
                className="text-xs w-full h-20 p-1.5 bg-[var(--bg-main)] rounded-md !shadow-[0_0_0_.95px_rgb(215,215,215)] dark:!shadow-[0_0_0_.95px_rgb(66,66,66)] disabled:opacity-50 resize-none"
              />
            </form>
          </>
        )}

        {!currentImage && (
          <>
            <h3>Styles</h3>
            {/* Vibe Buttons */}
            <div className="flex flex-wrap gap-1 mb-2">
              {vibes.map((vibe) => (
                <button
                  key={vibe.id}
                  onClick={() =>
                    setSelectedVibe(selectedVibe === vibe.id ? "" : vibe.id)
                  }
                  disabled={isGenerating || !canGenerate()}
                  className={`text-xs px-2 py-1 rounded-full transition-all hover:opacity-80 disabled:opacity-50 ${
                    selectedVibe === vibe.id
                      ? "bg-[var(--contrast)]/50 text-white"
                      : "bg-[var(--contrast-sheer)] "
                  }`}
                >
                  {vibe.name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Generated Image */}
        {currentImage && (
          <div className="space-y-2 h-full">
            <div className="relative group h-[190px]">
              <img
                src={currentImage.url}
                alt="Generated background"
                className="w-full h-full object-contain rounded-md"
                // onClick={() => useImage(currentImage)}
              />

                             {/* Navigation Arrows */}
               {generationHistory.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToPrevious();
                    }}
                    disabled={currentImageIndex === 0}
                    className="absolute cursor-pointer left-0 top-1/2 -translate-y-1/2 bg-[var(--contrast-sheer)] hover:bg-[var(--contrast)]/50 text-white p-1 rounded-full opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToNext();
                    }}
                    disabled={currentImageIndex === generationHistory.length - 1}
                    className="absolute cursor-pointer right-0 top-1/2 -translate-y-1/2 bg-[var(--contrast-sheer)] hover:bg-[var(--contrast)]/50 text-white p-1 rounded-full  opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Generation Counter */}
                             <div className="absolute top-0 left-0 bg-[var(--contrast-sheer)] text-white text-xs p-2 py-1 rounded-full opacity-80">
                 {currentImageIndex + 1} / {generationHistory.length}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate/Cancel Button */}
      {!currentImage && (
        <span className="flex gap-2 items-center mt-5 ">
          <button
            onClick={() =>
              isGenerating ? cancelGeneration() : generateImage()
            }
                         disabled={(!prompt.trim() && !selectedVibe) || !canGenerate()}
            class={`p-1 inline-flex justify-center items-center gap-2 w-full text-sm  rounded-2xl text-white hover:opacity-80 cursor-pointer opacity-100 hover:opacity-80 transition-opacity duration-200 ease-in-out"
          ${isGenerating ? "bg-red-500" : "bg-[var(--accent)]"}`}
          >
            {isGenerating ? (
              <>
                Cancel
                <X size={14} />
              </>
            ) : (
              <>
                <Wand2 size={14} />
                Generate
              </>
            )}
          </button>
                     {generationHistory.length > 1 && (
            <button
              onClick={() => {
                const latestImage = generationHistory[generationHistory.length - 1];
                setCurrentImage(latestImage);
                setCurrentImageIndex(generationHistory.length - 1);
                // Restore prompt and vibe for better UX
                setPrompt(latestImage.prompt || "");
                setSelectedVibe(latestImage.vibe || "");
              }}
              className="bg-neutral-500 h-fit hover:opacity-80 text-white text-sm p-1.5 rounded-md transition-all cursor-pointer"
              title="History"
            >
              <History size={16} />
            </button>
          )}
        </span>
      )}
      {/* Use This Image Button */}
      {currentImage && (
        <span className="flex gap-2 items-center mt-5 ">
          <button
            onClick={() =>
              isGenerating ? cancelGeneration() : useImage(currentImage)
            }
            disabled={!prompt.trim() && !selectedVibe}
            class={`p-1 inline-flex justify-center items-center gap-2 w-full text-sm rounded-2xl text-white hover:opacity-80 cursor-pointer opacity-100 hover:opacity-80 transition-opacity duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          ${isGenerating ? "bg-red-500" : "bg-[var(--brand-green)]"}`}
          >
            {isGenerating ? (
              <>
                Cancel
                <X size={14} />
              </>
            ) : (
              <>
                Select This Image
                <Check size={14} />
              </>
            )}
          </button>

          <button
            onClick={() => generateImage()}
                         disabled={!canGenerate()}
            className="bg-neutral-500 h-fit hover:opacity-80 text-white text-sm p-1.5 rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Regenerate"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={() => setCurrentImage(null)}
            className="bg-neutral-500 h-fit hover:opacity-80 text-white text-sm p-1.5 rounded-md transition-all cursor-pointer"
            title="Edit Prompt"
          >
            <Pencil size={16} />
          </button>
        </span>
      )}
      {/* Error State */}
      {error && (
        <div className="relative p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-600 dark:text-red-400 pr-6">{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-1 right-1 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </>
  );
}

export default ImageGenerator;
