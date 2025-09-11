export async function replicateTextToImage(params: {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
}): Promise<string[]> {
  const token = process.env.REPLICATE_API_TOKEN;
  const version = process.env.REPLICATE_VERSION; // e.g. a specific version of the chosen model
  if (!token || !version) {
    throw new Error('Missing REPLICATE_API_TOKEN or REPLICATE_VERSION');
  }

  const input = {
    prompt: params.prompt,
    negative_prompt: params.negativePrompt || 'text, letters, words, characters, typography, captions, logos, watermarks, glyphs, scripts, symbols, UI',
    width: params.width ?? 1024,
    height: params.height ?? 1792,
    num_outputs: 1,
    num_inference_steps: params.numInferenceSteps ?? 28,
    guidance_scale: params.guidanceScale ?? 3.5,
  } as Record<string, any>;

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
  const predictionUrl: string = created?.urls?.get;
  if (!predictionUrl) throw new Error('Replicate create: missing prediction URL');

  const startedAt = Date.now();
  const timeoutMs = 120_000;
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
    const status: string = body?.status;
    if (status === 'succeeded') {
      const output: string[] = body?.output || [];
      return Array.isArray(output) ? output : [];
    }
    if (status === 'failed' || status === 'canceled') {
      throw new Error(`Replicate status: ${status}`);
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }

  throw new Error('Replicate generation timed out');
}

export async function fetchImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch image failed: ${res.status}`);
  const contentType = res.headers.get('content-type') || 'image/png';
  const ab = await res.arrayBuffer();
  const b64 = Buffer.from(ab).toString('base64');
  return `data:${contentType};base64,${b64}`;
} 