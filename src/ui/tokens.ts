/**
 * Vibers Admin UI foundation.
 *
 * These values are intentionally framework-agnostic so Next.js, Rails and
 * React Native adapters can share the same hierarchy without sharing DOM.
 * Aceternity components are selected per surface; this file is the stable
 * contract for spacing, color, radius and elevation.
 */
export const vibersAdminTokens = {
  theme: 'aceternity',
  colors: {
    canvas: '#f7f8fa',
    surface: '#ffffff',
    surfaceMuted: '#f1f3f5',
    border: '#e6e8eb',
    text: '#17191c',
    textMuted: '#69707a',
    textSubtle: '#9aa1aa',
    accent: '#111827',
    accentSoft: '#eef1f5',
    success: '#0a9f6e',
    warning: '#c98200',
    danger: '#d9485f',
    focus: '#2563eb',
  },
  layout: {
    sidebarWidth: 248,
    sidebarCollapsedWidth: 72,
    topbarHeight: 64,
    rightRailWidth: 296,
    contentMaxWidth: 1440,
    pagePadding: 32,
    pagePaddingMobile: 16,
    cardGap: 16,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    pill: 999,
  },
  shadow: {
    card: '0 1px 2px rgba(17, 24, 39, 0.04), 0 8px 24px rgba(17, 24, 39, 0.05)',
    popover: '0 12px 36px rgba(17, 24, 39, 0.14)',
  },
  motion: {
    fast: '140ms ease',
    normal: '220ms ease',
    slow: '360ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
} as const;

export type VibersAdminTokens = typeof vibersAdminTokens;
