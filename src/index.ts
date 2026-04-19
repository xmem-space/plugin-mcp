#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as client from "./client.js";

const server = new McpServer({
  name: "xmem",
  version: "1.0.0",
});

// ── Helpers ─────────────────────────────────────────────────────────

function json(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

async function run<T>(fn: () => Promise<T>): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    const result = await fn();
    return { content: [{ type: "text", text: json(result) }] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text", text: `Error: ${msg}` }] };
  }
}

// ── Tools ───────────────────────────────────────────────────────────

server.tool(
  "memtap_remember",
  "Store a new memory in xmem. Use this to persist facts, decisions, preferences, observations, events, goals, or tasks.",
  {
    type: z.enum(["fact", "preference", "decision", "identity", "event", "observation", "goal", "task"]).describe("Memory type"),
    content: z.string().describe("The memory content to store"),
    importance: z.number().min(1).max(10).optional().describe("Importance 1-10 (default: 5)"),
    confidence: z.number().min(1).max(10).optional().describe("Confidence 1-10 (default: 8)"),
    tags: z.array(z.string()).optional().describe("Tags for categorization"),
    entities: z.array(z.string()).optional().describe("Entity names to link (auto-creates nodes)"),
    summary: z.string().optional().describe("Short summary (auto-generated if omitted)"),
  },
  async (params) => run(() => client.createMemory(params)),
);

server.tool(
  "memtap_recall",
  "Search memories by text query. Returns ranked results with relevance scores.",
  {
    q: z.string().describe("Search query"),
    limit: z.number().optional().describe("Max results (default: 10)"),
    types: z.string().optional().describe("Comma-separated type filter, e.g. 'fact,decision'"),
    minImportance: z.number().optional().describe("Minimum importance threshold (0-1)"),
  },
  async (params) => run(() => client.recall(params)),
);

server.tool(
  "memtap_bulletin",
  "Get context-aware memory retrieval. Provide a description of what you are working on and get the most relevant memories.",
  {
    context: z.string().describe("Description of current context or task"),
    limit: z.number().optional().describe("Max results (default: 5)"),
  },
  async (params) => run(() => client.bulletin(params)),
);

server.tool(
  "memtap_graphrag",
  "Deep knowledge retrieval combining search with multi-hop graph traversal. Best for complex questions that need connecting multiple memories.",
  {
    query: z.string().describe("Natural language search query"),
    embeddingTopK: z.number().optional().describe("Number of seed results (default: 5)"),
    graphDepth: z.number().optional().describe("Max graph traversal hops (default: 2)"),
    maxResults: z.number().optional().describe("Max total results (default: 20)"),
  },
  async (params) => run(() => client.graphrag(params)),
);

server.tool(
  "memtap_graph",
  "Explore the knowledge graph: traverse from a node, find connections between memories, detect gaps, discover clusters, or get an overview.",
  {
    action: z.enum(["traverse", "connections", "gaps", "clusters", "overview"]).describe("Graph operation to perform"),
    start: z.string().optional().describe("Memory ID to start traversal from (for 'traverse')"),
    depth: z.number().optional().describe("Max traversal depth (for 'traverse', default: 2)"),
    direction: z.enum(["any", "inbound", "outbound"]).optional().describe("Traversal direction (for 'traverse', default: any)"),
    from: z.string().optional().describe("Source memory ID (for 'connections')"),
    to: z.string().optional().describe("Target memory ID (for 'connections')"),
  },
  async (params) => {
    switch (params.action) {
      case "traverse":
        if (!params.start) return { content: [{ type: "text" as const, text: "Error: 'start' is required for traverse" }] };
        return run(() => client.traverse({ start: params.start!, depth: params.depth, direction: params.direction }));
      case "connections":
        if (!params.from || !params.to) return { content: [{ type: "text" as const, text: "Error: 'from' and 'to' are required for connections" }] };
        return run(() => client.connections(params.from!, params.to!));
      case "gaps":
        return run(() => client.gaps());
      case "clusters":
        return run(() => client.clusters());
      case "overview":
        return run(() => client.overview());
    }
  },
);

