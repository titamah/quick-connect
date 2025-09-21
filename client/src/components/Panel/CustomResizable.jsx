import { useState, useEffect, useRef, useCallback, forwardRef } from "react";

const CustomResizable = forwardRef(
  (
    {
      children,
      direction = "side", // 'side' for east, 'bottom' for north
      minSize = 200,
      maxSize = 800,
      size,
      onResize,
      className = "",
      style = {},
      toggleButton = null, // function or null
    },
    ref
  ) => {
    const [isResizing, setIsResizing] = useState(false);
    const [startPos, setStartPos] = useState(0);
    const [startSize, setStartSize] = useState(size);
    const containerRef = useRef(null);

    const isSide = direction === "side";
    const cursor = isSide ? "col-resize" : "row-resize";

    const handleMouseDown = useCallback(
      (e) => {
        console.log("🖱️ Mouse down on resize handle", { direction, size });
        e.preventDefault();
        setIsResizing(true);
        setStartPos(isSide ? e.clientX : e.clientY);
        setStartSize(size);

        // Add global event listeners
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = cursor;
        document.body.style.userSelect = "none";
      },
      [size, isSide, cursor]
    );

    const handleMouseMove = useCallback(
      (e) => {
        if (!isResizing) return;

        const currentPos = isSide ? e.clientX : e.clientY;
        const delta = isSide ? currentPos - startPos : startPos - currentPos; // Inverted for north/bottom
        const newSize = Math.max(minSize, Math.min(maxSize, startSize + delta));

        console.log("🖱️ Resizing", { currentPos, delta, newSize, startSize });
        onResize?.(newSize);
      },
      [isResizing, startPos, startSize, isSide, minSize, maxSize, onResize]
    );

    const handleMouseUp = useCallback(() => {
      setIsResizing(false);

      // Remove global event listeners
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }, [handleMouseMove]);

    // Touch support for mobile
    const handleTouchStart = useCallback(
      (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        setIsResizing(true);
        setStartPos(isSide ? touch.clientX : touch.clientY);
        setStartSize(size);

        // Add global touch event listeners
        document.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        document.addEventListener("touchend", handleTouchEnd);
        document.body.style.userSelect = "none";
      },
      [size, isSide]
    );

    const handleTouchMove = useCallback(
      (e) => {
        if (!isResizing) return;
        e.preventDefault();

        const touch = e.touches[0];
        const currentPos = isSide ? touch.clientX : touch.clientY;
        const delta = isSide ? currentPos - startPos : startPos - currentPos;
        const newSize = Math.max(minSize, Math.min(maxSize, startSize + delta));

        onResize?.(newSize);
      },
      [isResizing, startPos, startSize, isSide, minSize, maxSize, onResize]
    );

    const handleTouchEnd = useCallback(() => {
      setIsResizing(false);

      // Remove global touch event listeners
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.body.style.userSelect = "";
    }, [handleTouchMove]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    return (
      <div
        ref={ref || containerRef}
        className={`relative ${className}`}
        style={{
          width: isSide ? `${size}px` : "100%",
          height: isSide ? "100%" : `${size}px`,
          ...style,
        }}
      >
        {children}

        {/* Toggle button - only for bottom direction */}
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
                  // Side/East handle
                  right: 0,
                  top: 0,
                  width: "10px",
                  height: "100%",
                }
              : {
                  // Bottom/North handle
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "10px",
                }),
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
      </div>
    );
  }
);

export default CustomResizable;
