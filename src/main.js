import claudeIcon from "@lobehub/icons-static-svg/icons/claude.svg?raw";
import codexIcon from "@lobehub/icons-static-svg/icons/codex.svg?raw";
import cursorIcon from "@lobehub/icons-static-svg/icons/cursor.svg?raw";
import windsurfIcon from "@lobehub/icons-static-svg/icons/windsurf.svg?raw";
import vscodeIcon from "./vscode.svg?raw";
import "./styles.css";

const MCP_URL = "https://fermah.gogettest.online/mcp";
const CLIENT_KEY = "fermah-mcp-client";

// The icon package includes presentational inline styles. Removing them keeps
// the UI compatible with the site's strict Content Security Policy.
const cleanIcon = (svg) => svg.replace(/\sstyle="[^"]*"/g, "");

const copySvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="8" y="8" width="11" height="11" rx="2"></rect>
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
  </svg>`;

const genericIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="6" cy="12" r="2.2"></circle>
    <circle cx="18" cy="6" r="2.2"></circle>
    <circle cx="18" cy="18" r="2.2"></circle>
    <path d="M8 11l8-4M8 13l8 4"></path>
  </svg>`;

function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

const cursorConfig = { url: MCP_URL, headers: {} };
const cursorLink = `cursor://anysphere.cursor-deeplink/mcp/install?name=fermah-mcp&config=${encodeURIComponent(
  toBase64(JSON.stringify(cursorConfig)),
)}`;

const vscodeConfig = { name: "fermah-mcp", type: "http", url: MCP_URL };
const vscodeLink = `vscode:mcp/install?${encodeURIComponent(JSON.stringify(vscodeConfig))}`;