server.tool(
  "memtap_decide",
  "Manage decisions: create, list, resolve, or defer decisions.",
  {
    action: z.enum(["create", "list", "resolve", "defer"]).describe("Decision action"),
    content: z.string().optional().describe("Decision question (for 'create')"),
    options: z.array(z.string()).optional().describe("Available options (for 'create')"),
    deadline: z.string().optional().describe("Deadline ISO string (for 'create')"),
    context: z.string().optional().describe("Decision context (for 'create')"),
    id: z.string().optional().describe("Decision ID (for 'resolve'/'defer')"),
    outcome: z.string().optional().describe("Chosen outcome (for 'resolve')"),
    reasoning: z.string().optional().describe("Reasoning (for 'resolve')"),
    reason: z.string().optional().describe("Deferral reason (for 'defer')"),
    newDeadline: z.string().optional().describe("New deadline (for 'defer')"),
    status: z.string().optional().describe("Filter by status (for 'list')"),
  },
  async (params) => {
    switch (params.action) {
      case "create":
        if (!params.content) return { content: [{ type: "text" as const, text: "Error: 'content' is required" }] };
        return run(() => client.createDecision({
          content: params.content!,
          options: params.options,
          deadline: params.deadline,
          context: params.context,
        }));
      case "list":
        return run(() => client.listDecisions({ status: params.status }));
      case "resolve":
        if (!params.id || !params.outcome) return { content: [{ type: "text" as const, text: "Error: 'id' and 'outcome' are required" }] };
        return run(() => client.resolveDecision(params.id!, params.outcome!, params.reasoning));
      case "defer":
        if (!params.id || !params.reason) return { content: [{ type: "text" as const, text: "Error: 'id' and 'reason' are required" }] };
        return run(() => client.deferDecision(params.id!, params.reason!, params.newDeadline));
    }
  },
);

server.tool(
  "memtap_memory",
  "Get, update, or delete a specific memory by ID.",
  {
    action: z.enum(["get", "update", "delete"]).describe("Action to perform"),
    id: z.string().describe("Memory ID"),
    content: z.string().optional().describe("New content (for 'update')"),
    summary: z.string().optional().describe("New summary (for 'update')"),
    importance: z.number().optional().describe("New importance 1-10 (for 'update')"),
    confidence: z.number().optional().describe("New confidence 1-10 (for 'update')"),
    tags: z.array(z.string()).optional().describe("New tags (for 'update')"),
    archived: z.boolean().optional().describe("Archive flag (for 'update')"),
    hard: z.boolean().optional().describe("Hard delete instead of archive (for 'delete')"),
  },
  async (params) => {
    switch (params.action) {
      case "get":
        return run(() => client.getMemory(params.id));
      case "update": {
        const updates: Record<string, unknown> = {};
        if (params.content !== undefined) updates.content = params.content;
        if (params.summary !== undefined) updates.summary = params.summary;
        if (params.importance !== undefined) updates.importance = params.importance;
        if (params.confidence !== undefined) updates.confidence = params.confidence;
        if (params.tags !== undefined) updates.tags = params.tags;
        if (params.archived !== undefined) updates.archived = params.archived;
        return run(() => client.updateMemory(params.id, updates));
      }
      case "delete":
        return run(() => client.deleteMemory(params.id, params.hard));
    }
  },
);

server.tool(
  "memtap_entities",
  "List entities, get memories linked to an entity, or merge duplicate entities.",
  {
    action: z.enum(["list", "memories", "merge"]).describe("Entity action"),
    key: z.string().optional().describe("Entity key (for 'memories'/'merge')"),
    type: z.string().optional().describe("Entity type filter: person, project, device, location, company (for 'list')"),
    limit: z.number().optional().describe("Max results"),
    mergeFrom: z.string().optional().describe("Entity to merge into target (for 'merge')"),
  },
  async (params) => {
    switch (params.action) {
      case "list":
        return run(() => client.listEntities({ type: params.type, limit: params.limit }));
      case "memories":
        if (!params.key) return { content: [{ type: "text" as const, text: "Error: 'key' is required" }] };
        return run(() => client.entityMemories(params.key!, params.limit));
      case "merge":
        if (!params.key || !params.mergeFrom) return { content: [{ type: "text" as const, text: "Error: 'key' and 'mergeFrom' are required" }] };
        return run(() => client.mergeEntities(params.key!, params.mergeFrom!));
    }
  },
);

