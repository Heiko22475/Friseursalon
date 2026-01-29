// =====================================================
// COLOR GENERATOR
// Generate harmonious color palettes using color theory
// =====================================================

import { hexToHsl, hslToHex } from './color-utils';

export type HarmonyType = 
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'
  | 'random';

// ===== BASE COLOR GENERATION =====

/**
 * Generates a random base hue (0-360)
 */
function randomHue(): number {
  return Math.floor(Math.random() * 360);
}

/**
 * Generates a random saturation value
 * Prefers mid-range saturation (40-80%) for more pleasant colors
 */
function randomSaturation(min: number = 40, max: number = 80): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Generates a random lightness value
 * Prefers mid-range lightness (40-70%) for better readability
 */
function randomLightness(min: number = 40, max: number = 70): number {
  return Math.floor(Math.random() * (max - min) + min);
}

// ===== HARMONY ALGORITHMS =====

/**
 * Monochromatic: Same hue, different saturation and lightness
 */
function generateMonochromatic(baseHue?: number): string[] {
  const hue = baseHue ?? randomHue();
  
  return [
    hslToHex(hue, randomSaturation(60, 80), randomLightness(45, 55)),
    hslToHex(hue, randomSaturation(50, 70), randomLightness(55, 65)),
    hslToHex(hue, randomSaturation(40, 60), randomLightness(65, 75)),
    hslToHex(hue, randomSaturation(30, 50), randomLightness(75, 85)),
    hslToHex(hue, randomSaturation(15, 30), randomLightness(85, 95)),
  ];
}

/**
 * Analogous: Colors adjacent on the color wheel (30-60 degrees apart)
 */
function generateAnalogous(baseHue?: number): string[] {
  const hue = baseHue ?? randomHue();
  const satBase = randomSaturation(50, 80);
  const lightBase = randomLightness(45, 65);
  
  return [
    hslToHex(hue, satBase, lightBase),
    hslToHex((hue + 30) % 360, satBase - 10, lightBase + 10),
    hslToHex((hue + 60) % 360, satBase - 20, lightBase + 5),
    hslToHex((hue - 30 + 360) % 360, satBase - 5, lightBase + 15),
    hslToHex(hue, satBase - 40, lightBase + 30), // Neutral for balance
  ];
}

/**
 * Complementary: Colors opposite on the color wheel (180 degrees)
 */
function generateComplementary(baseHue?: number): string[] {
  const hue = baseHue ?? randomHue();
  const complementHue = (hue + 180) % 360;
  const satBase = randomSaturation(50, 80);
  const lightBase = randomLightness(45, 65);
  
  return [
    hslToHex(hue, satBase, lightBase),
    hslToHex(hue, satBase - 15, lightBase + 15),
    hslToHex(complementHue, satBase, lightBase),
    hslToHex(complementHue, satBase - 15, lightBase + 15),
    hslToHex(hue, satBase - 50, lightBase + 30), // Neutral
  ];
}

/**
 * Triadic: Three colors evenly spaced on color wheel (120 degrees)
 */
function generateTriadic(baseHue?: number): string[] {
  const hue = baseHue ?? randomHue();
  const satBase = randomSaturation(50, 75);
  const lightBase = randomLightness(45, 65);
  
  return [
    hslToHex(hue, satBase, lightBase),
    hslToHex((hue + 120) % 360, satBase, lightBase + 5),
    hslToHex((hue + 240) % 360, satBase, lightBase - 5),
    hslToHex(hue, satBase - 20, lightBase + 20),
    hslToHex(hue, satBase - 55, lightBase + 35), // Neutral
  ];
}

/**
 * Tetradic: Four colors in two complementary pairs (90 degrees)
 */
function generateTetradic(baseHue?: number): string[] {
  const hue = baseHue ?? randomHue();
  const satBase = randomSaturation(50, 75);
  const lightBase = randomLightness(45, 65);
  
  return [
    hslToHex(hue, satBase, lightBase),
    hslToHex((hue + 90) % 360, satBase - 10, lightBase + 5),
    hslToHex((hue + 180) % 360, satBase - 15, lightBase + 10),
    hslToHex((hue + 270) % 360, satBase - 20, lightBase + 15),
    hslToHex(hue, satBase - 50, lightBase + 30), // Neutral
  ];
}

/**
 * Split-Complementary: Base color + two colors adjacent to complement
 */
function generateSplitComplementary(baseHue?: number): string[] {
  const hue = baseHue ?? randomHue();
  const complementHue = (hue + 180) % 360;
  const satBase = randomSaturation(50, 80);
  const lightBase = randomLightness(45, 65);
  
  return [
    hslToHex(hue, satBase, lightBase),
    hslToHex((complementHue - 30 + 360) % 360, satBase - 10, lightBase + 5),
    hslToHex((complementHue + 30) % 360, satBase - 15, lightBase + 10),
    hslToHex(hue, satBase - 20, lightBase + 20),
    hslToHex(hue, satBase - 50, lightBase + 35), // Neutral
  ];
}

/**
 * Random vibrant: Completely random colors with good saturation/lightness
 */
