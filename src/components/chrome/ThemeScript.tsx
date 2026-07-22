/**
 * Runs before first paint so the page never flashes light and then snaps to
 * dark. It has to be an inline string in <head>: a React effect runs after
 * hydration, which is exactly one paint too late.
 *
 * Keys are duplicated from `@/constants/theme` on purpose — this executes
 * before any module graph exists, so it cannot import them.
 */
const ThemeScript = () => (
  <script
    // Fixed literal, no interpolation and no user-supplied data.
    dangerouslySetInnerHTML={{
      __html: `(function(){try{var s=localStorage.getItem("senbon-theme");var d=s==="dark"||(s===null&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
    }}
  />
);

export default ThemeScript;
