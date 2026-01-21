// Color utilities for contrast and logo handling
const clamp = (value) => Math.max(0, Math.min(value, 255));

const hexToRgb = (hex) => {
  if (!hex || typeof hex !== "string") return { r: 255, g: 255, b: 255 };
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized.padEnd(6, "f").slice(0, 6);
  const intVal = parseInt(value, 16);
  return {
    r: clamp((intVal >> 16) & 255),
    g: clamp((intVal >> 8) & 255),
    b: clamp(intVal & 255),
  };
};

const relativeLuminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export const isLight = (hex) => relativeLuminance(hex) > 0.45;

export const autoTextColor = (bg, light = "#ffffff", dark = "#111111") =>
  isLight(bg) ? dark : light;

export const autoBorderColor = (bg) => (isLight(bg) ? "#d1d5db" : "#1f2937");

export const logoFilter = (bg) =>
  isLight(bg) ? "none" : "brightness(0) invert(1)";

export const formatHex = (value) => {
  if (!value) return "";
  const cleaned = value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
  if (!cleaned) return "";
  return "#" + cleaned.padEnd(6, cleaned[cleaned.length - 1] || "0");
};