function generateRandom(): string[] {
  return [
    hslToHex(randomHue(), randomSaturation(60, 85), randomLightness(45, 60)),
    hslToHex(randomHue(), randomSaturation(55, 80), randomLightness(50, 65)),
    hslToHex(randomHue(), randomSaturation(50, 75), randomLightness(55, 70)),
    hslToHex(randomHue(), randomSaturation(45, 70), randomLightness(60, 75)),
    hslToHex(randomHue(), randomSaturation(20, 40), randomLightness(80, 95)), // Light neutral
  ];
}

// ===== MAIN GENERATOR =====

/**
 * Generates a palette of 5 colors using specified harmony type
 */
export function generatePalette(harmonyType?: HarmonyType, baseHue?: number): string[] {
  const type = harmonyType || selectRandomHarmonyType();
  
  switch (type) {
    case 'monochromatic':
      return generateMonochromatic(baseHue);
    case 'analogous':
      return generateAnalogous(baseHue);
    case 'complementary':
      return generateComplementary(baseHue);
    case 'triadic':
      return generateTriadic(baseHue);
    case 'tetradic':
      return generateTetradic(baseHue);
    case 'split-complementary':
      return generateSplitComplementary(baseHue);
    case 'random':
      return generateRandom();
    default:
      return generateAnalogous(baseHue);
  }
}

/**
 * Randomly selects a harmony type
 * Weights favor more harmonious combinations
 */
function selectRandomHarmonyType(): HarmonyType {
  const weights = [
    { type: 'analogous', weight: 30 },
    { type: 'complementary', weight: 20 },
    { type: 'triadic', weight: 15 },
    { type: 'split-complementary', weight: 15 },
    { type: 'monochromatic', weight: 10 },
    { type: 'tetradic', weight: 5 },
    { type: 'random', weight: 5 },
  ] as const;
  
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const { type, weight } of weights) {
    random -= weight;
    if (random <= 0) {
      return type;
    }
  }
  
  return 'analogous';
}

/**
 * Generates a palette with a specific base color
 * Useful for generating variations of existing palettes
 */
export function generatePaletteFromColor(hexColor: string, harmonyType?: HarmonyType): string[] {
  const hsl = hexToHsl(hexColor);
  return generatePalette(harmonyType, hsl.h);
}

/**
 * Lock specific colors and regenerate the rest
 */
export function regeneratePalette(
  currentPalette: [string, string, string, string, string],
  lockedIndices: number[],
  harmonyType?: HarmonyType
): string[] {
  // If first color is locked, use it as base hue
  const baseHue = lockedIndices.includes(0) 
    ? hexToHsl(currentPalette[0]).h 
    : undefined;
  
  const newPalette = generatePalette(harmonyType, baseHue);
  
  // Restore locked colors
  lockedIndices.forEach(index => {
    if (index >= 0 && index < 5) {
      newPalette[index] = currentPalette[index];
    }
  });
  
  return newPalette;
}

// ===== PALETTE VALIDATION =====

/**
 * Checks if a palette has sufficient contrast and variety
 */
export function validatePalette(palette: string[]): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for duplicate colors
  const uniqueColors = new Set(palette);
  if (uniqueColors.size < palette.length) {
    issues.push('Duplicate colors found');
  }
  
  // Check saturation variety
  const saturations = palette.map(hex => hexToHsl(hex).s);
  const satRange = Math.max(...saturations) - Math.min(...saturations);
  if (satRange < 20) {
    issues.push('Insufficient saturation variety');
  }
  
  // Check lightness variety
  const lightnesses = palette.map(hex => hexToHsl(hex).l);
  const lightRange = Math.max(...lightnesses) - Math.min(...lightnesses);
  if (lightRange < 30) {
    issues.push('Insufficient lightness variety');
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

// ===== PRESETS FROM HARMONY =====

/**
 * Generates a complete palette preset with name and description
 */
export function generatePalettePreset(harmonyType?: HarmonyType): {
  name: string;
  description: string;
  colors: [string, string, string, string, string];
} {
  const type = harmonyType || selectRandomHarmonyType();
  const palette = generatePalette(type);
  
  const typeNames = {
    monochromatic: 'Monochrom',
    analogous: 'Analog',
    complementary: 'Komplementär',
    triadic: 'Triadisch',
    tetradic: 'Tetradisch',
    'split-complementary': 'Split-Komplementär',
    random: 'Zufällig',
  };
  
  const timestamp = Date.now();
  
  return {
    name: `${typeNames[type]} ${timestamp.toString().slice(-6)}`,
    description: `Generiert: ${typeNames[type]} Harmonie`,
    colors: palette as [string, string, string, string, string],
  };
}

// ===== EXPORTS =====

export const COLOR_GENERATOR = {
  generate: generatePalette,
  generateFromColor: generatePaletteFromColor,
  regenerate: regeneratePalette,
  validate: validatePalette,
  generatePreset: generatePalettePreset,
} as const;

export const HARMONY_TYPES: { value: HarmonyType; label: string }[] = [
  { value: 'analogous', label: 'Analog (ähnliche Farben)' },
  { value: 'complementary', label: 'Komplementär (Gegensätze)' },
  { value: 'triadic', label: 'Triadisch (3er Kombination)' },
  { value: 'split-complementary', label: 'Split-Komplementär' },
  { value: 'monochromatic', label: 'Monochrom (eine Farbe)' },
  { value: 'tetradic', label: 'Tetradisch (4er Kombination)' },
  { value: 'random', label: 'Zufällig' },
];
