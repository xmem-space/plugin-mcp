# xmem MCP Connector — Submission Dossier (Anthropic + OpenAI)

**Stand:** 2026-09-02 · Connector technisch fertig & live · Tool-Annotations deployed (Server v11)

Ein einziger Remote-MCP-Server deckt **beide** Verzeichnisse ab (MCP ist der
gemeinsame Standard). Es muss nichts pro Anbieter neu gebaut werden.

---

## 0. Gemeinsame Fakten (für beide Einreichungen)

| Feld | Wert |
|---|---|
| Produktname | xmem |
| Kurzbeschreibung | Persistent, graph-based long-term memory for AI agents. |
| Lange Beschreibung | xmem gives AI assistants durable memory: it stores facts, decisions and preferences, extracts entities and relationships into a knowledge graph, and recalls the right context on demand — including multi-hop graph search. |
| Kategorie | Productivity / Memory / Knowledge |
| MCP-Server-URL | `https://api.xmem.space/mcp` |
| Transport | Streamable HTTP (JSON mode, stateless) |
| Auth | OAuth 2.1 (PKCE S256, Dynamic Client Registration) **oder** API-Key Bearer |
| Website | `https://xmem.space` |
| Support | `hello@xmem.space` · `https://xmem.space/security` |
| Privacy Policy | `https://xmem.space/privacy-policy` |
| Terms of Service | `https://xmem.space/terms-of-service` |
| Logo | `https://xmem.space/logo.png` · `https://xmem.space/logo.svg` |
| Firma | psifactory LLC (Wyoming) |

### OAuth-Discovery (verifiziert live, HTTP 200)
- `https://api.xmem.space/.well-known/oauth-protected-resource`
- `https://api.xmem.space/.well-known/oauth-authorization-server`
- Authorize: `https://api.xmem.space/oauth/mcp/authorize`
- Token: `https://api.xmem.space/oauth/mcp/token`
- Register (DCR): `https://api.xmem.space/oauth/mcp/register`
- PKCE: `S256` (Pflicht erfüllt), grant `authorization_code`, scope `memory`

### Tools (6) + Annotations (verifiziert via tools/list)
| Tool | Zweck | readOnly | destructive |
|---|---|---|---|
| `add_memory` | Fakt/Entscheidung/Präferenz speichern (auto graph extraction) | false | false |
| `search_memories` | Semantisch + Keyword recall (fused) | true | false |
| `search_graph` | Multi-hop Knowledge-Graph (GraphRAG, Pro) | true | false |
| `list_entities` | Entitäten im Graph auflisten | true | false |
| `get_memories` | Letzte Memories | true | false |
| `delete_memory` | Memory per id löschen | false | **true** |

### Starter Prompts (Vorschlag)
1. "Remember that my company is psifactory LLC and my main product is xmem."
2. "What do you know about my current project?"
3. "Who works on what in my knowledge graph?" (search_graph)

---

## 1. Anthropic — Claude Connectors Directory

**Wo einreichen:** in claude.ai → **Settings → Connectors** → (In-App Submit-Flow, seit Juni 2026).
**Policy:** konsolidierte "Software Directory Policy" (seit April 2026).
**Voraussetzung Nutzerseite:** Custom Connectors = paid plan (Pro/Max/Team/Enterprise).

### Checkliste — Status
- [x] Remote MCP-Server öffentlich erreichbar (`api.xmem.space/mcp`)
- [x] OAuth 2.1, PKCE S256, exakte Redirect-URIs, kein implicit grant
- [x] Dynamic Client Registration (liefert `client_id`, 201)
- [x] Privacy Policy erreichbar
- [x] Verifizierbarer Support-Kontakt (`hello@xmem.space`)
- [x] Logo + Beschreibung
- [ ] **PRÜFEN:** Privacy Policy muss inhaltlich abdecken: welche Daten der
      Connector speichert (Memories/Entities), Nutzung, Retention, und
      **wie Nutzer Löschung anfordern**. Boilerplate reicht bei sensiblen Daten nicht.
      → Delete-Weg existiert (`delete_memory` Tool + Dashboard); in der Policy explizit benennen.

