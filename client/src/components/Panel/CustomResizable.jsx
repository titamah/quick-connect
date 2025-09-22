import { useState, useEffect, useRef, useCallback, forwardRef } from "react";

const CustomResizable = forwardRef(
  (
    {
      children,
      direction = "side",
      minSize = 200,
      maxSize = 800,
      panelSize,
      setPanelSize,
      className = "",
      style = {},
      toggleButton = null,
    },
    ref
  ) => {

    const containerRef = useRef(null);
    
    const resizeStateRef = useRef({
      isResizing: false,
      startPos: 0,
      startSize: 0,
      handleElement: null
    });

    const isSide = direction === "side";
    const cursor = isSide ? "col-resize" : "row-resize";
    
    const handleMouseMove = useCallback(
      (e) => {
        if (!resizeStateRef.current.isResizing) return;
        
        e.preventDefault();
        
        const currentPos = isSide ? e.clientX : e.clientY;
        const delta = currentPos - resizeStateRef.current.startPos;
        
        const adjustedDelta = isSide ? delta : -delta;
        const newSize = Math.max(minSize, Math.min(maxSize, resizeStateRef.current.startSize + adjustedDelta));
        
        if (isSide) {
          setPanelSize({ width: newSize, height: panelSize.height });
        } else {
          setPanelSize({ width: panelSize.width, height: newSize });
        }
      },
      [isSide, minSize, maxSize, setPanelSize, panelSize]
    );

    const handleMouseUp = useCallback(() => {
      if (!resizeStateRef.current.isResizing) return;
      
      resizeStateRef.current.isResizing = false;
      resizeStateRef.current.handleElement = null;

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.pointerEvents = "";
      
      if (document.body.style.pointerEvents) {
        document.body.style.pointerEvents = "";
      }
    }, [handleMouseMove]);

    const handleMouseDown = useCallback(
      (e) => {
        
        if (resizeStateRef.current.isResizing || e.button !== 0) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        const handleElement = e.currentTarget;
        
        
        const startPos = isSide ? e.clientX : e.clientY;
        
        resizeStateRef.current = {
          isResizing: true,
          startPos,
          startSize: isSide ? panelSize.width : panelSize.height,
          handleElement
        };

        document.addEventListener("mousemove", handleMouseMove, { passive: false });
        document.addEventListener("mouseup", handleMouseUp, { passive: false });
        document.body.style.cursor = cursor;
        document.body.style.userSelect = "none";
        document.body.style.pointerEvents = "none"; 
      },
      [panelSize.width, panelSize.height, isSide, cursor, handleMouseMove, handleMouseUp, direction]
    );

    const handleTouchMove = useCallback(
      (e) => {
        if (!resizeStateRef.current.isResizing) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        const currentPos = isSide ? touch.clientX : touch.clientY;
        const delta = currentPos - resizeStateRef.current.startPos;
        
        const adjustedDelta = isSide ? delta : -delta;
        const newSize = Math.max(minSize, Math.min(maxSize, resizeStateRef.current.startSize + adjustedDelta));
        
        if (isSide) {
          setPanelSize({ width: newSize, height: panelSize.height });
        } else {
          setPanelSize({ width: panelSize.width, height: newSize });
        }
      },
      [isSide, minSize, maxSize, setPanelSize, panelSize]
    );

    const handleTouchEnd = useCallback(() => {
      if (!resizeStateRef.current.isResizing) return;
      
      resizeStateRef.current.isResizing = false;
      resizeStateRef.current.handleElement = null;

      document.removeEventListener("touchmove", handleTouchMove, true);
      document.removeEventListener("touchend", handleTouchEnd, true);
      document.body.style.userSelect = "";
    }, [handleTouchMove]);

    const handleTouchStart = useCallback(
      (e) => {
        if (resizeStateRef.current.isResizing) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const handleElement = e.currentTarget;
        const touch = e.touches[0];
        const startPos = isSide ? touch.clientX : touch.clientY;
        
        
        resizeStateRef.current = {
          isResizing: true,
          startPos,
          startSize: isSide ? panelSize.width : panelSize.height,
          handleElement
        };

        document.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
        document.addEventListener("touchend", handleTouchEnd, true);
        document.body.style.userSelect = "none";
        
      },
      [panelSize.width, panelSize.height, isSide, handleTouchMove, handleTouchEnd, direction]
    );

    useEffect(() => {
      return () => {
        document.removeEventListener("mousemove", handleMouseMove, true);
        document.removeEventListener("mouseup", handleMouseUp, true);
        document.removeEventListener("touchmove", handleTouchMove, true);
        document.removeEventListener("touchend", handleTouchEnd, true);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        if (document.body.style.pointerEvents) {
          document.body.style.pointerEvents = "";
        }
      };
    }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    return (
      <div
        ref={ref || containerRef}
        className={`relative ${className}`}
        style={{
          width: isSide ? `${panelSize.width}px` : "100%",
          height: isSide ? "100%" : `${panelSize.height}px`,
          transition: isSide ? "width 300ms ease-in-out" : "height 300ms ease-in-out",
          ...style,
        }}
      >
        {children}

        {toggleButton && direction === "bottom" && (
          <div className="absolute z-50 left-1/2 top-0 cursor-pointer transform -translate-x-1/2 h-[10px] w-[50px] flex items-center justify-center">
            <div className="cursor-pointer" onClick={toggleButton}>
              <span className="absolute start-1/2 -translate-x-1/2 -translate-y-1/2 block w-7 h-5 flex justify-center items-center bg-white border border-gray-200 text-gray-400 rounded-md hover:bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-600 dark:hover:bg-neutral-900">
                <svg
                  className="shrink-0 size-4.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="5" cy="8" r="1" />
                  <circle cx="12" cy="8" r="1" />
                  <circle cx="19" cy="8" r="1" />
                  <circle cx="5" cy="16" r="1" />
                  <circle cx="12" cy="16" r="1" />
                  <circle cx="19" cy="16" r="1" />
                </svg>
              </span>
            </div>
          </div>
        )}

        {toggleButton && direction === "side" && (
          <span
            className="absolute top-1/2 cursor-pointer right-0 translate-x-1/2 block w-5 h-7 flex items-center border border-[var(--border-color)] text-[var(--contrast)]/50 rounded-md bg-[var(--bg-main)] hover:text-[var(--contrast-sheer)] z-275"
            onClick={toggleButton}
          >
            <svg
              className="shrink-0 size-4.5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="12" r="1" />
              <circle cx="8" cy="5" r="1" />
              <circle cx="8" cy="19" r="1" />
              <circle cx="16" cy="12" r="1" />
              <circle cx="16" cy="5" r="1" />
              <circle cx="16" cy="19" r="1" />
            </svg>
          </span>
        )}
        
            <div
              className="absolute z-10"
              style={{
                cursor: cursor,
                ...(isSide
                  ? {
                      right: 0,
                      top: 0,
                      width: "10px",
                      height: "100%",
                    }
                  : {
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "10px",
                    }),
              }}
              onMouseDown={handleMouseDown}
              onDrag={handleMouseMove}
              onDragEnd={handleMouseUp}
              onTouchStart={handleTouchStart}
            />
      </div>
    );
  }
);

CustomResizable.displayName = "CustomResizable";

export default CustomResizable;