server.tool(
  "memtap_edges",
  "Create a relationship (edge) between two memories.",
  {
    from: z.string().describe("Source memory ID"),
    to: z.string().describe("Target memory ID"),
    type: z.enum(["RELATED_TO", "UPDATES", "CONTRADICTS", "CAUSED_BY", "PART_OF", "DEPENDS_ON", "MENTIONS"]).describe("Edge type"),
    weight: z.number().min(0).max(1).optional().describe("Edge weight 0-1 (default: 0.5)"),
  },
  async (params) => run(() => client.createEdge(params)),
);

server.tool(
  "memtap_health",
  "Check xmem server health and connection status.",
  {},
  async () => run(() => client.health()),
);

server.tool(
  "memtap_maintenance",
  "Run maintenance tasks: decay report, contradiction detection, duplicate scan, or full maintenance.",
  {
    action: z.enum(["decay", "contradictions", "dedup", "run-all"]).describe("Maintenance action"),
    limit: z.number().optional().describe("Max results (for 'decay'/'dedup')"),
  },
  async (params) => {
    switch (params.action) {
      case "decay":
        return run(() => client.decayReport(params.limit));
      case "contradictions":
        return run(() => client.contradictions());
      case "dedup":
        return run(() => client.dedupScan(params.limit));
      case "run-all":
        return run(() => client.runAllMaintenance());
    }
  },
);

server.tool(
  "memtap_consolidate",
  "Run full maintenance consolidation: decay analysis, contradiction detection, and duplicate scanning in one call.",
  {},
  async () => run(() => client.runAllMaintenance()),
);

server.tool(
  "memtap_export",
  "Export memory statistics including counts by type and agent.",
  {},
  async () => run(() => client.stats()),
);

server.tool(
  "memtap_profile",
  "Get the memory profile for a specific agent – statistics and breakdown.",
  {
    agentId: z.string().optional().describe("Agent ID (defaults to configured MEMTAP_AGENT_ID)"),
  },
  async (params) => {
    const agentId = params.agentId || client.getConfig().agentId;
    return run(async () => {
      const s = await client.stats() as Record<string, unknown>;
      const byAgent = (s.byAgent as Array<{ agent: string; count: number }>) || [];
      const agentStats = byAgent.find((a) => a.agent === agentId);
      return {
        agentId,
        memoryCount: agentStats?.count ?? 0,
        totalMemories: s.total,
        entityCount: s.entityCount,
        edgeCount: s.edgeCount,
        byType: s.byType,
      };
    });
  },
);

server.tool(
  "memtap_categories",
  "List all memory categories (types) with their counts.",
  {},
  async () => {
    return run(async () => {
      const s = await client.stats() as Record<string, unknown>;
      return { categories: s.byType };
    });
  },
);

// ── Resources ───────────────────────────────────────────────────────

server.resource(
  "health",
  "xmem://health",
  { description: "xmem server health status", mimeType: "application/json" },
  async () => {
    const data = await client.health();
    return { contents: [{ uri: "xmem://health", text: json(data), mimeType: "application/json" }] };
  },
);

server.resource(
  "stats",
  "xmem://stats",
  { description: "xmem memory statistics", mimeType: "application/json" },
  async () => {
    const data = await client.stats();
    return { contents: [{ uri: "xmem://stats", text: json(data), mimeType: "application/json" }] };
  },
);

server.resource(
  "profile",
  "xmem://profile/{agentId}",
  { description: "Memory profile for a specific agent", mimeType: "application/json" },
  async (uri, _extra) => {
    const match = uri.href.match(/\/([^/]+)$/);
    const agentId = match?.[1] || client.getConfig().agentId;
    const s = await client.stats() as Record<string, unknown>;
    const byAgent = (s.byAgent as Array<{ agent: string; count: number }>) || [];
    const agentStats = byAgent.find((a) => a.agent === agentId);
    const profile = {
      agentId,
      memoryCount: agentStats?.count ?? 0,
      totalMemories: s.total,
      entityCount: s.entityCount,
      edgeCount: s.edgeCount,
      byType: s.byType,
    };
    return { contents: [{ uri: `xmem://profile/${agentId}`, text: json(profile), mimeType: "application/json" }] };
  },
);

// ── Start ───────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
