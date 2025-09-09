import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { createPortal } from 'react-dom';
import chroma from 'chroma-js';
import { useDevice } from '../contexts/DeviceContext';

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
  const { takeSnapshot } = useDevice();
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [needsSnapshot, setNeedsSnapshot] = useState(false);
  const [triggerRect, setTriggerRect] = useState(null);
  
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Parse color value
  const colorObj = chroma.valid(value) ? chroma(value) : chroma('#ffffff');
  const hexValue = colorObj.hex();
  const alphaValue = Math.round(colorObj.alpha() * 100);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle color change with snapshot system (matching ColorSelector pattern)
  const handleColorChange = useCallback((newColor) => {
    if (!chroma.valid(newColor)) return;
    
    if (needsSnapshot) {
      takeSnapshot("Change color");
      setNeedsSnapshot(false);
    }
    
    const finalColor = hasAlpha ? chroma(newColor).alpha(alphaValue / 100).css() : newColor;
    setLocalValue(finalColor);
    onChange?.(finalColor);
    
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setNeedsSnapshot(true);
    }, 500);
  }, [needsSnapshot, takeSnapshot, hasAlpha, alphaValue, onChange]);

  // Handle alpha change
  const handleAlphaChange = useCallback((newAlpha) => {
    const finalColor = chroma(hexValue).alpha(newAlpha / 100).css();
    setLocalValue(finalColor);
    onChange?.(finalColor);
  }, [hexValue, onChange]);

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
      <input
        value={hexValue}
        onChange={(e) => {
          let newValue = e.target.value.toUpperCase();
          if (newValue && !newValue.startsWith('#')) {
            newValue = '#' + newValue;
          }
          newValue = newValue.replace(/[^#0-9A-F]/gi, '');
          if (chroma.valid(newValue) && newValue.length === 7) {
            handleColorChange(newValue);
          }
        }}
        className="p-1 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-200/75 text-sm rounded-sm px-[15px] w-full"
        placeholder="#ffffff"
        maxLength={7}
      />
      
      {/* Color Picker */}
      <HexColorPicker
        color={hexValue}
        onChange={handleColorChange}
        className="!w-full"
      />
      
      {/* Alpha Slider */}
      {hasAlpha && (
        <div className="space-y-2">
          <label className="text-sm text-[var(--text-secondary)]">Opacity: {alphaValue}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={alphaValue}
            onChange={(e) => handleAlphaChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}
      
      {/* Preset Colors */}
      {presets.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm text-[var(--text-secondary)]">Presets</label>
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
