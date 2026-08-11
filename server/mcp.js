import * as cheerio from "cheerio";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  chooseProjectPattern,
  officialPages,
  products,
  proofSystems,
  searchCatalog,
} from "./catalog.js";

const CACHE_TTL_MS = 10 * 60 * 1000;
const pageCache = new Map();
const allowedPageIds = officialPages.map((page) => page.id);

const serverInstructions = [
  "Use this read-only community server to research and plan with Fermah.",
  "Always distinguish official Fermah statements from server-maintained summaries and include the source URLs returned by tools.",
  "This server cannot submit proof jobs, manage wallets, execute trades, or perform on-chain actions.",
  "Start with search_fermah_docs, then use read_fermah_page when the exact official wording or current status matters.",
].join(" ");

function textResult(value) {
  return {
    content: [
      {
        type: "text",
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

function compactText(value) {
  return value.replace(/\s+/g, " ").trim();
}

async function fetchOfficialPage(page) {
  const cached = pageCache.get(page.id);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return { ...cached, cache: "hit" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(page.url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Fermah-MCP-Community/1.0 (+https://fermah.gogettest.online/docs)",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Official page returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    $("script, style, noscript, svg, nav, footer, header, form, button").remove();

    const candidates = ["main", "article", "[role='main']", "body"];
    let content = "";
    for (const selector of candidates) {
      content = compactText($(selector).first().text());
      if (content.length > 300) break;
    }

    const result = {
      pageId: page.id,
      title: page.title,
      source: response.url,
      retrievedAt: new Date().toISOString(),
      content: content.slice(0, 9_000),
      cache: "miss",
    };
    pageCache.set(page.id, { ...result, cachedAt: Date.now() });
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

function formatSearchResults(results) {
  return {
    count: results.length,
    results: results.map(({ id, title, url, summary }) => ({ id, title, url, summary })),
    note: "These are community-maintained search summaries. Use read_fermah_page for live official page content.",
  };
}

export function createFermahMcpServer() {
  const server = new McpServer(
    {
      name: "fermah-mcp-community",
      version: "1.0.0",
      title: "Fermah MCP Community",
      websiteUrl: "https://fermah.gogettest.online/",
    },
    { instructions: serverInstructions },
  );

  server.registerTool(
    "search_fermah_docs",
    {
      title: "Search Fermah documentation",
      description:
        "Search a curated index of official Fermah product pages and technical documentation. Returns source URLs and short community-maintained summaries.",
      inputSchema: {
        query: z.string().min(2).max(160).describe("Concept, product, proof system, or integration topic"),
        limit: z.number().int().min(1).max(8).default(5),
      },
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ query, limit }) => textResult(formatSearchResults(searchCatalog(query, limit))),
  );

  server.registerTool(
    "read_fermah_page",
    {
      title: "Read an official Fermah page",
      description:
        "Fetch and extract the current text of one allowlisted official Fermah page. Use search_fermah_docs first to discover page IDs.",
      inputSchema: {
        page_id: z.enum(allowedPageIds).describe("Allowlisted page ID returned by search_fermah_docs"),
      },
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    },
    async ({ page_id }) => {
      const page = officialPages.find((candidate) => candidate.id === page_id);
      try {
        return textResult(await fetchOfficialPage(page));
      } catch (error) {
        return textResult({
          pageId: page.id,
          title: page.title,
          source: page.url,
          liveFetch: "unavailable",
          fallbackSummary: page.summary,
          error: error instanceof Error ? error.message : "Unknown fetch error",
        });
      }
    },
  );

  server.registerTool(
    "list_fermah_products",
    {
      title: "List Fermah products",
      description:
        "Return a concise map of Kernel, Froben, Flashcast Social, and Marina with maturity caveats and official source links.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async () => textResult({ products, generatedAt: new Date().toISOString() }),
  );

  server.registerTool(
    "list_supported_proof_systems",
    {
      title: "List supported proof systems",
      description:
        "Return Fermah Froben proof systems recorded in the official documentation, separated into supported and planned lists.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async () => textResult(proofSystems),
  );

  server.registerTool(
    "design_fermah_project",
    {
      title: "Design a Fermah project",
      description:
        "Create a high-level, non-binding architecture outline for a project that may fit Kernel or Froben. It does not assert product access or API availability.",
      inputSchema: {
        use_case: z.string().min(10).max(1_000).describe("What the proposed product should do"),
        priority: z
          .enum(["speed", "cost", "privacy", "reliability", "decentralization"])
          .default("reliability"),
      },
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ use_case, priority }) => {
      const pattern = chooseProjectPattern(use_case);
      return textResult({
        project: pattern.title,
        likelyFit: pattern.fit,
        priority,
        proposedFlow: pattern.outline,
        nextChecks: [
          "Confirm current builder access, SDK/API availability, pricing, and supported networks directly with Fermah.",
          "Define trust assumptions and which outputs must be independently verifiable on-chain.",
          "Prototype with non-custodial, read-only paths before introducing asset movement.",
        ],
        sources: ["https://fermah.xyz/kernel", "https://docs.fermah.xyz/network"],
        disclaimer: "Community-generated architecture guidance; not an official Fermah commitment.",
      });
    },
  );

  server.registerTool(
    "get_fermah_mcp_info",
    {
      title: "Get this MCP server's information",
      description: "Return endpoint, transport, capabilities, safety model, and project links for this community server.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async () =>
      textResult({
        name: "Fermah MCP Community",
        endpoint: "https://fermah.gogettest.online/mcp",
        transport: "Streamable HTTP",
        authentication: "None; public read-only server",
        capabilities: ["tools", "resources", "prompts"],
        writesData: false,
        official: false,
        docs: "https://fermah.gogettest.online/docs",
        source: "https://github.com/Alicepoltora/fermah-mcp",
      }),
  );

  server.registerResource(
    "fermah-overview",
    "fermah://overview",
    {
      title: "Fermah overview",
      description: "A source-linked, community-maintained overview of the Fermah product family.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({ products, officialPages }, null, 2),
        },
      ],
    }),
  );

  server.registerResource(
    "fermah-proof-systems",
    "fermah://proof-systems",
    {
      title: "Fermah proof systems",
      description: "Supported and planned proof systems from Fermah documentation.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(proofSystems, null, 2),
        },
      ],
    }),
  );

  server.registerPrompt(
    "evaluate-fermah-fit",
    {
      title: "Evaluate a project for Fermah",
      description: "Research whether a product concept is a better fit for Kernel, Froben, both, or neither.",
      argsSchema: {
        project: z.string().min(10).max(1_000),
      },
    },
    async ({ project }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Evaluate this project for Fermah: ${project}`,
              "Use search_fermah_docs and read_fermah_page before deciding.",
              "Compare Kernel and Froben, identify trust assumptions, integration blockers, and the smallest credible MVP.",
              "Cite every official source URL and label all inferences clearly.",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  return server;
}
