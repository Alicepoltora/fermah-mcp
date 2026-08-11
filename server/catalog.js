export const officialPages = [
  {
    id: "overview",
    title: "Fermah overview",
    url: "https://fermah.xyz/",
    summary:
      "Fermah positions Kernel as protocol agency infrastructure: a workflow engine that observes verifiable conditions, executes deterministic off-chain logic, and returns attested results on-chain.",
    keywords: ["overview", "kernel", "protocol agency", "workflows", "on-chain", "automation"],
  },
  {
    id: "kernel",
    title: "Fermah Kernel",
    url: "https://fermah.xyz/kernel",
    summary:
      "Kernel composes workflows from typed nodes, runs them in isolated environments, and publishes results on-chain with cryptographic evidence. AI may compose workflows, while deterministic code executes them.",
    keywords: ["kernel", "typed nodes", "sandbox", "deterministic", "attestation", "ai agents"],
  },
  {
    id: "workflow-engine",
    title: "How autonomous workflow execution works",
    url: "https://fermah.xyz/blog/how-autonomous-workflow-execution-works",
    summary:
      "A technical walkthrough of Kernel workflows, type validation, sandboxed execution, retries, data aggregation, and on-chain attestation, including a Flashcast Social case study.",
    keywords: ["workflow", "oracle", "execution", "flashcast", "sandbox", "attestation", "agent"],
  },
  {
    id: "froben",
    title: "Fermah Froben",
    url: "https://fermah.xyz/froben",
    summary:
      "Froben is a two-sided marketplace for ZK proof generation. Demand comes from applications requiring proofs; supply comes from GPU and CPU machines selected by the Fermah Matchmaker.",
    keywords: ["froben", "proof market", "gpu", "cpu", "matchmaker", "zk"],
  },
  {
    id: "froben-docs",
    title: "Froben network overview",
    url: "https://docs.fermah.xyz/network",
    summary:
      "The network connects proof seekers with proving machines. Intelligent orchestration allocates work while aiming for competitive pricing and broad proof-system compatibility.",
    keywords: ["network", "seekers", "provers", "marketplace", "architecture"],
  },
  {
    id: "why-fermah",
    title: "Why Fermah",
    url: "https://docs.fermah.xyz/network/introduction/why-fermah",
    summary:
      "Generating ZK proofs requires expensive infrastructure that is difficult to source and often underutilized. Fermah aims to make proof generation cheaper, faster, and more reliable.",
    keywords: ["why", "cost", "infrastructure", "utilization", "reliability", "zkp"],
  },
  {
    id: "proof-systems",
    title: "Supported proof systems",
    url: "https://docs.fermah.xyz/network/introduction/supported-proof-systems",
    summary:
      "The official list of proof systems supported by Froben, including zkVM, SNARK, and STARK-oriented systems, plus systems planned for future support.",
    keywords: ["proof systems", "jolt", "groth16", "risc zero", "sp1", "stwo", "valida", "zkvm"],
  },
  {
    id: "concepts",
    title: "Key terms and concepts",
    url: "https://docs.fermah.xyz/network/introduction/key-terms-and-concepts",
    summary:
      "Defines Seekers, Prover Nodes, the Matchmaker, proof-system components, zkVMs, zkEVMs, restaking, AVSs, and EigenLayer in the context of Fermah Froben.",
    keywords: ["terms", "seeker", "prover node", "matchmaker", "zkvm", "zkevm", "eigenlayer"],
  },
  {
    id: "components",
    title: "Network components",
    url: "https://docs.fermah.xyz/network/network/components",
    summary:
      "Seekers submit proof requests to Core, Core assigns compatible Prover Nodes, and completed proofs are stored and returned to the Seeker callback URL.",
    keywords: ["components", "core", "prover nodes", "storage", "callback", "request lifecycle"],
  },
  {
    id: "mainnet",
    title: "Mainnet overview",
    url: "https://docs.fermah.xyz/network/mainnet",
    summary:
      "Operational guidance for participating in the Froben mainnet, including access requirements, supported machine types, and links to node setup documentation.",
    keywords: ["mainnet", "operator", "node", "access", "production"],
  },
  {
    id: "installation",
    title: "Prover Node installation",
    url: "https://docs.fermah.xyz/network/mainnet/installation",
    summary:
      "Installation requirements and setup flow for a Fermah Prover Node, including Linux, Docker, CUDA, configuration, and the signed installer.",
    keywords: ["installation", "prover node", "cuda", "docker", "linux", "operator"],
  },
  {
    id: "multi-gpu",
    title: "Multi-GPU setup",
    url: "https://docs.fermah.xyz/network/mainnet/multi-gpu-setup",
    summary:
      "Configuration guidance for registering and operating multiple GPU machines under a Fermah operator identity.",
    keywords: ["multi-gpu", "gpu", "operator", "machine", "scaling"],
  },
  {
    id: "support",
    title: "Fermah support",
    url: "https://docs.fermah.xyz/network/resources/support",
    summary:
      "Official support and community channels for teams integrating with Fermah or operating proof-generation infrastructure.",
    keywords: ["support", "discord", "help", "integration", "operator"],
  },
];

