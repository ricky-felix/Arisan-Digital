import { useMemo } from "react";

/** Generate a random set of drifting background blobs (3–6 of them). */
function makeBlobs() {
  const count = 3 + Math.floor(Math.random() * 4); // 3..6
  return Array.from({ length: count }, (_, i) => ({
    key: i,
    size: Math.round(90 + Math.random() * 130), // 90..220px
    top: Math.round(-12 + Math.random() * 92),   // % within (and slightly past) the card
    left: Math.round(-15 + Math.random() * 95),
    opacity: (0.03 + Math.random() * 0.06).toFixed(3),
    duration: Math.round(12 + Math.random() * 8), // 12..20s
    delay: Math.round(Math.random() * 12),        // staggered starts
    anim: i % 2 === 0 ? "blob-drift-1" : "blob-drift-2",
  }));
}

/**
 * CardBlobs — drifting translucent blobs for card/screen gradients.
 * Computed once per mount so the blobs stay put instead of jumping each render.
 * Same rules everywhere (StoryCard, EmptyCard) so the look stays consistent.
 */
export default function CardBlobs() {
  const blobs = useMemo(() => makeBlobs(), []);
  return blobs.map((b) => (
    <div
      key={b.key}
      className="card-blob"
      style={{
        width: b.size,
        height: b.size,
        top: `${b.top}%`,
        left: `${b.left}%`,
        background: `rgba(255,255,255,${b.opacity})`,
        animation: `${b.anim} ${b.duration}s ease-in-out -${b.delay}s infinite`,
      }}
    />
  ));
}
