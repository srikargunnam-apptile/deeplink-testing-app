/**
 * themeConstants.tsx
 * ------------------------------------------------------------------
 * One flat object that mirrors what the editor's Theme left panel
 * (tile-web-v2/src/client/components/EditorV2/ThemePanel.tsx) edits.
 * The runtime ThemeProvider reads from this and lets consumers fetch
 * values by dot-path, e.g. `theme('colors.primary')`.
 *
 * Every color slot stores both modes; ThemeProvider picks light or
 * dark based on `effectiveTheme`. Typography slots aren't dual-mode.
 * ------------------------------------------------------------------
 */

export type Mode = 'light' | 'dark';

/** A color slot — one hex per mode. */
export interface Dual { light: string; dark: string; }

export const THEME = {
  colors: {
    // brand
    primary:     { light: '#1060E0', dark: '#5A93F0' },
    secondary:   { light: '#185490', dark: '#3A8ED0' },
    accent:      { light: '#185409', dark: '#6AB4F0' },
    // surface
    background:  { light: '#FFFFFF', dark: '#131313' },
    surface:     { light: '#F6F6F6', dark: '#1C1C1C' },
    elevated:    { light: '#FCFCFC', dark: '#242424' },
    border:      { light: '#E5E7EB', dark: '#333333' },
    // content
    text:        { light: '#1A1A1A', dark: '#E8E8E8' },
    muted:       { light: '#6B7280', dark: '#AAAAAA' },
    onPrimary:   { light: '#FFFFFF', dark: '#FFFFFF' },
    // status
    success:     { light: '#16A34A', dark: '#4ADE80' },
    warning:     { light: '#D97706', dark: '#FBBF24' },
    destructive: { light: '#DC2626', dark: '#F87171' },
    info:        { light: '#2563EB', dark: '#60A5FA' },
  },
  typography: {
    heading:    { fontFamily: 'System', fontSize: 28, fontWeight: '700', lineHeight: 1.2 },
    subheading: { fontFamily: 'System', fontSize: 20, fontWeight: '600', lineHeight: 1.3 },
    body:       { fontFamily: 'System', fontSize: 16, fontWeight: '400', lineHeight: 1.5 },
    caption:    { fontFamily: 'System', fontSize: 12, fontWeight: '400', lineHeight: 1.4 },
  },
} as const;

export type Theme = typeof THEME;

/** AsyncStorage key the editor writes into when the user saves. */
export const THEME_STORAGE_KEY = '@tile/theme:v1';
