/**
 * xmem HTTP Client – wraps all xmem API endpoints.
 */

export interface MemTapConfig {
  apiUrl: string;
  apiKey?: string;
  agentId: string;
}

export function getConfig(): MemTapConfig {
  return {
    apiUrl: (process.env.XMEM_API_URL || "http://localhost:18800").replace(/\/$/, ""),
    apiKey: process.env.XMEM_API_KEY,
    agentId: process.env.MEMTAP_AGENT_ID || "main",
  };
}

async function request(path: string, options: RequestInit = {}): Promise<unknown> {
  const cfg = getConfig();
  const url = `${cfg.apiUrl}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (cfg.apiKey) {
    headers["Authorization"] = `Bearer ${cfg.apiKey}`;
  }
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`xmem API ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function qs(params: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

// ── Health & Stats ──────────────────────────────────────────────────

export function health() {
  return request("/health");
}

export function stats() {
  return request("/stats");
}

// ── Memories CRUD ───────────────────────────────────────────────────

export interface CreateMemoryParams {
  type: string;
  content: string;
  agent?: string;
  summary?: string;
  importance?: number;
  confidence?: number;
  tags?: string[];
  entities?: string[];
}

export function createMemory(params: CreateMemoryParams) {
  const cfg = getConfig();
  return request("/memories", {
    method: "POST",
    body: JSON.stringify({ agent: cfg.agentId, ...params }),
  });
}

export function getMemory(id: string) {
  return request(`/memories/${encodeURIComponent(id)}`);
}

export function updateMemory(id: string, params: Record<string, unknown>) {
  return request(`/memories/${encodeURIComponent(id)}/update`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function deleteMemory(id: string, hard = false) {
  return request(`/memories/${encodeURIComponent(id)}${hard ? "?hard=true" : ""}`, {
    method: "DELETE",
  });
}

// ── Search & Recall ─────────────────────────────────────────────────

export interface RecallParams {
  q: string;
  limit?: number;
  types?: string;
  agent?: string;
  minImportance?: number;
}

export function recall(params: RecallParams) {
  const cfg = getConfig();
  return request(`/recall${qs({ agent: cfg.agentId, ...params })}`);
}

export interface BulletinParams {
  context: string;
  agent?: string;
  limit?: number;
}

export function bulletin(params: BulletinParams) {
  const cfg = getConfig();
  return request("/bulletin", {
    method: "POST",
    body: JSON.stringify({ agent: cfg.agentId, ...params }),
  });
}

// ── GraphRAG ────────────────────────────────────────────────────────

export interface GraphRAGParams {
  query: string;
  agent?: string;
  embeddingTopK?: number;
  graphDepth?: number;
  maxResults?: number;
}

export function graphrag(params: GraphRAGParams) {
  const cfg = getConfig();
  return request("/graphrag/query", {
    method: "POST",
    body: JSON.stringify({ agent: cfg.agentId, ...params }),
  });
}

// ── Graph ───────────────────────────────────────────────────────────

export interface TraverseParams {
  start: string;
  depth?: number;
  direction?: string;
}

export function traverse(params: TraverseParams) {
  return request(`/graph/traverse${qs({ ...params })}`);
}

export function connections(from: string, to: string) {
  return request(`/graph/connections${qs({ from, to })}`);
}

export function gaps() {
  return request("/graph/gaps");
}

export function clusters() {
  return request("/graph/clusters");
}

export function overview() {
  return request("/graph/overview");
}

// ── Edges ───────────────────────────────────────────────────────────

export interface CreateEdgeParams {
  from: string;
  to: string;
  type: string;
  weight?: number;
}

export function createEdge(params: CreateEdgeParams) {
  return request("/relate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Entities ────────────────────────────────────────────────────────

export function listEntities(params: { type?: string; limit?: number } = {}) {
  return request(`/entities${qs(params)}`);
}

export function entityMemories(key: string, limit?: number) {
  return request(`/entities/${encodeURIComponent(key)}/memories${qs({ limit })}`);
}

export function mergeEntities(target: string, mergeFrom: string) {
  return request(`/entities/${encodeURIComponent(target)}/merge`, {
    method: "POST",
    body: JSON.stringify({ mergeFrom }),
  });
}

// ── Decisions ───────────────────────────────────────────────────────

export function listDecisions(params: { status?: string } = {}) {
  return request(`/decisions${qs(params)}`);
}

export interface CreateDecisionParams {
  content: string;
  agent?: string;
  options?: string[];
  deadline?: string;
  context?: string;
}

export function createDecision(params: CreateDecisionParams) {
  const cfg = getConfig();
  return request("/decisions", {
    method: "POST",
    body: JSON.stringify({ agent: cfg.agentId, ...params }),
  });
}

export function resolveDecision(id: string, outcome: string, reasoning?: string) {
  return request(`/decisions/${encodeURIComponent(id)}/resolve`, {
    method: "POST",
    body: JSON.stringify({ outcome, reasoning }),
  });
}

export function deferDecision(id: string, reason: string, newDeadline?: string) {
  return request(`/decisions/${encodeURIComponent(id)}/defer`, {
    method: "POST",
    body: JSON.stringify({ reason, newDeadline }),
  });
}

// ── Maintenance ─────────────────────────────────────────────────────

export function decayReport(limit?: number) {
  return request(`/maintenance/decay-report${qs({ limit })}`);
}

export function contradictions() {
  return request("/maintenance/contradictions");
}

export function dedupScan(limit?: number) {
  return request("/maintenance/dedup-scan", {
    method: "POST",
    body: JSON.stringify({ limit }),
  });
}

export function runAllMaintenance() {
  return request("/maintenance/run-all", { method: "POST" });
}
