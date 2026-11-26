/**
 * Theme configuration enforcing light mode with brand palette:
 * "Executive Cobalt & Emerald Ledger"
 * Primary: #1A56DB (Precision Cobalt Blue)
 * Surface: #0B1527 (Midnight Slate Navy)
 * Success: #059669 (Emerald Green)
 * Warning: #D97706 (Amber Gold)
 * Ice:     #EFF6FF (Cobalt Ice Tint)
 */

import '@/global.css';

import { Platform } from 'react-native';
import { AppColors } from './colors';

export const Colors = {
  light: {
    text: AppColors.textPrimary,
    background: AppColors.background,
    backgroundElement: AppColors.cardSecondary,
    backgroundSelected: AppColors.primaryLight,
    textSecondary: AppColors.mutedSlate,
    primary: AppColors.primary,
    primaryDark: AppColors.primaryDark,
    primaryLight: AppColors.primaryLight,
    border: AppColors.border,
  },
  dark: {
    text: AppColors.textPrimary,
    background: AppColors.background,
    backgroundElement: AppColors.cardSecondary,
    backgroundSelected: AppColors.primaryLight,
    textSecondary: AppColors.mutedSlate,
    primary: AppColors.primary,
    primaryDark: AppColors.primaryDark,
    primaryLight: AppColors.primaryLight,
    border: AppColors.border,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
