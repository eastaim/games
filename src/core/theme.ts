import { readString, writeString } from './storage';

/**
 * Theme preference.
 *
 * `system` is a real state, not the absence of one: it keeps following the OS
 * as it changes rather than freezing whatever the OS said on first visit.
 */
export type ThemePref = 'system' | 'light' | 'dark';

const THEME_KEY = 'portal.theme';
const ORDER: readonly ThemePref[] = ['system', 'light', 'dark'];

export function normalizeThemePref(value: string | null): ThemePref {
  return ORDER.includes(value as ThemePref) ? (value as ThemePref) : 'system';
}

export function nextThemePref(current: ThemePref): ThemePref {
  return ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
}

export function readThemePref(): ThemePref {
  return normalizeThemePref(readString(THEME_KEY));
}

export function saveThemePref(pref: ThemePref): void {
  writeString(THEME_KEY, pref);
}

export const THEME_LABELS: Readonly<Record<ThemePref, string>> = {
  system: '시스템',
  light: '라이트',
  dark: '다크',
};
