import crypto from "crypto";
import AICache from "@/models/AICache";

// Generate hash from stats object to detect changes
export function generateStatsHash(stats: any): string {
  const statsString = JSON.stringify({
    income: stats.income,
    expense: stats.expense,
    savings: stats.savings,
    categoryBreakdown: stats.categoryBreakdown,
    monthlyTrend: stats.monthlyTrend,
  });
  return crypto.createHash("md5").update(statsString).digest("hex");
}

// Generate unique cache key
export function generateCacheKey(
  userId: string,
  endpoint: string,
  statsHash: string
): string {
  return `${userId}_${endpoint}_${statsHash}`;
}

// Get cached response if available and not expired
export async function getCachedResponse(
  userId: string,
  endpoint: string,
  statsHash: string
): Promise<string | null> {
  try {
    const cacheKey = generateCacheKey(userId, endpoint, statsHash);
    const cached = await AICache.findOne({
      cacheKey,
      expiresAt: { $gt: new Date() }, // Only get if not expired
    });

    return cached ? cached.response : null;
  } catch (err) {
    console.error("Cache read error:", err);
    return null;
  }
}

// Save response to cache
export async function saveCachedResponse(
  userId: string,
  endpoint: string,
  statsHash: string,
  response: string,
  ttlHours: number = 24 // Cache for 24 hours by default
): Promise<void> {
  try {
    const cacheKey = generateCacheKey(userId, endpoint, statsHash);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    await AICache.findOneAndUpdate(
      { cacheKey },
      {
        userId,
        endpoint,
        cacheKey,
        response,
        statsHash,
        expiresAt,
      },
      { upsert: true, new: true } // Create if doesn't exist, update if exists
    );
  } catch (err) {
    console.error("Cache save error:", err);
    // Don't throw - caching failure shouldn't break the API
  }
}