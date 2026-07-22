/**
 * Shared between the no-flash <head> script and the toggle. The script runs as
 * a string before React exists, so these two must agree by convention — if you
 * rename either, rename it in `ThemeScript` too.
 */
export const THEME_STORAGE_KEY = "senbon-theme";
export const THEME_EVENT = "senbon:themechange";
