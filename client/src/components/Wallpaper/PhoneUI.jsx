import { usePreview } from "../../contexts/PreviewContext";
import { useDevice } from "../../contexts/DeviceContext";
import {
  Wifi,
  Signal,
  Battery,
  Rewind,
  Pause,
  FastForward,
  AudioLines,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import chroma from 'chroma-js';

const PhoneUI = ({ fullscreen = false }) => {
  const { isPreviewVisible } = usePreview();
  const { background } = useDevice();
  const showToolbars = !fullscreen;
  
  const getTextColorForBackground = () => {
    let bgColors = [];
    
    if (background.style === "solid" && background.color) {
      bgColors = [background.color];
    } else if (background.style === "gradient" && background.gradient.stops) {
      bgColors = background.gradient.stops
        .filter((_, i) => i % 2 === 1)
        .map(color => color);
    }
    
    if (bgColors.length === 0) return 'white';
    
    // Use chroma to determine if background is dark
    const luminances = bgColors.map(color => chroma(color).luminance());
    const averageLuminance = luminances.reduce((sum, lum) => sum + lum, 0) / luminances.length;
    
    return averageLuminance < 0.5 ? 'white' : 'black';
  };
  
  const textColor = getTextColorForBackground();
  
  const containerRef = useRef(null);
  const [borderRadius, setBorderRadius] = useState('8px');

  useEffect(() => {
    if (containerRef.current) {
      const updateRadius = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          const radius = width * 0.05;
          containerRef.current.style.borderRadius = `${radius}px`;
        }
      };
      
      updateRadius();
      const resizeObserver = new ResizeObserver(updateRadius);
      resizeObserver.observe(containerRef.current);
      
      return () => resizeObserver.disconnect();
    }
  }, []);

  if (!isPreviewVisible) return null;
  return (
    <div className="pointer-events-none absolute top-0 p-[2%] left-0 w-full h-full flex flex-col items-center justify-between z-[2000]">
      <span className="w-[95%] h-[30%] flex flex-col items-center justify-between">
        
         <div className="w-full h-[10%] flex flex-row justify-around items-center text-white">
          {showToolbars && <><div className="w-[25%] h-full flex items-center justify-center">
            <svg viewBox="0 0 100 20" className="w-full h-full">
              <text
                x="50"
                y="19"
                textAnchor="middle"
                fill={textColor}
                fontSize="21"
                fontWeight="300"
                fontFamily="Rubik"
              >
                QRKI
              </text>
            </svg>
          </div>

          <div className="h-full w-[32%] rounded-full bg-black"> </div>

          <div className={`flex w-[25%] flex-row items-center gap-[10%] text-${textColor}`}>
            <Signal />
            <Wifi />
            <Battery />
          </div></>}
        </div>

        <div className="w-[100%] h-[45%] flex items-center justify-center">
          <svg viewBox="0 0 200 60" className="w-full h-full">
            <text
              x="100"
              y="45"
              textAnchor="middle"
              fill={textColor}
              fontSize="64"
              fontWeight="450"
              fontFamily="Rubik"
            >
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </text>
          </svg>
        </div>
      </span>
      <span className="w-[95%] h-[30%] flex flex-col items-center justify-between">
        <div 
          ref={containerRef}
          style={{ borderRadius }}
          className="w-full h-[75%] py-[3.5%] px-[5%] mb-[1%] bg-[#F0F0F0]/50 backdrop-blur-md border-white/10 border-1 flex flex-col text-black justify-between" 
        >
          <span className="w-full h-[45%] flex flex-row items-center justify-start gap-[2%]">
            <img
              className="h-full aspect-square rounded-[10%] bg-black"
              src="/tyla.png"
            />
            <span className="w-full h-fit p-[1.5%] flex flex-col items-start justify-start">
              <svg viewBox="0 0 120 16" className="w-full h-[40%]">
                <text
                  x="0"
                  y="12"
                  fill="black"
                  fontSize="11"
                  fontWeight="450"
                >
                  DYNAMITE
                </text>
              </svg>
              <svg viewBox="0 0 120 12" className="w-full h-[30%]">
                <text
                  x="0"
                  y="9"
                  fill="black"
                  fontSize="10"
                  fontWeight="300"
                  opacity="0.5"
                >
                  Tyla, Wizkid
                </text>
              </svg>
            </span>
            <div className="w-[10%] h-fit flex">
              <AudioLines opacity={0.5} />
            </div>
          </span>
          <div className="w-full h-[5%] rounded-full mb-[1%] bg-black/25"></div>
          <div className="w-[100%] px-[20%] h-[35%] p-[1%] flex flex-row items-center justify-center">
            <Rewind fill="currentColor" size="90%" />
            <Pause fill="currentColor" size="90%" />
            <FastForward fill="currentColor" size="90%" />
          </div>
        </div>

        <div className="w-[40%] h-[2.5%] rounded-full mb-[1%] bg-white/50"></div>
      </span>
    </div>
  );
};

export default PhoneUI;
