import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDevice } from "../contexts/DeviceContext";

function StartDesignPage() {
  const { device } = useDevice();
  const [wallpapers, setWallpapers] = useState([]);

  useEffect(() => {
    // Load saved wallpapers from localStorage
    const savedWallpapers = localStorage.getItem("qrki-wallpapers");
    if (savedWallpapers) {
      try {
        setWallpapers(JSON.parse(savedWallpapers));
      } catch (error) {
        console.error("Error loading wallpapers:", error);
      }
    }
  }, []);

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

        {/* Last Design Section */}
        {wallpapers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
              Your Last Design
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wallpapers.slice(0, 3).map((wallpaper, index) => (
                <div
                  key={index}
                  className="bg-[var(--bg-secondary)] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    // Navigate to studio with last design data
                    window.location.href = "/studio";
                  }}
                >
                  <img
                    src={wallpaper.image}
                    alt={`Wallpaper ${index + 1}`}
                    className="w-full h-48 object-cover rounded-md mb-3"
                  />
                  <p className="text-sm text-[var(--text-secondary)]">
                    Wallpaper {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start from Scratch Button */}
        <div className="text-center">
          <Link
            to="/studio"
            className="inline-block bg-[var(--accent)] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Start from Scratch
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StartDesignPage;
