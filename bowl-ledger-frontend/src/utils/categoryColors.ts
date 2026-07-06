import type { CSSProperties } from 'react';

const COMPONENT_CATEGORY_VARS: Record<string, string> = {
  Protein: 'protein',
  Grain: 'grain',
  Veg: 'veg',
  Sauce: 'sauce',
  Dairy: 'dairy',
  Other: 'other',
};

// stable fallback palette for free-text recipe categories (Dinner, Drinks, Dessert, ...)
const FREE_TEXT_PALETTE = ['protein', 'grain', 'veg', 'sauce', 'dairy', 'other'];

const freeTextCache = new Map<string, string>();

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function categoryVar(category: string): string {
  if (COMPONENT_CATEGORY_VARS[category]) return COMPONENT_CATEGORY_VARS[category];
  if (freeTextCache.has(category)) return freeTextCache.get(category)!;
  const slot = FREE_TEXT_PALETTE[hashString(category) % FREE_TEXT_PALETTE.length];
  freeTextCache.set(category, slot);
  return slot;
}

export function categoryColorStyle(category: string): CSSProperties {
  const v = categoryVar(category);
  return {
    color: `var(--cat-${v})`,
    background: `var(--cat-${v}-soft)`,
  };
}

export function categorySolidStyle(category: string): CSSProperties {
  const v = categoryVar(category);
  return {
    background: `var(--cat-${v})`,
  };
}
