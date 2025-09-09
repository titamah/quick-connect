import React from "react";

const WallpaperSkeleton = ({ previewSize }) => {
  return (
    <div
      className="bg-[var(--bg-secondary)] rounded-[1.25rem] flex relative animate-pulse"
      style={{
        height: `${previewSize.y}px`,
        width: `${previewSize.x}px`,
      }}
    >
      {/* Phone frame skeleton */}
      <div className="absolute inset-0 bg-gray-200 rounded-[1.25rem]"></div>
      
      {/* QR code area skeleton - positioned like a real QR */}
      <div 
        className="absolute bg-gray-300 rounded"
        style={{
          width: 80,
          height: 80,
          top: "20%",
          right: "15%"
        }}
      ></div>
      
      {/* Background pattern skeleton */}
      <div className="absolute inset-2 bg-gray-100 rounded-md"></div>
    </div>
  );
};

export default WallpaperSkeleton;
