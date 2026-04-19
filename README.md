# @xmem-space/mcp

MCP (Model Context Protocol) Server for [xmem](https://xmem.space) – persistent memory for AI agents.

Provides 15 tools and 3 resources for storing, searching, and managing memories through any MCP-compatible client.

## Install

```bash
npm install -g @xmem-space/mcp
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `XMEM_API_URL` | xmem server URL | `http://localhost:18800` |
| `XMEM_API_KEY` | API key for authentication | _(none)_ |
| `MEMTAP_AGENT_ID` | Default agent identifier | `main` |

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "xmem": {
      "command": "xmem-mcp",
      "env": {
        "XMEM_API_URL": "http://localhost:18800",
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
      "args": ["-y", "@xmem-space/mcp"],
      "env": {
        "XMEM_API_URL": "http://localhost:18800",
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
      "args": ["-y", "@xmem-space/mcp"],
      "env": {
        "XMEM_API_URL": "http://localhost:18800",
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
      "args": ["-y", "@xmem-space/mcp"],
      "env": {
        "XMEM_API_URL": "http://localhost:18800",
        "MEMTAP_AGENT_ID": "main"
      }
    }
  }
}
```

## Tool Reference

| Tool | Description |
|---|---|
| `memtap_remember` | Store a new memory (fact, decision, preference, event, etc.) |
| `memtap_recall` | Full-text search across memories |
| `memtap_bulletin` | Context-aware memory retrieval |
| `memtap_graphrag` | Deep search with multi-hop graph traversal |
| `memtap_graph` | Graph operations: traverse, connections, gaps, clusters, overview |
| `memtap_decide` | Create, list, resolve, or defer decisions |
| `memtap_memory` | Get, update, or delete a specific memory |
| `memtap_entities` | List entities, get linked memories, merge duplicates |
| `memtap_edges` | Create relationships between memories |
| `memtap_health` | Check server health status |
| `memtap_maintenance` | Run maintenance: decay report, contradictions, dedup scan |
| `memtap_consolidate` | Full maintenance consolidation in one call |
| `memtap_export` | Export memory statistics |
| `memtap_profile` | Get memory profile for an agent |
| `memtap_categories` | List memory categories with counts |

## Resources

| URI | Description |
|---|---|
| `xmem://health` | Server health status |
| `xmem://stats` | Memory statistics |
| `xmem://profile/{agentId}` | Agent memory profile |

## Development

```bash
npm install
npm run build
npm start
```

## License

MIT
