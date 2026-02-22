import { db } from "./db";

export interface AuditLogParams {
  userId: string;
  userEmail: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  orgId?: string;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await db.auditLog.create({ data: params });
  } catch (error) {
    console.error("[audit] Failed to write audit log entry:", error);
  }
}

export function getClientIp(request: Request): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    undefined
  );
}
