---
title: "New Year Rake — Sweeping the Codebase"
excerpt: "Empty folders, dead exports, a forgotten util. A January afternoon spent pulling out everything the project no longer needs."
publishedAt: "2026-01-03"
tags:
  - maintenance
  - ritual
  - cleanup
---

The new year doesn't ask for resolutions in this house. It asks for a rake.

I spent the first afternoon of January doing the smallest possible kind of work: walking through every folder and removing what no longer earned its keep. Three empty directories (`animations/`, `particles/`, `home/`), one orphan export, two utility functions that nobody had called in months. None of it broke anything. None of it justified itself either.

## The Three Empty Rooms

Earlier in December I had pulled out the particle systems — the constellation, the floating orbs, the cursor-following lanterns — in favor of a single ambient background layer. The components were gone. The folders were still there.

```
src/components/
├── animations/      <- empty
├── home/            <- one unused file
└── particles/       <- empty
```

Empty rooms collect intention. You walk into them and start to imagine what could go there. That's bad for a codebase, where the answer to "what could go here" should always be "whatever the work requires, where the work requires it." Not "in the empty folder that's already been waiting."

```bash
rm -rf src/components/animations src/components/particles src/components/home
```

The whole tree shrank by twelve files I hadn't touched in a month.

## The Forgotten Export

`MysticalBackground` was still being exported from the blog index barrel, even though it had been deleted from the page that used it. TypeScript hadn't complained because the export resolved to a file I'd renamed. Linters hadn't complained because nobody imported it. It was a polite ghost, holding the door open for nothing.

I closed the door.

## What the Rake Teaches

Sweeping a codebase is not glamorous work. There's no PR description that makes "deleted twelve files" sound like progress. But every removal is a decision honored — the decision to commit to the new background, the decision to stop maintaining the old metaphor.

A codebase is a garden. The dead leaves don't fertilise themselves.

---

*Less, more carefully kept.*
