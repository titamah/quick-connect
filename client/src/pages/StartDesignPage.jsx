import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDevice } from "../contexts/DeviceContext";
import { getAllTemplates } from "../utils/templates";

function StartDesignPage() {
  const navigate = useNavigate();
  const { loadTemplateData } = useDevice();

  const handleStartNewDesign = () => {
    navigate("/studio");
  };

  const handleLoadTemplate = (template) => {
    loadTemplateData(template);
    navigate("/studio");
  };

  const templates = getAllTemplates();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Start Your Design
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Choose a template or start from scratch
          </p>
        </div>

        {/* Templates Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
            Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-[var(--bg-secondary)] rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleLoadTemplate(template)}
              >
                {/* Template preview based on background */}
                <div 
                  className="w-full h-48 rounded-md mb-3 flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundColor: template.background?.style === 'solid' 
                      ? template.background?.color 
                      : template.background?.style === 'gradient'
                      ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)'
                      : '#f0f0f0'
                  }}
                >
                  {/* QR Code preview */}
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 mx-auto mb-2 flex items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: template.qrConfig?.custom?.primaryColor || '#000000',
                        color: template.qrConfig?.custom?.secondaryColor || '#FFFFFF'
                      }}
                    >
                      <span className="text-xs font-bold">QR</span>
                    </div>
                    <p className="text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
                      {template.qrConfig?.url || 'QR Code'}
                    </p>
                  </div>
                  
                  {/* Template badge */}
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Template
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-[var(--text-secondary)] font-medium mb-1">
                    {template.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {template.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start from Scratch Button */}
        <div className="text-center">
          <button
            onClick={handleStartNewDesign}
            className="inline-block bg-[var(--accent)] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Start from Scratch
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartDesignPage;

