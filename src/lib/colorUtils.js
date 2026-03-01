// Convert hex to RGB string like "180 130 40"
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '180 130 40';
};

// Generate lighter and darker versions
const adjustColor = (hex, amount) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '180 130 40';
  const r = Math.min(255, Math.max(0, parseInt(result[1], 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(result[2], 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(result[3], 16) + amount));
  return `${r} ${g} ${b}`;
};

// Apply color to CSS variables globally
export const applyPrimaryColor = (hex) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', hexToRgb(hex));
  root.style.setProperty('--primary-light', adjustColor(hex, 32));
  root.style.setProperty('--primary-dark', adjustColor(hex, -30));
};
