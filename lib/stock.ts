import { Redis } from "@upstash/redis";

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export function stockKey(team: string, label: string, size: string) {
  return `sold:${team}__${label}__${size}`;
}

export async function markSold(team: string, label: string, size: string): Promise<void> {
  await redis.set(stockKey(team, label, size), "1");
}

export async function getSoldKeys(): Promise<string[]> {
  const keys = await redis.keys("sold:*");
  return keys.map((k) => k.replace(/^sold:/, ""));
}

export async function restock(team: string, label: string, size: string): Promise<void> {
  await redis.del(stockKey(team, label, size));
}
