import Link from "next/link";

export const metadata = {
  title: "Constellation Grove",
  description: "A hidden conservatory unlocked via Konami code.",
};

const ConstellationGrove = () => {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-20">
      <section className="zen-card px-10 py-12">
        <p className="text-xs uppercase tracking-[0.35em] text-zen-gold/60">
          Secret Conservatory
        </p>
        <h1 className="mt-4 font-display text-4xl">
          Senbon Constellation Grove
        </h1>
        <p className="mt-4 text-zen-mist/80">
          Welcome to the hidden section. This is where we document
          in-progress features, UI experiments, and technical notes. This
          content doesn't appear in the main navigation.
        </p>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <article className="zen-card px-8 py-8">
          <h2 className="font-display text-2xl">Particle Effects</h2>
          <p className="mt-3 text-sm text-zen-mist/80">
            Particle animations respond to pointer position and time-based effects.
            To customize them, edit `components/particles/ParticleBackground.tsx`.
          </p>
        </article>
        <article className="zen-card px-8 py-8">
          <h2 className="font-display text-2xl">Guestbook Schema</h2>
          <p className="mt-3 text-sm text-zen-mist/80">
            Neon table lives in `guestbook_entries`. Pending entries are highlighted
            in the admin view with Framer Motion animations.
          </p>
        </article>
      </section>
      <Link
        href="/"
        className="mx-auto inline-flex items-center gap-2 rounded-full border border-zen-gold/40 px-6 py-3 text-zen-gold"
      >
        Return to the main garden ↗
      </Link>
    </div>
  );
};

export default ConstellationGrove;