export const products = [
  {
    name: "Fermah Kernel",
    stage: "Production engine; public builder access appears partner-led",
    purpose: "Compose, execute, and attest deterministic workflows that connect off-chain inputs to on-chain actions.",
    bestFor: ["prediction-market resolution", "custom oracles", "DeFi automation", "cross-protocol sequencing"],
    source: "https://fermah.xyz/kernel",
  },
  {
    name: "Fermah Froben",
    stage: "Live proof market",
    purpose: "Route complex ZK proving pipelines across heterogeneous CPU and GPU operators.",
    bestFor: ["rollups", "zkVM applications", "proof aggregation", "proof infrastructure outsourcing"],
    source: "https://docs.fermah.xyz/network",
  },
  {
    name: "Flashcast Social",
    stage: "Live application",
    purpose: "Create and resolve prediction markets through deterministic Kernel workflows.",
    bestFor: ["social prediction markets", "automated event resolution", "natural-language market creation"],
    source: "https://flashcast.social/",
  },
  {
    name: "Marina",
    stage: "Public documentation pending",
    purpose: "Privacy-preserving data infrastructure for the decentralized web.",
    bestFor: ["privacy-preserving data workflows"],
    source: "https://docs.fermah.xyz/",
  },
];

export const proofSystems = {
  supported: ["Jolt", "Groth16", "RISC Zero zkVM", "Valida", "Stwo", "SP1"],
  planned: ["Nexus 2.0 zkVM", "Stone", "Aztec Proof System"],
  source: "https://docs.fermah.xyz/network/introduction/supported-proof-systems",
  caveat: "Support status can change. Use read_fermah_page with page_id=proof-systems for the latest official page.",
};

export const projectPatterns = [
  {
    terms: ["prediction", "market", "event", "sports", "election"],
    title: "Autonomous prediction market",
    fit: "Kernel",
    outline: [
      "Normalize a user question into an explicit resolution rule.",
      "Compose typed data-source, time-window, aggregation, and threshold nodes.",
      "Execute until the condition is met or the deadline expires.",
      "Publish the attested result for settlement.",
    ],
  },
  {
    terms: ["defi", "liquidity", "position", "rebalance", "trading", "swap"],
    title: "Condition-driven DeFi automation",
    fit: "Kernel",
    outline: [
      "Read market and on-chain state from bounded sources.",
      "Aggregate signals deterministically.",
      "Validate risk limits before emitting an action.",
      "Attest the workflow output for an on-chain executor contract.",
    ],
  },
  {
    terms: ["oracle", "price", "feed", "index", "data"],
    title: "Programmable oracle or custom index",
    fit: "Kernel",
    outline: [
      "Fetch multiple independent sources through typed HTTP or chain-read nodes.",
      "Normalize and aggregate values with deterministic math.",
      "Apply explicit failure, timeout, and retry rules.",
      "Publish the output and execution evidence on-chain.",
    ],
  },
  {
    terms: ["rollup", "proof", "zk", "zkvm", "circuit", "gpu"],
    title: "Proof-as-a-service pipeline",
    fit: "Froben",
    outline: [
      "Package prover and verifier requirements for the target proof system.",
      "Describe resource constraints and the proving workflow.",
      "Submit jobs through the supported Seeker integration path.",
      "Track completion and consume the returned proof in the application.",
    ],
  },
];

export function searchCatalog(query, limit = 5) {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9+-]+/)
    .filter((term) => term.length > 1);

  return officialPages
    .map((page) => {
      const title = page.title.toLowerCase();
      const summary = page.summary.toLowerCase();
      const keywords = page.keywords.join(" ").toLowerCase();
      const score = terms.reduce((total, term) => {
        if (title.includes(term)) return total + 5;
        if (keywords.includes(term)) return total + 3;
        if (summary.includes(term)) return total + 1;
        return total;
      }, 0);
      return { ...page, score };
    })
    .filter((page) => page.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export function chooseProjectPattern(useCase) {
  const normalized = useCase.toLowerCase();
  const ranked = projectPatterns
    .map((pattern) => ({
      ...pattern,
      score: pattern.terms.reduce((total, term) => total + (normalized.includes(term) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked[0].score > 0
    ? ranked[0]
    : {
        title: "Verifiable workflow prototype",
        fit: "Kernel for general workflows; Froben when ZK proof generation is the dominant workload",
        outline: [
          "Define the measurable trigger, inputs, deterministic transformations, and final output.",
          "Identify which inputs are off-chain and how each source can be independently checked.",
          "Separate AI-assisted workflow composition from deterministic execution.",
          "Confirm access and integration details with Fermah before committing to production architecture.",
        ],
      };
}
