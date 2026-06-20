// Module-level flag: true within an SPA session after the intro plays,
// reset to false on every page refresh (JS runtime restarts).
export let corridorHasPlayed = false;
export function markCorridorPlayed() { corridorHasPlayed = true; }
