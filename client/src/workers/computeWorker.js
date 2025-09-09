// Web Worker for heavy computations
// Handles image processing, color calculations, and QR operations

// Import chroma for color operations
importScripts('https://cdn.jsdelivr.net/npm/chroma-js@2.4.2/chroma.min.js');

self.onmessage = function(e) {
  const { type, data } = e.data;
  
  try {
    switch (type) {
      case 'IMAGE_DOWNSCALE':
        handleImageDownscale(data);
        break;
      case 'PALETTE_GENERATION':
        handlePaletteGeneration(data);
        break;
      case 'QR_PATH_EXTRACTION':
        handleQRPathExtraction(data);
        break;
      default:
        self.postMessage({ error: `Unknown task type: ${type}` });
    }
  } catch (error) {
    self.postMessage({ error: error.message, type });
  }
};

function handleImageDownscale({ imageData, maxWidth, maxHeight, quality = 0.8 }) {
  const canvas = new OffscreenCanvas(maxWidth, maxHeight);
  const ctx = canvas.getContext('2d');
  
  // Create image from data
  const img = new Image();
  img.onload = () => {
    // Calculate new dimensions maintaining aspect ratio
    const { width, height } = img;
    const aspectRatio = width / height;
    
    let newWidth = maxWidth;
    let newHeight = maxHeight;
    
    if (aspectRatio > 1) {
      newHeight = maxWidth / aspectRatio;
    } else {
      newWidth = maxHeight * aspectRatio;
    }
    
    // Draw scaled image
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    
    // Convert to blob
    canvas.convertToBlob({ type: 'image/jpeg', quality }).then(blob => {
      const reader = new FileReader();
      reader.onload = () => {
        self.postMessage({
          type: 'IMAGE_DOWNSCALE_RESULT',
          data: {
            dataURL: reader.result,
            width: newWidth,
            height: newHeight,
            originalWidth: width,
            originalHeight: height
          }
        });
      };
      reader.readAsDataURL(blob);
    });
  };
  
  img.src = imageData;
}

function handlePaletteGeneration({ colors, count = 5 }) {
  try {
    const validColors = colors.filter(color => chroma.valid(color));
    if (validColors.length === 0) {
      self.postMessage({
        type: 'PALETTE_GENERATION_RESULT',
        data: { palette: colors.slice(0, count) }
      });
      return;
    }
    
    const palette = chroma.scale(validColors).mode("lch").colors(count);
    
    self.postMessage({
      type: 'PALETTE_GENERATION_RESULT',
      data: { palette }
    });
  } catch (error) {
    self.postMessage({
      type: 'PALETTE_GENERATION_RESULT',
      data: { palette: colors.slice(0, count) }
    });
  }
}

function handleQRPathExtraction({ svgString }) {
  try {
    // Parse SVG and extract paths
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const paths = svgDoc.querySelectorAll('path');
    
    const pathData = Array.from(paths).map(path => ({
      d: path.getAttribute('d'),
      fill: path.getAttribute('fill'),
      stroke: path.getAttribute('stroke')
    }));
    
    self.postMessage({
      type: 'QR_PATH_EXTRACTION_RESULT',
      data: { paths: pathData }
    });
  } catch (error) {
    self.postMessage({
      type: 'QR_PATH_EXTRACTION_RESULT',
      data: { paths: [], error: error.message }
    });
  }
}
