// ─── Category prices (edit here to update all prices at once) ────────────────

export const CATEGORY_PRICES: Record<string, number> = {
  CAMISETAS: 55000,
  BUZOS:     80000,
  SHORTS:    40000, // placeholder — update when stock is added
};

export function getPriceForFolder(folder: string): number {
  return CATEGORY_PRICES[folder] ?? 0;
}

// ─── Argentine peso formatter ─────────────────────────────────────────────────

const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatARS(amount: number): string {
  return arsFormatter.format(amount);
}