### Schritte
1. In claude.ai einloggen (paid).
2. Settings → Connectors → Add custom connector → `https://api.xmem.space/mcp`.
3. OAuth-Flow einmal selbst durchklicken (als Funktionsnachweis).
4. Directory-Submit im selben Bereich starten; Listing-Felder aus Abschnitt 0 ausfüllen.
5. Review abwarten.

---

## 2. OpenAI — ChatGPT Plugin Directory (Apps SDK / MCP)

**Wo einreichen:** `https://platform.openai.com/plugins` (Plugin Submission Portal).
**Doku:** `https://developers.openai.com/plugins/deploy/submission`
**Preview/Test vorab:** ChatGPT → Settings → Apps & Connectors → Developer Mode →
"Create" → MCP-URL `https://api.xmem.space/mcp` (zieht Metadaten + Tools).

### Vorbedingungen (Account) — von dir zu erledigen
- [ ] OpenAI-Org mit Rolle **Apps Management = Write**
      (`platform.openai.com/settings/organization/people/roles`).
- [ ] **Developer/Business Identity verifiziert**
      (`platform.openai.com/settings/organization/general` → business verification
      als psifactory LLC).

### Technische Checkliste — Status
- [x] Öffentlicher MCP-Server-URL
- [x] OAuth funktioniert (im Developer Mode testbar)
- [x] Privacy- + Terms-URL
- [x] **Tool-Annotations** (`readOnlyHint`/`openWorldHint`/`destructiveHint`) — LIVE ergänzt (Server v11)
- [x] **Domain-Verification-Pfad** `https://xmem.space/.well-known/openai-apps-challenge`
      liefert bereits 200 (Root-Domain kontrolliert → kein Subpath-Problem).
      OpenAI legt hier beim Submit ihren Challenge-Token ab.
- [x] **Content Security Policy** für den MCP-Server (Server v12): `default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'` + `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, HSTS, `Cross-Origin-Resource-Policy: same-origin`. Live verifiziert auf `api.xmem.space/mcp`.
- [x] **Demo-Credentials** angelegt: `demo@xmem.space` (Pro-Tier), 6 Beispiel-Memories (fiktive Firma "Acme Robotics"). API-Key + Nutzung liegen in `~/.openclaw/workspace/.secure/demo-account.txt` (chmod 600, NICHT im Repo/Chat).
- [ ] Starter Prompts + mind. 1–2 Test Cases + Country Availability + Policy-Attestations.

### Wichtige Hinweise (aus der offiziellen Doku)
- **Nicht** auf eine bereits publizierte Integration verweisen — den MCP-Server
  "from scratch" über das Portal einreichen (Portal scannt den Server neu).
- Example-MCP-URL muss während des Reviews **öffentlich erreichbar** sein
  (kein Platzhalter). Unser `api.xmem.space/mcp` erfüllt das.

### Schritte
1. Org-Rolle + Identity verifizieren (oben).
2. Vorab in ChatGPT Developer Mode testen (MCP-URL verbinden, Tools prüfen).
3. Portal `platform.openai.com/plugins` → neuer MCP-backed Plugin-Draft.
4. Listing-Felder (Abschnitt 0) + Annotations + CSP + Domain-Verification + Test Cases.
5. Submit → Review.

---

## 3. Was NUR du tun kannst (Account/Assets)
- Anthropic: paid Claude-Plan + In-App-Submit.
- OpenAI: Org-Rolle "Apps Management" + Business-Verification (psifactory LLC).
- Beide: finale Freigabe der Listing-Texte oben.

## 4. Vorbereitung durch Agent — ERLEDIGT (2026-09-02)
- [x] Privacy-Policy erweitert: neuer Abschnitt 3.4 "Connector / MCP integrations" (was autorisiert wird, welche Daten fließen, was gespeichert wird, Löschung via `delete_memory`), Retention-Sektion um Connector-Daten ergänzt, rev. 3. Live (Frontend v99).
- [x] Demo-Account `demo@xmem.space` mit 6 Memories angelegt; Creds in `.secure/demo-account.txt`.
- [x] CSP + Security-Header für `api.xmem.space/mcp` (Server v12), live verifiziert.
