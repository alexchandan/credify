import type { Response } from "express";
import { logger } from "../../utils/logger.js";

interface SseClient {
  res: Response;
  userId: string;
}

const clientsByUserId = new Map<string, Set<SseClient>>();

export function registerSseClient(userId: string, res: Response): () => void {
  const client: SseClient = { res, userId };

  let clientSet = clientsByUserId.get(userId);
  if (!clientSet) {
    clientSet = new Set<SseClient>();
    clientsByUserId.set(userId, clientSet);
  }
  clientSet.add(client);

  logger.debug(
    { userId, totalClients: clientSet.size },
    "SSE client connected",
  );

  // Send initial connection confirmation
  res.write(
    `event: connected\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`,
  );

  // Cleanup on close
  const cleanup = () => {
    const currentSet = clientsByUserId.get(userId);
    if (currentSet) {
      currentSet.delete(client);
      if (currentSet.size === 0) {
        clientsByUserId.delete(userId);
      }
    }
    logger.debug({ userId }, "SSE client disconnected");
  };

  return cleanup;
}

export function emitRealtimeEvent(
  userId: string,
  event: string,
  data: unknown,
): void {
  const clientSet = clientsByUserId.get(userId);
  if (!clientSet || clientSet.size === 0) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const client of clientSet) {
    try {
      client.res.write(payload);
    } catch (err) {
      logger.error({ err, userId }, "Failed to write SSE event to client");
    }
  }
}
