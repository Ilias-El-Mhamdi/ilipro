import { useState } from 'react';

export function useCarousel(length: number) {
  const [panel, setPanel] = useState(0);
  const prev = () => setPanel((p) => (p - 1 + length) % length);
  const next = () => setPanel((p) => (p + 1) % length);
  return { panel, setPanel, prev, next };
}
