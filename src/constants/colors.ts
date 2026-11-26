/**
 * App Color Palette - "Executive Cobalt & Emerald Ledger"
 * Specifically engineered for Onemodo Sales Executive Financial App:
 *
 * 1. Dominant / Primary Action: #1A56DB (Precision Cobalt Blue - trusted financial CTA)
 * 2. Surface / Typography:      #0B1527 (Midnight Slate Navy - maximum contrast & elegance)
 * 3. Success / Liquidity:       #059669 (Emerald Green - healthy credit & completed collections)
 * 4. Utilization / Alert:       #D97706 (Amber Gold - outstanding credit & alerts)
 * 5. Ice Tint / Accents:        #EFF6FF (Cobalt Ice - active chips, badges, and avatar fills)
 */

export const AppColors = {
  // Core Brand Swatches
  dominant: '#1A56DB',        // Precision Cobalt Blue (Primary buttons, active tabs, available credit)
  surface: '#0B1527',         // Midnight Slate Navy (Headings, executive titles, high contrast)
  successGreen: '#059669',    // Emerald Green (Healthy credit, confirmed payments, active status)
  warningAmber: '#D97706',    // Amber Gold (Used credit, pending transactions, threshold warnings)
  cobaltIce: '#EFF6FF',       // Cobalt Ice Tint (Active pills, badge backgrounds, input focus)

  // Primary Role Assignments
  primary: '#1A56DB',
  primaryDark: '#0B1527',
  primaryLight: '#EFF6FF',
  primaryBorder: '#BFDBFE',

  // Semantic Status
  success: '#059669',
  successLight: '#ECFDF5',
  successBorder: '#A7F3D0',

  warning: '#D97706',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',

  error: '#EF4444',
  errorLight: '#FEF2F2',
  errorBorder: '#FECACA',

  // Neutral Scales (Light Mode)
  background: '#F8FAFC',      // Crisp light slate canvas
  card: '#FFFFFF',            // Pure crisp white card surface
  cardSecondary: '#F1F5F9',   // Light slate surface for nested containers
  cardHover: '#F8FAFD',       // Subtle hover/press tint

  textPrimary: '#0B1527',     // Deep midnight text
  textSecondary: '#475569',   // Slate-600 readable secondary text
  textMuted: '#94A3B8',       // Slate-400 placeholder text
  mutedSlate: '#64748B',      // Refined slate for meta labels

  border: '#E2E8F0',          // Slate-200 clean divider/card border
  borderMuted: '#F1F5F9',     // Slate-100 subtle inner divider

  // Common UI Accents
  white: '#FFFFFF',
  black: '#000000',
  inputBackground: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputFocusBorder: '#1A56DB',
  overlay: 'rgba(11, 21, 39, 0.45)',
  shadow: '#0B1527',
  ripple: 'rgba(26, 86, 219, 0.12)',

  // Legacy compatibility keys
  ink: '#D97706',
  accent: '#059669',
  detail: '#64748B',
  iceBlue: '#EFF6FF',
  aquaTeal: '#059669',
  tealLight: '#ECFDF5',
  roseLight: '#FFFBEB',
  aquaLight: '#ECFDF5',
  pinkLight: '#FFFBEB',
  primaryTint: '#F8FAFC',
} as const;

export type AppColorKey = keyof typeof AppColors;
