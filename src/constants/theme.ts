/**
 * Theme configuration enforcing light mode with brand palette:
 * #d93030, #701414, #eb9393, #877474, #bcbcbc
 */

import '@/global.css';

import { Platform } from 'react-native';
import { AppColors } from './colors';

export const Colors = {
  light: {
    text: AppColors.textPrimary,
    background: AppColors.background,
    backgroundElement: AppColors.cardSecondary,
    backgroundSelected: '#FDECEC',
    textSecondary: AppColors.mutedSlate,
    primary: AppColors.primary,
    primaryDark: AppColors.primaryDark,
    primaryLight: AppColors.primaryLight,
    border: AppColors.border,
  },
  // In light mode app, dark falls back to light
  dark: {
    text: AppColors.textPrimary,
    background: AppColors.background,
    backgroundElement: AppColors.cardSecondary,
    backgroundSelected: '#FDECEC',
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
