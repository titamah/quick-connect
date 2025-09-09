import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { HexColorPicker, HexAlphaColorPicker } from 'react-colorful';
import { createPortal } from 'react-dom';
import chroma from 'chroma-js';
import { useDevice } from '../contexts/DeviceContext';
import { useThrottledCallback } from '../hooks/useDebounce';

const ColorPicker = forwardRef(({
  value,
  onChange,
  onOpenChange,
  mode = 'popover', // 'popover', 'inline', 'trigger'
  trigger,
  presets = [],
  hasAlpha = false,
  placement = 'bottom',
  size = 'default',
  disabled = false,
  className = '',
  children,
  customPosition = null // { x, y } for custom positioning
}, ref) => {
  const { takeSnapshot, isMobile } = useDevice();
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [needsSnapshot, setNeedsSnapshot] = useState(false);
  const [triggerRect, setTriggerRect] = useState(null);
  
  // Local state for hex input typing
  const [localHex, setLocalHex] = useState(value.slice(0, 7).toUpperCase());
  const [localAlpha, setLocalAlpha] = useState(
    Math.round(chroma(value).alpha() * 100)
  );
  
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const timeoutRef = useRef(null);
  const hexInputRef = useRef(null);
  const alphaInputRef = useRef(null);
  const isPressing = useRef(false);
  
  // Parse color value
  const colorObj = chroma.valid(value) ? chroma(value) : chroma('#ffffff');
  const hexValue = colorObj.hex();
  const alphaValue = Math.round(colorObj.alpha() * 100);

  useEffect(() => {
    setLocalValue(value);
    setLocalHex(value.slice(0, 7).toUpperCase());
    setLocalAlpha(Math.round(chroma(value).alpha() * 100));
  }, [value]);

  // Throttled onChange to prevent color picker stuttering
  const throttledOnChange = useThrottledCallback((newColor) => {
    onChange?.(newColor);
  }, 16); // 60fps

  // Handle color change with snapshot system (matching ColorSelector pattern)
  const handleColorChange = useCallback((newColor) => {
    if (!chroma.valid(newColor)) return;
    
    if (needsSnapshot) {
      takeSnapshot("Change color");
      setNeedsSnapshot(false);
    }
    
    setLocalValue(newColor);
    setLocalHex(newColor.slice(0, 7).toUpperCase());
    if (hasAlpha) {
      setLocalAlpha(Math.round(chroma(newColor).alpha() * 100));
    }
    
    // Use throttled onChange to prevent stuttering
    throttledOnChange(newColor);
    
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setNeedsSnapshot(true);
    }, 500);
  }, [needsSnapshot, takeSnapshot, hasAlpha, throttledOnChange]);


  // Hex input handlers
  const handleHexBlur = useCallback(() => {
    let hex = localHex.slice(0, 7).toUpperCase();
    if (!chroma.valid(hex) || hex.length !== 7) {
      setLocalHex("#FFFFFF");
      handleColorChange("#FFFFFF");
    } else {
      setLocalHex(hex);
      handleColorChange(hex);
    }
  }, [localHex, handleColorChange]);

  const handleHexEnter = useCallback((e) => {
    if (e.key === "Enter") {
      handleHexBlur();
    }
  }, [handleHexBlur]);

  // Alpha input handlers
  const handleAlphaBlur = useCallback(() => {
    const finalColor = chroma(localHex).alpha(localAlpha / 100).css();
    handleColorChange(finalColor);
  }, [localHex, localAlpha, handleColorChange]);

  const handleAlphaKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      alphaInputRef.current?.blur();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      setLocalAlpha(e.target.value);
      const finalColor = chroma(localHex).alpha(e.target.value / 100).css();
      handleColorChange(finalColor);
      isPressing.current = true;
    }
  }, [localHex, handleColorChange]);

  const handleAlphaKeyUp = useCallback(() => {
    isPressing.current = false;
  }, []);

  // Open/close handlers
  const handleOpen = useCallback(() => {
    if (disabled) return;
    
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerRect(rect);
    }
    
    setIsOpen(true);
    setNeedsSnapshot(true);
    onOpenChange?.(true);
  }, [disabled, onOpenChange]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setNeedsSnapshot(false);
    clearTimeout(timeoutRef.current);
    onOpenChange?.(false);
  }, [onOpenChange]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
    toggle: () => isOpen ? handleClose() : handleOpen()
  }), [handleOpen, handleClose, isOpen]);

  // Mouse/touch event handlers (matching ColorSelector pattern)
  const handleMouseDown = useCallback(() => {
    setNeedsSnapshot(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setNeedsSnapshot(false);
    clearTimeout(timeoutRef.current);
  }, []);

  const handleTouchStart = useCallback(() => {
    setNeedsSnapshot(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setNeedsSnapshot(false);
    clearTimeout(timeoutRef.current);
  }, []);

  // Calculate popover position
  const getPopoverStyle = () => {
    const popoverHeight = 280; // Approximate height
    const popoverWidth = 200;
    
    let top, left;
    
    // Use custom position if provided (for slider thumbs)
    if (customPosition) {
      left = customPosition.x - popoverWidth / 2; // Center over thumb
      top = customPosition.y - popoverHeight - 16; // Above thumb with gap
    } 
    // Use trigger rect if available
    else if (triggerRect) {
      top = triggerRect.bottom + window.scrollY + 8;
      left = triggerRect.left + window.scrollX;
      
      // Adjust for placement
      if (placement === 'top') {
        top = triggerRect.top + window.scrollY - popoverHeight - 8;
      } else if (placement === 'right') {
        top = triggerRect.top + window.scrollY;
        left = triggerRect.right + window.scrollX + 8;
      } else if (placement === 'left') {
        top = triggerRect.top + window.scrollY;
        left = triggerRect.left + window.scrollX - popoverWidth - 8;
      }
    }
    // Fallback to center of screen
    else {
      top = window.innerHeight / 2 - popoverHeight / 2;
      left = window.innerWidth / 2 - popoverWidth / 2;
    }
    
    // Keep within viewport (don't go off screen)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left + popoverWidth > viewportWidth - 16) {
      left = viewportWidth - popoverWidth - 16;
    }
    if (left < 16) left = 16;
    
    if (top + popoverHeight > viewportHeight - 16) {
      top = viewportHeight - popoverHeight - 16;
    }
    if (top < 16) top = 16;
    
    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 1000
    };
  };

  // Color picker content (styled like ColorSelector)
  const renderColorPicker = () => (
    <div 
      className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg shadow-xl p-4 space-y-3"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hex Input */}
      <div className="flex items-center border bg-black/5 dark:bg-black/15 px-1 text-[var(--text-secondary)] min-w-0 w-full h-[24px] rounded border-[var(--border-color)]/75">
        <input
          ref={hexInputRef}
          type="text"
          value={localHex}
          onChange={(e) => {
            setLocalHex(e.target.value);
          }}
          onBlur={handleHexBlur}
          onKeyDown={handleHexEnter}
          className={`flex-1 min-w-0 ${isMobile ? "px-1 py-1" : "px-2 py-2"} bg-transparent outline-none text-xs`}
        />
        {hasAlpha && (
          <>
            <div className="w-px h-5 bg-[var(--border-color)]" />
            <div className="flex items-center px-2 font-light text-xs">
              <input
                ref={alphaInputRef}
                type="number"
                min="0"
                max="100"
                value={localAlpha}
                onChange={(e) => {
                  setLocalAlpha(e.target.value);
                }}
                onClick={() => {
                  isPressing.current = false;
                }}
                onBlur={handleAlphaBlur}
                onKeyDown={handleAlphaKeyDown}
                onKeyUp={handleAlphaKeyUp}
                className="w-5 outline-none"
              />
              <span className="ml-1 ">%</span>
            </div>
          </>
        )}
      </div>
      
      {/* Color Picker */}
      {hasAlpha ? (
        <HexAlphaColorPicker
          color={localValue}
          onChange={handleColorChange}
          className="!w-full"
        />
      ) : (
        <HexColorPicker
          color={hexValue}
          onChange={handleColorChange}
          className="!w-full"
        />
      )}
      
      
      {/* Preset Colors */}
      {presets.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm text-[var(--text-secondary)]">Active Colors</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handleColorChange(preset)}
                className="w-6 h-6 rounded border border-[var(--border-color)] hover:scale-110 transition-transform"
                style={{ backgroundColor: preset }}
                title={preset}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Inline mode - render picker directly
  if (mode === 'inline') {
    return (
      <div className={className}>
        {renderColorPicker()}
      </div>
    );
  }

  // Trigger mode - custom trigger element
  const triggerElement = trigger || children || (
    <div
      className="w-6 h-6 rounded border border-[var(--border-color)] cursor-pointer hover:scale-110 transition-transform"
      style={{ backgroundColor: hexValue }}
    />
  );

  return (
    <>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className={`${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      >
        {triggerElement}
      </div>
      
      {/* Popover */}
      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={handleClose}
          />
          
          {/* Popover Content */}
          <div
            ref={popoverRef}
            style={getPopoverStyle()}
          >
            {renderColorPicker()}
          </div>
        </>,
        document.body
      )}
    </>
  );
});

export default ColorPicker;
