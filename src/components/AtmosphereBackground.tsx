/**
 * Ambient background.
 *
 * - Warm base + drifting gradient mesh sets the mood.
 * - Three SVG aurora ribbons in the upper field flow sideways at different
 *   speeds and blend-screen for layered color.
 * - A two-wave river at the bottom drifts horizontally — gives the page a
 *   slow, calm pulse without canvas.
 * - Grain and vignette finish the depth.
 *
 * All animation is pure CSS, GPU transforms only. `prefers-reduced-motion`
 * disables motion globally (see globals.css).
 */
const AtmosphereBackground = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
  >
    <div className="atmosphere-base" />
    <div className="atmosphere-mesh" />

    {/* Aurora ribbons (top) */}
    <div className="atmosphere-aurora-wrap">
      <svg
        className="atmosphere-ribbon ribbon-gold"
        viewBox="0 0 600 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="rg-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(230,194,129,0)" />
            <stop offset="50%" stopColor="rgba(230,194,129,0.85)" />
            <stop offset="100%" stopColor="rgba(230,194,129,0)" />
          </linearGradient>
        </defs>
        <path
          d="M0,50 C100,15 200,85 300,50 C400,15 500,85 600,50 L600,100 L0,100 Z"
          fill="url(#rg-gold)"
        />
      </svg>

      <svg
        className="atmosphere-ribbon ribbon-rose"
        viewBox="0 0 600 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="rg-rose" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(200,153,147,0)" />
            <stop offset="50%" stopColor="rgba(200,153,147,0.7)" />
            <stop offset="100%" stopColor="rgba(200,153,147,0)" />
          </linearGradient>
        </defs>
        <path
          d="M0,55 C100,90 200,20 300,55 C400,90 500,20 600,55 L600,100 L0,100 Z"
          fill="url(#rg-rose)"
        />
      </svg>

      <svg
        className="atmosphere-ribbon ribbon-sage"
        viewBox="0 0 600 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="rg-sage" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(122,153,137,0)" />
            <stop offset="50%" stopColor="rgba(122,153,137,0.65)" />
            <stop offset="100%" stopColor="rgba(122,153,137,0)" />
          </linearGradient>
        </defs>
        <path
          d="M0,45 C150,75 250,15 400,45 C500,65 550,30 600,45 L600,100 L0,100 Z"
          fill="url(#rg-sage)"
        />
      </svg>
    </div>

    {/* River waves (bottom) */}
    <div className="atmosphere-river">
      <svg
        className="atmosphere-wave wave-back"
        viewBox="0 0 600 80"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="wave-back-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(217,168,107,0)" />
            <stop offset="100%" stopColor="rgba(217,168,107,0.55)" />
          </linearGradient>
        </defs>
        <path
          d="M0,40 C100,10 200,70 300,40 C400,10 500,70 600,40 L600,80 L0,80 Z"
          fill="url(#wave-back-grad)"
        />
      </svg>

      <svg
        className="atmosphere-wave wave-front"
        viewBox="0 0 600 80"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="wave-front-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(122,153,137,0)" />
            <stop offset="100%" stopColor="rgba(122,153,137,0.6)" />
          </linearGradient>
        </defs>
        <path
          d="M0,45 C100,75 200,15 300,45 C400,75 500,15 600,45 L600,80 L0,80 Z"
          fill="url(#wave-front-grad)"
        />
      </svg>
    </div>

    <div className="atmosphere-grain" />
    <div className="atmosphere-vignette" />
  </div>
);

export default AtmosphereBackground;
