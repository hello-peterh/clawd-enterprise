import crypto from "crypto";
import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Generate a cryptographically secure webhook secret.
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Sign a payload string with the webhook secret using HMAC-SHA256.
 */
export function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Deliver a webhook to an endpoint URL.
 * Sends a POST request with a JSON body and X-Webhook-Signature header.
 * Returns the HTTP status code, or null on network failure.
 */
export async function deliverWebhook(
  endpoint: { url: string; secret: string },
  event: string,
  payload: Record<string, unknown>
): Promise<{ status: number | null; body: string | null }> {
  const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
  const signature = signPayload(body, endpoint.secret);

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    const responseBody = await response.text().catch(() => null);
    return { status: response.status, body: responseBody };
  } catch {
    return { status: null, body: null };
  }
}

/**
 * Dispatch an event to all enabled webhook endpoints that subscribe to it.
 * Creates a WebhookDelivery record for each attempt.
 */
export async function dispatchEvent(
  db: PrismaClient,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  // Find all enabled endpoints that subscribe to this event
  const endpoints = await db.webhookEndpoint.findMany({
    where: { enabled: true },
  });

  const matchingEndpoints = endpoints.filter((ep) => {
    const events = ep.events as string[];
    return Array.isArray(events) && events.includes(event);
  });

  // Deliver to each matching endpoint in parallel
  await Promise.allSettled(
    matchingEndpoints.map(async (endpoint) => {
      const result = await deliverWebhook(endpoint, event, payload);

      await db.webhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          event,
          payload,
          responseStatus: result.status,
          responseBody: result.body,
        },
      });
    })
  );
}
