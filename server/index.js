import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import helmet from "helmet";

import { createFermahMcpServer } from "./mcp.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const distRoot = resolve(projectRoot, "dist");
const port = Number(process.env.PORT || 8834);
const publicBaseUrl = process.env.PUBLIC_BASE_URL || "https://fermah.gogettest.online";
const startedAt = new Date();

const app = express();
const sessions = new Map();
const rateBuckets = new Map();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Authorization, Mcp-Session-Id, Last-Event-ID, MCP-Protocol-Version",
  );
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

app.use(express.json({ limit: "256kb", type: ["application/json", "application/*+json"] }));

function mcpRateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const maxRequests = 180;
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  current.count += 1;
  if (current.count > maxRequests) {
    res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
    return res.status(429).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Rate limit exceeded. Try again shortly." },
      id: null,
    });
  }

  return next();
}

function jsonRpcError(res, status, message, code = -32000) {
  return res.status(status).json({ jsonrpc: "2.0", error: { code, message }, id: null });
}

app.get("/health", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({
    ok: true,
    service: "fermah-mcp-community",
    version: "1.0.0",
    transport: "streamable-http",
    endpoint: `${publicBaseUrl}/mcp`,
    uptimeSeconds: Math.floor((Date.now() - startedAt.getTime()) / 1000),
    activeSessions: sessions.size,
    timestamp: new Date().toISOString(),
  });
});

app.get(["/.well-known/mcp.json", "/install.json"], (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300");
  res.json({
    name: "Fermah MCP Community",
    description: "Read-only Fermah documentation, product research, and project-planning tools for AI clients.",
    official: false,
    transport: "streamable-http",
    url: `${publicBaseUrl}/mcp`,
    authentication: "none",
    capabilities: ["tools", "resources", "prompts"],
    documentation: `${publicBaseUrl}/docs`,
  });
});

app.post("/mcp", mcpRateLimit, async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];

  try {
    if (typeof sessionId === "string" && sessions.has(sessionId)) {
      const session = sessions.get(sessionId);
      session.lastSeen = Date.now();
      await session.transport.handleRequest(req, res, req.body);
      return;
    }

    if (sessionId) {
      jsonRpcError(res, 404, "Unknown or expired MCP session ID");
      return;
    }

    if (!isInitializeRequest(req.body)) {
      jsonRpcError(res, 400, "Initialize the MCP session before sending requests");
      return;
    }

    const server = createFermahMcpServer();
    let transport;
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (newSessionId) => {
        sessions.set(newSessionId, {
          server,
          transport,
          createdAt: Date.now(),
          lastSeen: Date.now(),
        });
      },
    });

    transport.onclose = () => {
      const id = transport.sessionId;
      if (id) sessions.delete(id);
    };

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP POST error", error instanceof Error ? error.message : error);
    if (!res.headersSent) jsonRpcError(res, 500, "Internal MCP server error", -32603);
  }
});

app.get("/mcp", mcpRateLimit, async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (typeof sessionId !== "string" || !sessions.has(sessionId)) {
    res.setHeader("Allow", "POST");
    jsonRpcError(res, 405, "Open this URL in an MCP client using Streamable HTTP. Start with POST initialize.");
    return;
  }

  try {
    const session = sessions.get(sessionId);
    session.lastSeen = Date.now();
    await session.transport.handleRequest(req, res);
  } catch (error) {
    console.error("MCP GET error", error instanceof Error ? error.message : error);
    if (!res.headersSent) jsonRpcError(res, 500, "Internal MCP server error", -32603);
  }
});

app.delete("/mcp", mcpRateLimit, async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (typeof sessionId !== "string" || !sessions.has(sessionId)) {
    jsonRpcError(res, 404, "Unknown or expired MCP session ID");
    return;
  }

  try {
    const session = sessions.get(sessionId);
    await session.transport.handleRequest(req, res);
  } catch (error) {
    console.error("MCP DELETE error", error instanceof Error ? error.message : error);
    if (!res.headersSent) jsonRpcError(res, 500, "Internal MCP server error", -32603);
  }
});

if (existsSync(distRoot)) {
  app.use(
    express.static(distRoot, {
      extensions: ["html"],
      maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
      setHeaders: (res, path) => {
        if (path.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
      },
    }),
  );

  app.get("/docs", (req, res) => res.sendFile(resolve(distRoot, "docs.html")));
  app.get("/", (req, res) => res.sendFile(resolve(distRoot, "index.html")));
}

app.use((req, res) => {
  if (req.path.startsWith("/mcp")) {
    jsonRpcError(res, 404, "MCP endpoint not found");
    return;
  }
  res.status(404).json({ error: "Not found", docs: `${publicBaseUrl}/docs` });
});

const httpServer = app.listen(port, "127.0.0.1", () => {
  console.log(`Fermah MCP listening on http://127.0.0.1:${port}`);
});

const cleanupTimer = setInterval(async () => {
  const expiry = Date.now() - 60 * 60 * 1000;
  for (const [sessionId, session] of sessions) {
    if (session.lastSeen < expiry) {
      sessions.delete(sessionId);
      await session.transport.close().catch(() => undefined);
      await session.server.close().catch(() => undefined);
    }
  }

  for (const [key, bucket] of rateBuckets) {
    if (bucket.resetAt < Date.now()) rateBuckets.delete(key);
  }
}, 5 * 60 * 1000);
cleanupTimer.unref();

async function shutdown(signal) {
  console.log(`Received ${signal}; shutting down`);
  clearInterval(cleanupTimer);
  for (const [, session] of sessions) {
    await session.transport.close().catch(() => undefined);
    await session.server.close().catch(() => undefined);
  }
  sessions.clear();
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
