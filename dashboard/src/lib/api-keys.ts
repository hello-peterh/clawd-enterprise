import crypto from "crypto";
import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Generate a new API key with its prefix and hash.
 * The raw key is returned only once and must be shown to the user immediately.
 */
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = "ce_" + crypto.randomBytes(32).toString("hex");
  const prefix = key.slice(0, 11); // "ce_" + first 8 hex chars
  const hash = hashApiKey(key);
  return { key, prefix, hash };
}

/**
 * Hash an API key using SHA-256.
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Validate an API key by looking up its hash in the database.
 * Checks expiry and updates lastUsedAt on success.
 * Returns the ApiKey record if valid, or null if invalid/expired.
 */
export async function validateApiKey(
  db: PrismaClient,
  key: string
): Promise<{
  id: string;
  orgId: string;
  userId: string;
  name: string;
  scopes: unknown;
} | null> {
  const hash = hashApiKey(key);

  const apiKey = await db.apiKey.findUnique({
    where: { keyHash: hash },
  });

  if (!apiKey) return null;

  // Check if the key has expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Update lastUsedAt
  await db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    id: apiKey.id,
    orgId: apiKey.orgId,
    userId: apiKey.userId,
    name: apiKey.name,
    scopes: apiKey.scopes,
  };
}
