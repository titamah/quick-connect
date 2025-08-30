import React from "react";

function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              About QRKI
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Create beautiful QR code wallpapers for your devices
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-[var(--text-primary)]">
            <h2 className="text-2xl font-semibold mb-4">What is QRKI?</h2>
            <p className="mb-6">
              QRKI is a powerful tool for creating custom QR code wallpapers. 
              Design beautiful, personalized QR codes that match your style and 
              seamlessly integrate with your device's wallpaper.
            </p>

            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Custom QR code colors and styling</li>
              <li>Multiple device sizes and formats</li>
              <li>Background customization (solid, gradient, image)</li>
              <li>Real-time preview and editing</li>
              <li>High-quality export options</li>
              <li>Undo/redo functionality</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4">How to Use</h2>
            <ol className="list-decimal pl-6 mb-6 space-y-2">
              <li>Start a new design or choose a template</li>
              <li>Customize your QR code colors and position</li>
              <li>Add your desired background</li>
              <li>Preview and adjust as needed</li>
              <li>Export your wallpaper</li>
            </ol>

            <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
            <p className="mb-6">
              Ready to create your first QR code wallpaper? 
              Head to the Studio and start designing!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
