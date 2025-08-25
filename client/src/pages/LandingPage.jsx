import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <h1 className="text-6xl font-bold text-[var(--text-primary)] mb-6">
          Create Stunning
          <span className="text-[var(--accent)] block">QR Code Wallpapers</span>
        </h1>
        
        <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl">
          Design beautiful, custom QR code wallpapers for your devices. 
          Perfect for personal branding, events, or just making your phone look amazing.
        </p>
        
        <div className="flex space-x-4">
          <Link 
            to="/studio" 
            className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Start Creating
          </Link>
          <Link 
            to="/gallery" 
            className="bg-[var(--contrast-sheer)] hover:bg-[var(--hover-bg)] text-[var(--text-primary)] px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Browse Gallery
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16 bg-[var(--bg-main)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-12">
            Why Choose QuickConnect?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--hover-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Lightning Fast</h3>
              <p className="text-[var(--text-secondary)]">
                Create professional QR codes in seconds with our optimized design tools.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--hover-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--accent-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Customizable</h3>
              <p className="text-[var(--text-secondary)]">
                Full control over colors, gradients, borders, and positioning.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--hover-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--accent-highlight)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">High Quality</h3>
              <p className="text-[var(--text-secondary)]">
                Export in high resolution for perfect results on any device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
