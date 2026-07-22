/**
 * Ambient background.
 *
 * Deliberately three layers: a warm base, a slowly drifting gradient mesh, and
 * a little grain so it reads as paper rather than screen.
 *
 * It used to carry eleven layers — three SVG aurora ribbons, a two-wave river,
 * and a black vignette. That machinery was most of what made the site feel
 * mysterious and watched, which was the opposite of the intent, and it cost a
 * full-screen SVG plus several large blur filters to achieve. Warmth comes from
 * the colour, not from moving parts. Don't add layers back.
 *
 * Nothing here animates. The mesh drifted on a 38s loop until it turned out
 * that a background which never stops moving is just a headache on a page
 * someone came to read.
 */
const AtmosphereBackground = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
  >
    <div className="atmosphere-base" />
    <div className="atmosphere-mesh" />
    <div className="atmosphere-grain" />
  </div>
);

export default AtmosphereBackground;
