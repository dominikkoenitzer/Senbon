---
title: "Lantern Study 001 — Thousand Needles of Light"
excerpt: "Sketching how senbon (千本) becomes a field of a thousand lantern needles, each storing a fragment of memory."
publishedAt: "2025-11-10"
tags:
  - concept
  - light
  - garden
featured: true
hero: "/images/journal/lanterns.jpg"
---

Senbon means "a thousand" — but not only in the literal sense. In the studio it describes a swarm of quiet moments threaded together like lantern needles. The garden holds light that remembers every conversation.

## The Concept

When I first sketched this project, I saw it as a digital zen garden. Not a recreation of stone and sand, but something that captures the same feeling: **quiet, intentional, alive**.

The name "senbon" (千本) translates to "a thousand" — a thousand lanterns, a thousand moments, a thousand fragments of light that together create something whole.

### Building the Interface

To build that feeling into the interface, I mapped the hero to an asymmetrical grid and let each card glimmer at a slightly different delay. Framer Motion becomes a lantern choreographer, staggering petals and particles so the air never feels stale.

The color palette emerged from observation:

- **Moss green** (`#6a8c69`) — the base, the ground
- **Golden glow** (`#f7d8a0`) — the light, the warmth
- **Mist** (`#f0ebe1`) — the air, the space between
- **Dusk** (`#1a1f2b`) — the depth, the shadows

### Ritual Notes

- Base palette starts with _koke_ (moss) and _akari_ (golden glow); overlays add hints of plum and tidewater blue.
- Every border receives a second inner line, like the double frame around shoji paper, to hint at gentle formality.
- Guestbook ink dries slower than journal ink. Pending entries pulse softly in the moderation view to mimic warm wax.

### The Technical Layer

Underneath the poetry, there's a solid foundation:

```typescript
// Particle system that responds to movement
const particles = useParticles({
  count: 50,
  color: zen.gold,
  speed: 0.5,
  followMouse: true
});
```

Each particle is a tiny lantern, following the cursor like fireflies drawn to warmth.

### The Markdown System

Journal entries live as markdown files in `content/journal/`. Each commit adds a new entry, and the site rebuilds automatically. It's like planting seeds — write, commit, watch it grow.

The frontmatter structure:

```yaml
---
title: "Entry Title"
excerpt: "Short description"
publishedAt: "2025-11-10"
tags:
  - concept
  - light
featured: true
---
```

Simple. Clean. Like the rest of the system.

### What's Next

Next up: translating the "thousand needles" metaphor into a Neon PostgreSQL schema that can scale while staying whisper-soft. I want each guestbook entry to feel handwritten even when it's just JSON gliding through serverless space.

The garden is growing. Each entry is a new lantern, casting light on the path ahead.

---

*The constellation portal awaits the right key.*
