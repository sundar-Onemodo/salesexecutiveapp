/**
 * App Color Palette
 * Specified Color Codes:
 * Primary Red: #d93030
 * Dark Burgundy: #701414
 * Light Pastel Red: #eb9393
 * Muted Slate Mauve: #877474
 * Border Gray: #bcbcbc
 * Light Mode Theme
 */

export const AppColors = {
  // Required Brand Colors
  primary: '#d93030',         // Vibrant red for CTAs, active elements, highlights
  primaryDark: '#701414',     // Rich deep burgundy for headings, dark badges, high contrast
  primaryLight: '#eb9393',    // Light pastel red for card borders, subtle accents, badge backgrounds
  mutedSlate: '#877474',      // Muted slate gray for secondary text, labels, hints
  border: '#bcbcbc',          // Light neutral gray for borders, dividers, inactive states

  // Light Mode Surfaces & Text
  background: '#FAF8F8',      // Soft warm off-white app background
  card: '#FFFFFF',            // Crisp clean white card surface
  cardSecondary: '#FFF7F7',   // Very light rose tinted card surface
  textPrimary: '#1E1414',     // Dark charcoal text with warm tone
  textSecondary: '#877474',   // Muted slate text
  textMuted: '#A09090',       // Subtle placeholder text
  
  // Status Colors
  success: '#1B873F',         // Forest green for successful transactions
  successLight: '#E8F5E9',    // Light green background
  warning: '#D97706',         // Amber for pending transactions
  warningLight: '#FEF3C7',    // Light amber background
  error: '#d93030',           // Error red
  errorLight: '#FDE8E8',      // Error background tint

  // UI Accents
  white: '#FFFFFF',
  black: '#000000',
  inputBackground: '#FFFFFF',
  inputBorder: '#bcbcbc',
  inputFocusBorder: '#d93030',
  overlay: 'rgba(112, 20, 20, 0.45)',
  shadow: '#701414',
  ripple: 'rgba(217, 48, 48, 0.1)',
} as const;

export type AppColorKey = keyof typeof AppColors;
