// A simple hashing function to turn a string into a number.
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// A palette of visually pleasing, distinct colors.
const COLOR_PALETTE = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
];

/**
 * Generates a consistent hex color from a string input (e.g., a group ID).
 * @param id The string ID to generate a color for.
 * @returns A hex color string from the predefined palette.
 */
export const getGroupColorHex = (id: string): string => {
  if (!id) {
    return '#6b7280'; // gray-500 for fallback
  }
  const hash = simpleHash(id);
  const index = hash % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
};