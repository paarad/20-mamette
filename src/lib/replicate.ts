export async function replicateTextToImage(params: {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
  extraInputs?: Record<string, unknown>;
  modelSlugOverride?: string; // owner/model
  versionOverride?: string;   // version id
}): Promise<string[]> {
  const token = process.env.REPLICATE_API_TOKEN;
  let version = params.versionOverride || process.env.REPLICATE_VERSION;
  const model = params.modelSlugOverride || process.env.REPLICATE_MODEL; // e.g. owner/model slug
  if (!token) {
    throw new Error('Missing REPLICATE_API_TOKEN');
  }

  // Auto-resolve latest version from model slug when no explicit version is provided
  if (!version) {
    if (!model) {
      throw new Error('Missing REPLICATE_VERSION and REPLICATE_MODEL');
    }
    const modelRes = await fetch(`https://api.replicate.com/v1/models/${model}`, {
      headers: { 'Authorization': `Token ${token}` },
    });
    if (!modelRes.ok) {
      const txt = await modelRes.text();
      throw new Error(`Replicate model lookup failed: ${txt}`);
    }
    const modelJson = await modelRes.json();
    type ReplicateModelMeta = { latest_version?: { id?: string } };
    const latestId = (modelJson as ReplicateModelMeta)?.latest_version?.id;
    version = latestId;
    if (!version) {
      throw new Error('Replicate: could not determine latest version for the provided model');
    }
  }

  const input: Record<string, unknown> = {
    prompt: params.prompt,
    negative_prompt: params.negativePrompt || 'text, letters, words, characters, typography, captions, logos, watermarks, glyphs, scripts, symbols, UI',
    width: params.width ?? 1024,
    height: params.height ?? 1792,
    num_outputs: 1,
    num_inference_steps: params.numInferenceSteps ?? 28,
    guidance_scale: params.guidanceScale ?? 3.5,
    ...(params.extraInputs || {}),
  };

  const createRes = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ version, input }),
  });

  if (!createRes.ok) {
    const txt = await createRes.text();
    throw new Error(`Replicate create failed: ${txt}`);
  }

  const created = await createRes.json();
  const predictionUrl: string = (created as { urls?: { get?: string } })?.urls?.get || '';
  if (!predictionUrl) throw new Error('Replicate create: missing prediction URL');

  const startedAt = Date.now();
  const timeoutMs = 180_000;
  const pollMs = 1500;

  while (Date.now() - startedAt < timeoutMs) {
    const pollRes = await fetch(predictionUrl, {
      headers: { 'Authorization': `Token ${token}` },
    });
    if (!pollRes.ok) {
      const txt = await pollRes.text();
      throw new Error(`Replicate poll failed: ${txt}`);
    }
    const body = await pollRes.json();
    const status: string = (body as { status?: string })?.status || '';
    if (status === 'succeeded') {
      const output = (body as { output?: unknown })?.output;
      const urls = extractImageUrlsFromOutput(output);
      return urls;
    }
    if (status === 'failed' || status === 'canceled') {
      const err = (body as { error?: string })?.error || status;
      throw new Error(`Replicate status: ${err}`);
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }

  throw new Error('Replicate generation timed out');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function extractImageUrlsFromOutput(output: unknown): string[] {
  const results: string[] = [];
  const visit = (node: unknown) => {
    if (!node) return;
    if (isString(node)) {
      const s = node.trim();
      // If it's a data URL, accept as-is
      if (s.startsWith('data:image/')) {
        results.push(s);
        return;
      }
      // If it's an http(s) URL, accept
      if (/^https?:\/\//i.test(s)) {
        results.push(s);
        return;
      }
      // If it looks like base64 PNG/JPG without prefix (very heuristic)
      if (/^[A-Za-z0-9+/=]+$/.test(s) && s.length > 1000) {
        // default to PNG
        results.push(`data:image/png;base64,${s}`);
        return;
      }
    } else if (Array.isArray(node)) {
      node.forEach(visit);
    } else if (isRecord(node)) {
      if (isString(node.url)) visit(node.url);
      if (isString((node as Record<string, unknown>).image as string)) visit((node as Record<string, unknown>).image as string);
      if (isString((node as Record<string, unknown>).data as string)) visit((node as Record<string, unknown>).data as string);
      Object.values(node).forEach(visit);
    }
  };
  visit(output);
  return results.filter(Boolean);
}

export async function fetchImageAsDataUrl(urlOrData: string): Promise<string> {
  const s = (urlOrData || '').trim();
  // Already a data URL
  if (s.startsWith('data:image/')) return s;
  // Raw base64
  if (/^[A-Za-z0-9+/=]+$/.test(s) && s.length > 1000) {
    return `data:image/png;base64,${s}`;
  }
  // Fetch from remote URL
  const res = await fetch(s);
  if (!res.ok) throw new Error(`Fetch image failed: ${res.status}`);
  const contentType = res.headers.get('content-type') || 'image/png';
  const ab = await res.arrayBuffer();
  const b64 = Buffer.from(ab).toString('base64');
  return `data:${contentType};base64,${b64}`;
} 