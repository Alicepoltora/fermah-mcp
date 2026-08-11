# Fermah MCP Community

A public, read-only [Model Context Protocol](https://modelcontextprotocol.io/) server that helps AI clients research Fermah and outline possible integrations. It exposes source-linked product and documentation lookup, proof-system metadata, and a conservative project-planning tool over Streamable HTTP.

This is a community project. It is not affiliated with or endorsed by Fermah, and it cannot submit proofs, move assets, execute Kernel workflows, or perform any other write action.

## Connect

Public endpoint:

```text
https://fermah.gogettest.online/mcp
```

- Website: <https://fermah.gogettest.online/>
- Documentation: <https://fermah.gogettest.online/docs>
- Health: <https://fermah.gogettest.online/health>
- Machine-readable manifest: <https://fermah.gogettest.online/.well-known/mcp.json>

No API key is required.

### Claude

Open **Settings → Connectors → Add custom connector** and paste the public endpoint.

### Cursor

Use the **Add to Cursor** button on the website, or add this to your MCP configuration:

```json
{
  "mcpServers": {
    "fermah-mcp": {
      "url": "https://fermah.gogettest.online/mcp",
      "headers": {}
    }
  }
}
```

### Visual Studio Code

Use the **Install in VS Code** button on the website, or add:

```json
{
  "servers": {
    "fermah-mcp": {
      "type": "http",
      "url": "https://fermah.gogettest.online/mcp"
    }
  }
}
```

### Codex

```bash
codex mcp add fermah-mcp --url https://fermah.gogettest.online/mcp
```

### Windsurf

```json
{
  "mcpServers": {
    "fermah-mcp": {
      "serverUrl": "https://fermah.gogettest.online/mcp"
    }
  }
}
```

## Capabilities

The server publishes six tools:

- `search_fermah_docs` — search the curated official-source map.
- `read_fermah_page` — fetch one allowlisted Fermah page live.
- `list_fermah_products` — compare Kernel, Froben, Flashcast Social, and Marina.
- `list_supported_proof_systems` — return supported and planned systems from the Froben docs.
- `design_fermah_project` — produce a non-binding Kernel/Froben architecture outline.
- `get_fermah_mcp_info` — describe this endpoint and its safety model.

It also publishes two resources (`fermah://overview`, `fermah://proof-systems`) and the `evaluate-fermah-fit` prompt.

## Local development

Requires Node.js 20.11 or newer.

```bash
npm ci
npm run dev
```

The Vite UI runs on its development port and the MCP service runs on `127.0.0.1:8834`.

Build and verify:

```bash
npm run build
npm test
npm run test:mcp
```

Run the production server:

```bash
PUBLIC_BASE_URL=http://127.0.0.1:8834 npm start
```

## Security model

- All MCP tools are read-only and require no credentials.
- Live page retrieval is restricted to a compile-time allowlist; callers cannot provide arbitrary URLs.
- Request bodies are capped at 256 KB and the MCP endpoint is rate-limited per client IP.
- Search summaries and architecture suggestions are labeled as community-maintained context.
- Current access, pricing, SLAs, network availability, and product commitments must be confirmed with Fermah.

Please report security issues privately to the repository owner rather than opening a public exploit report.

## License

[MIT](LICENSE)
