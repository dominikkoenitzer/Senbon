/// <reference types="react/canary" />

/*
 * `<ViewTransition>` is a canary-channel React API. It is not in the stable
 * `@types/react` surface and it is not in the installed `react` package at
 * runtime either — with `experimental.viewTransition` enabled in
 * next.config.ts, Next aliases React to its own bundled experimental build
 * (`next/dist/compiled/react-experimental`), which does export it.
 *
 * This reference makes the type visible without adding a `types` array to
 * tsconfig.json, which would otherwise switch off automatic @types discovery
 * for everything else.
 */

export {};
