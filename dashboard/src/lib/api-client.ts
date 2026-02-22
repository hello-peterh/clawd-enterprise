const GATEWAY_URL =
  process.env.OPENCLAW_GATEWAY_URL || "http://localhost:18789";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

async function rpc(method: string, params?: Record<string, unknown>) {
  const res = await fetch(`${GATEWAY_URL}/api`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GATEWAY_TOKEN}`,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export const gateway = {
  getChannels: () => rpc("channels.list"),
  getChannelStatus: (id: string) => rpc("channels.status", { id }),
  startChannel: (id: string) => rpc("channels.start", { id }),
  stopChannel: (id: string) => rpc("channels.stop", { id }),
  getSystemHealth: () => rpc("system.health"),
  getStats: () => rpc("system.stats"),
};
