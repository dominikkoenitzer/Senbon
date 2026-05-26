import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  /** Pass `true` on the page above the fold for LCP priority. */
  priority?: boolean;
};

const PostHero = ({ src, alt, priority = false }: Props) => (
  <figure className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-foreground/10 bg-foreground/[0.02]">
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 768px, 100vw"
      priority={priority}
      className="object-cover"
    />
    {/* Subtle bottom shadow so dark text sits readable when overlaid */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
    />
  </figure>
);

export default PostHero;
