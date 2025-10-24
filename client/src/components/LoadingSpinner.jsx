import React from "react";

const LoadingSpinner = ({ 
  size = "medium", 
  variant = "logo", 
  className = "",
  showText = false,
  text = "Loading..."
}) => {
  // Size variants
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8", 
    large: "w-12 h-12",
    xlarge: "w-16 h-16"
  };

  // Logo variants
  const logoSrc = variant === "quacki" ? "/QRkiCode.svg" : "/LOGO.svg";
  
  return (
    <div className={`flex flex-col h-full items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Logo with subtle pulse animation */}
        <img 
          src={logoSrc}
          alt="Loading..."
          className="w-full h-full object-contain"
          style={{
            animation: "logoPulse 2s ease-in-out infinite"
          }}
        />
      </div>
      
      {/* Optional loading text */}
      {showText && (
        <p className="mt-2 text-sm text-[var(--text-secondary)] animate-pulse">
          {text}
        </p>
      )}
      
      <style jsx>{`
        @keyframes logoPulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.05);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
