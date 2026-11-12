/**
 * Vibers Admin UI foundation.
 *
 * These values are intentionally framework-agnostic so Next.js, Rails and
 * React Native adapters can share the same hierarchy without sharing DOM.
 * Aceternity components are selected per surface; this file is the stable
 * contract for spacing, color, radius and elevation.
 */
export declare const vibersAdminTokens: {
    readonly theme: 'aceternity';
    readonly colors: {
        readonly canvas: '#f7f8fa';
        readonly surface: '#ffffff';
        readonly surfaceMuted: '#f1f3f5';
        readonly border: '#e6e8eb';
        readonly text: '#17191c';
        readonly textMuted: '#69707a';
        readonly textSubtle: '#9aa1aa';
        readonly accent: '#111827';
        readonly accentSoft: '#eef1f5';
        readonly success: '#0a9f6e';
        readonly warning: '#c98200';
        readonly danger: '#d9485f';
        readonly focus: '#2563eb';
    };
    readonly layout: {
        readonly sidebarWidth: 248;
        readonly sidebarCollapsedWidth: 72;
        readonly topbarHeight: 64;
        readonly rightRailWidth: 296;
        readonly contentMaxWidth: 1440;
        readonly pagePadding: 32;
        readonly pagePaddingMobile: 16;
        readonly cardGap: 16;
    };
    readonly radius: {
        readonly sm: 10;
        readonly md: 14;
        readonly lg: 18;
        readonly pill: 999;
    };
    readonly shadow: {
        readonly card: '0 1px 2px rgba(17, 24, 39, 0.04), 0 8px 24px rgba(17, 24, 39, 0.05)';
        readonly popover: '0 12px 36px rgba(17, 24, 39, 0.14)';
    };
    readonly motion: {
        readonly fast: '140ms ease';
        readonly normal: '220ms ease';
        readonly slow: '360ms cubic-bezier(0.22, 1, 0.36, 1)';
    };
};
export type VibersAdminTokens = typeof vibersAdminTokens;
//# sourceMappingURL=tokens.d.ts.map