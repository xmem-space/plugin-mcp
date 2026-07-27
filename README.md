# @xmem.space/mcp

MCP (Model Context Protocol) Server for [xmem](https://xmem.space) – persistent, graph-based memory for AI agents.

Provides tools, resources and a `context` prompt for storing, searching, and managing memories through any MCP-compatible client — over **stdio** (Claude Desktop / Claude Code / Cursor) or **StreamableHTTP**.

## Install

```bash
npm install -g @xmem.space/mcp
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `XMEM_API_URL` | xmem server URL | `http://localhost:18800` |
| `XMEM_API_KEY` | API key for authentication | _(none)_ |
| `MEMTAP_AGENT_ID` | Default agent identifier | `main` |
| `XMEM_MODE` | `core` = only `remember`/`recall`/`whoami` (less tool-sprawl); `full` = complete toolset | `full` |
| `XMEM_LEGACY_ALIASES` | Also register deprecated `memtap_*` tool names | `true` |
| `XMEM_TRANSPORT` | `stdio` (default) or `http` (StreamableHTTP server) | `stdio` |
| `XMEM_HTTP_HOST` | Bind host for `http` transport | `127.0.0.1` |
| `XMEM_HTTP_PORT` | Bind port for `http` transport | `8787` |

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "xmem": {
      "command": "xmem-mcp",
      "env": {
        "XMEM_API_URL": "https://api.xmem.space",
        "XMEM_API_KEY": "xm_live_...",
        "MEMTAP_AGENT_ID": "main"
      }
    }
  }
}
```

Or with npx (no global install needed):

```json
{
  "mcpServers": {
    "xmem": {
      "command": "npx",
      "args": ["-y", "@xmem.space/mcp"],
      "env": {
        "XMEM_API_URL": "https://api.xmem.space",
        "XMEM_API_KEY": "xm_live_...",
        "MEMTAP_AGENT_ID": "main"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "xmem": {
      "command": "npx",
      "args": ["-y", "@xmem.space/mcp"],
      "env": {
        "XMEM_API_URL": "https://api.xmem.space",
        "XMEM_API_KEY": "xm_live_...",
        "MEMTAP_AGENT_ID": "main"
      }
    }
  }
}
```

### Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "xmem": {
      "command": "npx",
      "args": ["-y", "@xmem.space/mcp"],
      "env": {
        "XMEM_API_URL": "https://api.xmem.space",
        "XMEM_API_KEY": "xm_live_...",
        "MEMTAP_AGENT_ID": "main"
      }
    }
  }
}
```

### claude.ai Connector (remote, no install)

The hosted xmem server already exposes a **remote MCP endpoint with OAuth discovery** — you do **not** need this npm package for the web/mobile connector. Just add a custom connector pointing at:

```
https://api.xmem.space/mcp
```

OAuth discovery is served at `/.well-known/oauth-protected-resource`.

### Self-hosted HTTP transport

To run this package as a local StreamableHTTP server (e.g. behind your own reverse proxy):

```bash
XMEM_TRANSPORT=http XMEM_HTTP_PORT=8787 xmem-mcp
# → xmem MCP (StreamableHTTP) listening on http://127.0.0.1:8787/mcp
```

## Tool Reference

All tools use the canonical `xmem_*` names. The legacy `memtap_*` names remain registered as **deprecated aliases** unless `XMEM_LEGACY_ALIASES=false`.

| Tool | Description |
|---|---|
| `xmem_whoami` | Verify connection: authenticated space, tier, agent, API-key status |
| `xmem_remember` | Store a new memory (fact, decision, preference, event, etc.) |
| `xmem_recall` | Full-text search across memories |
| `xmem_bulletin` | Context-aware memory retrieval |
| `xmem_graphrag` | Deep search with multi-hop graph traversal |
| `xmem_graph` | Graph operations: traverse, connections, gaps, clusters, overview |
| `xmem_decide` | Create, list, resolve, or defer decisions |
| `xmem_memory` | Get, update, or delete a specific memory |
| `xmem_entities` | List entities, get linked memories, merge duplicates |
| `xmem_edges` | Create relationships between memories |
| `xmem_health` | Check server health status |
| `xmem_maintenance` | Run maintenance: decay report, contradictions, dedup scan |
| `xmem_consolidate` | Full maintenance consolidation in one call |
| `xmem_export` | Export memory statistics |
| `xmem_profile` | Get memory profile for an agent |
| `xmem_categories` | List memory categories with counts |

In `XMEM_MODE=core`, only `xmem_remember`, `xmem_recall` and `xmem_whoami` are exposed.

## Prompts

| Prompt | Description |
|---|---|
| `context` | Loads the agent-self + user-identity profile facts as a priming system message. Call at session start so the assistant knows who it is and who the user is. |

## Resources

| URI | Description |
|---|---|
| `xmem://health` | Server health status |
| `xmem://stats` | Memory statistics |
| `xmem://profile` | Agent-self + user-identity profile facts (profile scope) |
| `xmem://profile/{agentId}` | Agent memory profile |
| `xmem://graph` | Knowledge-graph snapshot (overview + top entities/edges) |

## Development

```bash
npm install
npm run build
npm start
```

## License

MIT