const clients = {
  claude: {
    name: "Claude",
    icon: cleanIcon(claudeIcon),
    eyebrow: "Remote connector",
    summary: "Copy the endpoint, then add it as a custom connector in Claude Settings.",
    steps: [
      "Open Settings → Connectors.",
      "Choose Add custom connector.",
      "Paste the copied MCP URL and confirm.",
    ],
    primary: {
      kind: "copy-open",
      label: "Copy URL & open Claude",
      payload: MCP_URL,
      href: "https://claude.ai/settings/connectors",
    },
    secondary: { label: "Copy endpoint", payload: MCP_URL },
    code: MCP_URL,
  },
  cursor: {
    name: "Cursor",
    icon: cleanIcon(cursorIcon),
    eyebrow: "One-click install",
    summary: "Open Cursor's reviewed MCP install dialog with the remote endpoint prefilled.",
    steps: ["Click Add to Cursor.", "Review the remote URL.", "Choose Install and enable the tools you want."],
    primary: { kind: "link", label: "Add to Cursor", href: cursorLink },
    secondary: { label: "Copy manual config", payload: JSON.stringify({ mcpServers: { "fermah-mcp": cursorConfig } }, null, 2) },
    code: JSON.stringify({ mcpServers: { "fermah-mcp": cursorConfig } }, null, 2),
  },
  vscode: {
    name: "Visual Studio Code",
    icon: cleanIcon(vscodeIcon),
    eyebrow: "Direct install link",
    summary: "Open the native MCP installation review in Visual Studio Code Desktop.",
    steps: ["Click Install in VS Code.", "Review the server URL.", "Confirm trust, then enable the tools in Chat."],
    primary: { kind: "link", label: "Install in VS Code", href: vscodeLink },
    secondary: { label: "Copy mcp.json entry", payload: JSON.stringify({ servers: { "fermah-mcp": { type: "http", url: MCP_URL } } }, null, 2) },
    code: JSON.stringify({ servers: { "fermah-mcp": { type: "http", url: MCP_URL } } }, null, 2),
  },
  windsurf: {
    name: "Windsurf",
    icon: cleanIcon(windsurfIcon),
    eyebrow: "Configuration ready",
    summary: "Copy a complete remote HTTP entry for Windsurf's MCP configuration.",
    steps: [
      "Copy the configuration below.",
      "Open Windsurf Settings → Cascade → MCP Servers.",
      "Open raw config, paste the entry, and refresh MCPs.",
    ],
    primary: {
      kind: "copy",
      label: "Copy Windsurf config",
      payload: JSON.stringify({ mcpServers: { "fermah-mcp": { serverUrl: MCP_URL } } }, null, 2),
    },
    secondary: { label: "Copy endpoint only", payload: MCP_URL },
    code: JSON.stringify({ mcpServers: { "fermah-mcp": { serverUrl: MCP_URL } } }, null, 2),
  },
  codex: {
    name: "Codex",
    icon: cleanIcon(codexIcon),
    eyebrow: "One command",
    summary: "Register the Streamable HTTP server in the shared Codex MCP configuration.",
    steps: ["Copy the command.", "Run it in a terminal with Codex installed.", "Use /mcp or codex mcp list to verify the connection."],
    primary: {
      kind: "copy",
      label: "Copy Codex command",
      payload: `codex mcp add fermah-mcp --url ${MCP_URL}`,
    },
    secondary: { label: "Copy config.toml entry", payload: `[mcp_servers.fermah-mcp]\nurl = "${MCP_URL}"` },
    code: `codex mcp add fermah-mcp --url ${MCP_URL}`,
  },
  generic: {
    name: "Other MCP client",
    icon: genericIcon,
    eyebrow: "Universal endpoint",
    summary: "Use this public URL in any client that supports remote Streamable HTTP MCP servers.",
    steps: ["Add a remote MCP server.", "Choose Streamable HTTP.", "Paste the endpoint; no authentication headers are required."],
    primary: { kind: "copy", label: "Copy universal config", payload: JSON.stringify({ mcpServers: { "fermah-mcp": { type: "http", url: MCP_URL } } }, null, 2) },
    secondary: { label: "Copy endpoint only", payload: MCP_URL },
    code: JSON.stringify({ mcpServers: { "fermah-mcp": { type: "http", url: MCP_URL } } }, null, 2),
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function detectClient() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("client")?.toLowerCase();
  if (requested && clients[requested]) return { id: requested, reason: "link" };

  const source = `${document.referrer} ${navigator.userAgent} ${navigator.userAgentData?.brands?.map((brand) => brand.brand).join(" ") || ""}`.toLowerCase();
  const checks = [
    ["cursor", ["cursor.com", "cursor/"]],
    ["vscode", ["code.visualstudio.com", "visual studio code", "vscode"]],
    ["windsurf", ["windsurf", "codeium"]],
    ["claude", ["claude.ai", "claude desktop"]],
    ["codex", ["codex", "chatgpt desktop"]],
  ];

  for (const [id, needles] of checks) {
    if (needles.some((needle) => source.includes(needle))) return { id, reason: "browser context" };
  }

  const saved = localStorage.getItem(CLIENT_KEY);
  if (saved && clients[saved]) return { id: saved, reason: "last selection" };
  return { id: "claude", reason: "default" };
}

function showToast(message) {
  const toast = document.querySelector("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2_200);
}

async function copyText(payload, message = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(payload);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = payload;
    textarea.setAttribute("readonly", "");
    textarea.className = "copy-fallback";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  showToast(message);
}

function renderClientChips(selectedId) {
  document.querySelectorAll("[data-client-chips]").forEach((container) => {
    container.innerHTML = Object.entries(clients)
      .map(
        ([id, client]) => `
          <button
            class="client-chip ${id === selectedId ? "active" : ""}"
            type="button"
            data-client="${id}"
            aria-label="Show ${escapeHtml(client.name)} setup"
            aria-pressed="${id === selectedId}"
            title="${escapeHtml(client.name)}"
          >
            <span class="client-icon" aria-hidden="true">${client.icon}</span>
            <span class="client-tooltip" aria-hidden="true">${escapeHtml(client.name)}</span>
          </button>`,
      )
      .join("");
  });
}

function renderInstallSurface(selectedId) {
  const client = clients[selectedId];
  const primaryElement = client.primary.kind === "link"
    ? `<a class="primary-button install-primary" data-primary-link href="${escapeHtml(client.primary.href)}">${escapeHtml(client.primary.label)} <span aria-hidden="true">↗</span></a>`
    : `<button class="primary-button install-primary" type="button" data-primary-copy>${escapeHtml(client.primary.label)} <span aria-hidden="true">↗</span></button>`;

  document.querySelectorAll("[data-install-surface]").forEach((surface) => {
    surface.innerHTML = `
      <div class="install-head">
        <div class="install-client-icon" aria-hidden="true">${client.icon}</div>
        <div>
          <span>${escapeHtml(client.eyebrow)}</span>
          <h2>${escapeHtml(client.name)}</h2>
        </div>
      </div>
      <p class="install-summary">${escapeHtml(client.summary)}</p>
      <ol class="install-steps">
        ${client.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
      </ol>
      <div class="install-code">
        <pre><code>${escapeHtml(client.code)}</code></pre>
        <button type="button" data-copy="${escapeHtml(client.code)}" aria-label="Copy configuration">${copySvg}</button>
      </div>
      <div class="install-actions">
        ${primaryElement}
        <button class="install-secondary" type="button" data-secondary-copy>${escapeHtml(client.secondary.label)}</button>
      </div>`;

    const primaryCopy = surface.querySelector("[data-primary-copy]");
    if (primaryCopy) {
      primaryCopy.addEventListener("click", () => {
        if (client.primary.kind === "copy-open") {
          window.open(client.primary.href, "_blank", "noopener,noreferrer");
        }
        copyText(client.primary.payload, `${client.name} setup copied`);
      });
    }

    const secondaryCopy = surface.querySelector("[data-secondary-copy]");
    secondaryCopy?.addEventListener("click", () => copyText(client.secondary.payload, "Manual configuration copied"));
  });
}

function selectClient(id, reason = "selection") {
  if (!clients[id]) return;
  localStorage.setItem(CLIENT_KEY, id);
  renderClientChips(id);
  renderInstallSurface(id);

  document.querySelectorAll("[data-detection-note]").forEach((note) => {
    note.textContent = reason === "selection" ? `${clients[id].name} selected` : `Suggested: ${clients[id].name} · ${reason}`;
  });
}

function bindGlobalClicks() {
  document.addEventListener("click", (event) => {
    const clientButton = event.target.closest("[data-client]");
    if (clientButton) {
      selectClient(clientButton.dataset.client);
      const params = new URLSearchParams(window.location.search);
      params.set("client", clientButton.dataset.client);
      const query = params.toString();
      history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
      return;
    }

    const copyButton = event.target.closest("[data-copy]");
    if (copyButton) copyText(copyButton.dataset.copy);
  });
}

function initCopyIcons() {
  document.querySelectorAll("[data-copy-icon]").forEach((icon) => {
    icon.innerHTML = copySvg;
  });
}

async function checkHealth() {
  try {
    const response = await fetch("/health", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Health request failed");
    const health = await response.json();
    document.querySelectorAll("[data-server-status]").forEach((node) => {
      node.textContent = health.ok ? "Endpoint operational" : "Endpoint degraded";
    });
    document.querySelectorAll("[data-server-dot]").forEach((dot) => dot.classList.toggle("offline", !health.ok));
  } catch {
    document.querySelectorAll("[data-server-status]").forEach((node) => {
      node.textContent = "Endpoint status unavailable";
    });
    document.querySelectorAll("[data-server-dot]").forEach((dot) => dot.classList.add("offline"));
  }
}

function initScrollReveal() {
  const items = document.querySelectorAll(".scroll-reveal");
  if (!items.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18 },
  );
  items.forEach((item) => observer.observe(item));
}

function initDocsSpy() {
  const links = [...document.querySelectorAll(".docs-sidebar nav a")];
  if (!links.length) return;
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
    },
    { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.2, 0.6] },
  );
  sections.forEach((section) => observer.observe(section));
}

const detected = detectClient();
initCopyIcons();
bindGlobalClicks();
selectClient(detected.id, detected.reason);
checkHealth();
initScrollReveal();
initDocsSpy();
