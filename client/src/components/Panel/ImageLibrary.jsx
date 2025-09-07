import React, { useState, useRef } from "react";
import { useDevice } from "../../contexts/DeviceContext";
import { Wand2, RotateCcw, History, X, Loader2 } from "lucide-react";
import { API_CONFIG } from "../../config/api";
function ImageLibrary({ setOriginalFile }) {
  const { device } = useDevice();
  const [prompt, setPrompt] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageHistory, setImageHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const abortControllerRef = useRef(null);
  const vibes = [
    { id: "professional", name: "Professional", emoji: "💼" },
    { id: "creative", name: "Creative", emoji: "🎨" },
    { id: "minimalist", name: "Minimalist", emoji: "✨" },
    { id: "nature", name: "Nature", emoji: "🌿" },
    { id: "abstract", name: "Abstract", emoji: "🔮" }
  ];
  const buildPrompt = (userPrompt, vibe) => {
    let basePrompt = userPrompt || "abstract background";
    const vibeModifiers = {
      professional: "professional, clean, corporate, minimal, elegant",
      creative: "creative, artistic, dynamic, colorful, expressive", 
      minimalist: "minimalist, simple, clean, subtle, refined",
      nature: "natural, organic, nature-inspired, earthy, serene",
      abstract: "abstract, geometric, flowing, modern, artistic"
    };
    if (vibe && vibeModifiers[vibe]) {
      basePrompt += `, ${vibeModifiers[vibe]}`;
    }
    basePrompt += ", wallpaper background, high quality, smooth gradients, mobile wallpaper, vertical orientation";
    return basePrompt;
  };
  const generateImage = async (isRegenerate = false) => {
    if (!API_CONFIG.FAL_API_KEY) {
      setError("AI generation not configured. Add your Fal API key.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    abortControllerRef.current = new AbortController();
    try {
      const finalPrompt = buildPrompt(prompt, selectedVibe);
      const response = await fetch(`${API_CONFIG.FAL_BASE_URL}/${API_CONFIG.FAL_MODEL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${API_CONFIG.FAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          negative_prompt: "text, letters, words, logos, watermarks, people, faces, low quality, blurry, horizontal",
          image_size: {width: device.size.x, height: device.size.y},
          seed: Math.floor(Math.random() * 1000000)
        }),
        signal: abortControllerRef.current.signal
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Generation failed');
      }
      const data = await response.json();
      const imageUrl = data.images[0].url;
      const imageResponse = await fetch(imageUrl);
      const blob = await imageResponse.blob();
      const localImageUrl = URL.createObjectURL(blob);
      const newImage = {
        id: Date.now(),
        url: localImageUrl,
        blob: blob,
        prompt: finalPrompt,
        vibe: selectedVibe,
        timestamp: Date.now()
      };
      setCurrentImage(newImage);
      if (!isRegenerate) {
        setImageHistory(prev => [newImage, ...prev.slice(0, 4)]);
      } else {
        setImageHistory(prev => [newImage, ...prev.slice(1)]);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Generation cancelled');
      } else {
        setError("Sorry, generation failed. Please try again later.");
        console.error('Fal AI Generation Error:', err);
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
    const file = new File([image.blob], `ai-generated-${image.id}.png`, { 
      type: 'image/png' 
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
    <div className="pb-1 pointer-events-auto pt-2 w-full h-full flex flex-col gap-2 overflow-y-scroll relative">
      {}
      <form onSubmit={handleSubmit} className="w-full">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your background..."
          disabled={isGenerating}
          className="dark:text-white text-xs w-[98%] mx-[1px] h-4 mb-2 px-2 rounded-full sticky !shadow-[0_0_0_.95px_rgb(215,215,215)] dark:!shadow-[0_0_0_.95px_rgb(66,66,66)] disabled:opacity-50"
        />
      </form>
      {}
      <div className="flex flex-wrap gap-1 mb-2">
        {vibes.map((vibe) => (
          <button
            key={vibe.id}
            onClick={() => setSelectedVibe(selectedVibe === vibe.id ? "" : vibe.id)}
            disabled={isGenerating}
            className={`text-xs px-2 py-1 rounded-full transition-all disabled:opacity-50 ${
              selectedVibe === vibe.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {vibe.emoji} {vibe.name}
          </button>
        ))}
      </div>
      {}
      <button
        onClick={() => isGenerating ? cancelGeneration() : generateImage()}
        disabled={!prompt.trim() && !selectedVibe}
        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          isGenerating 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isGenerating ? (
          <>
            <X size={14} />
            Cancel
          </>
        ) : (
          <>
            <Wand2 size={14} />
            Generate
          </>
        )}
      </button>
      {}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Loader2 className="animate-spin mb-2" size={24} />
          <p className="text-xs text-gray-500">Generating your background...</p>
          <p className="text-xs text-gray-400 mt-1">Usually takes 5-15 seconds</p>
        </div>
      )}
      {}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      {}
      {currentImage && !isGenerating && (
        <div className="space-y-2">
          <div className="relative group" onClick={() => useImage(currentImage)}>
            <img
              src={currentImage.url}
              alt="Generated background"
              className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-all rounded-md flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                Click to use
              </span>
            </div>
          </div>
          {}
          <div className="flex gap-2">
            <button
              onClick={() => useImage(currentImage)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded-md transition-all"
            >
              Use This Image
            </button>
            <button
              onClick={() => generateImage(true)}
              className="bg-gray-500 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-md transition-all"
              title="Regenerate"
            >
              <RotateCcw size={14} />
            </button>
            {imageHistory.length > 1 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="bg-gray-500 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-md transition-all"
                title="History"
              >
                <History size={14} />
              </button>
            )}
          </div>
        </div>
      )}
      {}
      {showHistory && imageHistory.length > 1 && (
        <div className="space-y-2 border-t pt-2">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400">Recent Generations</h4>
          {imageHistory.slice(1).map((image, index) => (
            <div key={image.id} className="flex gap-2 items-center">
              <img
                src={image.url}
                alt={`Generated ${index + 1}`}
                className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                onClick={() => selectFromHistory(image)}
              />
              <div className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                <p className="truncate">{image.prompt.slice(0, 30)}...</p>
                <p>{new Date(image.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {}
      {!currentImage && !isGenerating && !error && (
        <div className="text-center py-12 text-gray-400">
          <Wand2 size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-xs">Describe your ideal background above</p>
          <p className="text-xs mt-1">Lightning fast AI generation ⚡</p>
        </div>
      )}
    </div>
  );
}
export default ImageLibrary;