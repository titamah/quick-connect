import React from 'react';
import { Link } from 'react-router-dom';

const GalleryPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">

      {/* Header */}
      <div className="px-6 py-12 bg-[var(--bg-main)]">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Wallpaper Gallery
          </h1>
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            Browse and discover beautiful QR code wallpapers created by our community.
          </p>
          
          {/* Placeholder for future search/filter functionality */}
          <div className="flex justify-center space-x-4 mb-8">
            <button className="px-4 py-2 bg-[var(--contrast-sheer)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
              All Categories
            </button>
            <button className="px-4 py-2 bg-[var(--contrast-sheer)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
              Most Popular
            </button>
            <button className="px-4 py-2 bg-[var(--contrast-sheer)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--hover-bg)] transition-colors">
              Recent
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Placeholder grid for future wallpapers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div 
                key={index}
                className="bg-[var(--bg-main)] rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-square bg-[var(--hover-bg)] rounded-t-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-[var(--text-secondary)]">Wallpaper {index + 1}</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                    Sample Wallpaper {index + 1}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Beautiful QR code design with custom styling and colors.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--text-secondary)]">
                      Created by User
                    </span>
                    <button className="text-xs bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white px-3 py-1 rounded transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon Message */}
          <div className="text-center py-16">
            <div className="bg-[var(--hover-bg)] border border-[var(--border-color)] rounded-lg p-8 max-w-2xl mx-auto">
              <svg className="w-16 h-16 text-[var(--accent)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Gallery Coming Soon!
              </h3>
              <p className="text-[var(--text-secondary)] mb-4">
                We're working on building a community gallery where you can share and discover amazing QR code wallpapers.
              </p>
              <Link 
                to="/studio" 
                className="inline-block bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Start Creating Your Own
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
