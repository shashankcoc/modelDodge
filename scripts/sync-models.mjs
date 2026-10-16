import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/models";

async function fetchOpenRouterModels() {
  console.log("Fetching live models from OpenRouter public API...");
  const response = await fetch(OPENROUTER_API_URL, {
    headers: {
      "HTTP-Referer": "https://modeldodge.app",
      "X-Title": "ModelDodge",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

function parsePrice(priceString) {
  if (!priceString || priceString === "free" || priceString === "$0") return 0;
  const val = parseFloat(priceString);
  if (isNaN(val)) return null;
  // Convert dollars per single token to dollars per million tokens ($/MTok)
  return Math.round(val * 1_000_000 * 1000) / 1000;
}

function normalizeModel(model) {
  const modelId = model.id || "";
  const name = model.name || modelId;
  const lowerId = modelId.toLowerCase();
  const lowerName = name.toLowerCase();

  const isReasoning =
    lowerId.includes("reasoning") ||
    lowerName.includes("reasoning") ||
    lowerId.includes("r1") ||
    lowerId.includes("o1") ||
    lowerId.includes("o3") ||
    lowerId.includes("thinking");

  const inputMods = model.architecture?.input_modalities || [];
  const hasVision =
    inputMods.includes("image") ||
    lowerId.includes("vision") ||
    model.architecture?.modality?.includes("image");

  const isToolCapable =
    model.supported_parameters?.includes("tools") ||
    inputMods.includes("tools") ||
    lowerId.includes("instruct") ||
    !lowerId.includes("base");

  const inputPerMtok = parsePrice(model.pricing?.prompt);
  const outputPerMtok = parsePrice(model.pricing?.completion);
  const cachedPerMtok = parsePrice(model.pricing?.input_cache_read);

  // Extract clean provider name
  let provider = "Unknown";
  if (modelId.includes("/")) {
    const rawProv = modelId.split("/")[0];
    const provMap = {
      anthropic: "Anthropic",
      openai: "OpenAI",
      google: "Google",
      meta: "Meta",
      "meta-llama": "Meta",
      mistralai: "Mistral",
      deepseek: "DeepSeek",
      qwen: "Qwen / Alibaba",
      cohere: "Cohere",
      xai: "xAI",
      "01-ai": "01.AI",
      amazon: "Amazon AWS",
      microsoft: "Microsoft",
      nvidia: "NVIDIA",
      perplexity: "Perplexity",
    };
    provider = provMap[rawProv] || rawProv.charAt(0).toUpperCase() + rawProv.slice(1);
  } else if (model.top_provider?.name) {
    provider = model.top_provider.name;
  }

  const slug = modelId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return {
    id: modelId,
    slug: slug,
    name: name,
    provider: provider,
    provider_id: model.top_provider?.id || modelId.split("/")[0] || null,
    created_date: model.created ? new Date(model.created * 1000).toISOString() : new Date().toISOString(),
    context_length: model.context_length || null,
    pricing: model.pricing ? {
      input_per_mtok: inputPerMtok,
      output_per_mtok: outputPerMtok,
      cached_input_per_mtok: cachedPerMtok,
      source: {
        source: "openrouter",
        source_url: `https://openrouter.ai/models/${modelId}`,
        source_type: "api",
        retrieved_at: new Date().toISOString(),
        evaluation_date: null,
        methodology: "OpenRouter public models API",
        version: "1.0",
      },
    } : null,
    parameters: model.supported_parameters || [],
    modalities: inputMods.length > 0 ? inputMods : ["text"],
    tool_support: isToolCapable,
    reasoning: isReasoning,
    description: model.description || null,
    architecture: model.architecture?.modality || null,
    top_provider: model.top_provider?.name || null,
    canonical_name: name,
    source: {
      source: "openrouter",
      source_url: "https://openrouter.ai/api/v1/models",
      source_type: "api",
      retrieved_at: new Date().toISOString(),
      evaluation_date: null,
      methodology: "OpenRouter public models API",
      version: "1.0",
    },
    overall_score: null,
    reasoning_score: null,
    coding_score: null,
    agentic_score: null,
    math_score: null,
    long_context_score: null,
    vision_score: null,
    speed_score: null,
    cost_score: null,
  };
}

async function sync() {
  try {
    const rawModels = await fetchOpenRouterModels();
    const normalized = rawModels.map(normalizeModel);
    console.log(`Normalized ${normalized.length} models from OpenRouter.`);

    const outputDir = path.resolve(__dirname, "../data");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "models.json");
    fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2));

    const srcDir = path.resolve(__dirname, "../src/data");
    if (fs.existsSync(srcDir)) {
      fs.writeFileSync(path.join(srcDir, "models.json"), JSON.stringify(normalized, null, 2));
    }
    console.log(`Saved ${normalized.length} models to data catalogs.`);
  } catch (err) {
    console.error("Sync error:", err);
    process.exit(1);
  }
}

sync();
