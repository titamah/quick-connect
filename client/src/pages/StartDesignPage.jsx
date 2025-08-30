import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDevice } from "../contexts/DeviceContext";
import { Trash2 } from "lucide-react";

function StartDesignPage() {
  const navigate = useNavigate();
  const { 
    savedDesigns, 
    loadSavedDesigns, 
    loadDesignFromSlot, 
    deleteDesignFromSlot,
    canSaveMore,
    isLoading 
  } = useDevice();
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);

  useEffect(() => {
    // Load saved designs from IndexedDB
    loadSavedDesigns();
  }, [loadSavedDesigns]);

  const handleLoadDesign = async (slotId) => {
    try {
      await loadDesignFromSlot(slotId);
      navigate("/studio");
    } catch (error) {
      console.error("Failed to load design:", error);
      // You could add a toast notification here
    }
  };

  const handleDeleteDesign = async (slotId, event) => {
    event.stopPropagation(); // Prevent triggering the load function
    try {
      await deleteDesignFromSlot(slotId);
      setShowDeleteMessage(false);
    } catch (error) {
      console.error("Failed to delete design:", error);
    }
  };

  const handleStartNewDesign = async () => {
    const canSave = await canSaveMore();
    if (!canSave) {
      setShowDeleteMessage(true);
      return;
    }
    navigate("/studio");
  };

  const sampleWallpapers = [
    {
      id: 1,
      name: "Sample Wallpaper 1",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkY2QjIzIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlFSS0k8L3RleHQ+Cjwvc3ZnPgo=",
    },
    {
      id: 2,
      name: "Sample Wallpaper 2",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjM0I4MkY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlFSS0k8L3RleHQ+Cjwvc3ZnPgo=",
    },
    {
      id: 3,
      name: "Sample Wallpaper 3",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMTA5ODY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlFSS0k8L3RleHQ+Cjwvc3ZnPgo=",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Start Your Design
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Choose a template or continue with your last design
          </p>
        </div>

        {/* Templates Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
            Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleWallpapers.map((wallpaper) => (
              <div
                key={wallpaper.id}
                className="bg-[var(--bg-secondary)] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  // Navigate to studio with template data
                  window.location.href = "/studio";
                }}
              >
                <img
                  src={wallpaper.image}
                  alt={wallpaper.name}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <p className="text-sm text-[var(--text-secondary)]">
                  {wallpaper.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Designs Section */}
        {isLoading ? (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
              Recent Designs
            </h2>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)] mx-auto"></div>
              <p className="text-[var(--text-secondary)] mt-2">Loading designs...</p>
            </div>
          </div>
        ) : savedDesigns.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
              Recent Designs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedDesigns.map((design) => (
                <div
                  key={design.id}
                  className="bg-[var(--bg-secondary)] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer relative group"
                  onClick={() => handleLoadDesign(design.id)}
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteDesign(design.id, e)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Delete design"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {/* Design preview - we'll generate a simple preview based on background */}
                  <div 
                    className="w-full h-48 rounded-md mb-3 flex items-center justify-center"
                    style={{
                      backgroundColor: design.background?.style === 'solid' 
                        ? design.background?.color 
                        : design.background?.style === 'gradient'
                        ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)'
                        : '#f0f0f0'
                    }}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-black rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white text-xs">QR</span>
                      </div>
                      <p className="text-xs text-gray-600">{design.qrConfig?.url || 'QR Code'}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-[var(--text-secondary)] font-medium">
                      {design.name || 'Untitled Design'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(design.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {showDeleteMessage && (
          <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
            <p className="text-yellow-800">
              You have reached the maximum of 5 saved designs. Please delete one to continue.
            </p>
          </div>
        )}

        {/* Start from Scratch Button */}
        <div className="text-center">
          <button
            onClick={handleStartNewDesign}
            disabled={isLoading}
            className="inline-block bg-[var(--accent)] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Loading..." : "Start from Scratch"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartDesignPage;
