import chroma from 'chroma-js';
export const rgbToHex = (rgb) => {
  if (typeof rgb !== 'string' || !rgb.startsWith('rgb')) return rgb;
  const match = rgb.match(/\d+/g);
  if (!match) return rgb;
  return `#${match.map(num => parseInt(num).toString(16).padStart(2, '0')).join('')}`;
};
export const generateColorPalette = (colors, count = 5) => {
  try {
    const validColors = colors.filter(color => chroma.valid(color));
    if (validColors.length === 0) return [];
    return chroma.scale(validColors).mode("lch").colors(count);
  } catch (error) {
    console.warn('Error generating color palette:', error);
    return colors.slice(0, count);
  }
};
export const isValidColor = (color) => {
  return chroma.valid(color);
};