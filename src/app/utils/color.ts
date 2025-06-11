/**
 * Generate distinct blue-ish colors in HSL format based on index and total count.
 *
 * @param index - The position of the item.
 * @param total - Total number of items.
 * @param options - Optional hue/saturation/lightness settings.
 * @returns HSL color string like "hsl(220, 85%, 60%)"
 */
export const generateBlueColor = (
  index: number,
  total: number,
  options?: {
    hueStart?: number;
    hueEnd?: number;
    saturation?: number;
    lightness?: number;
    loop?: boolean;
  }
): string => {
  const {
    hueStart = 200,
    hueEnd = 240,
    saturation = 85,
    lightness = 60,
    loop = false,
  } = options || {};

  const safeTotal = Math.max(total, 1);
  const cappedIndex = loop ? index % safeTotal : Math.min(index, safeTotal - 1);
  const hueStep = (hueEnd - hueStart) / Math.max(safeTotal - 1, 1);
  const hue = hueStart + hueStep * cappedIndex;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};


// Eaxple
// generateBlueColor(0, 5); // "hsl(200, 85%, 60%)"
// generateBlueColor(4, 5); // "hsl(240, 85%, 60%)"
// generateBlueColor(5, 5, { loop: true }); // "hsl(200, 85%, 60%)"
// generateBlueColor(3, 5, { hueStart: 210, hueEnd: 270 }); // custom range