import { supabaseAdmin } from './supabaseAdmin';
import { fetchImageAsDataUrl } from './replicate';

const DEFAULT_BUCKET = process.env.MAMETTE_BUCKET || 'mamette-covers';

export async function ensurePublicBucket(bucket: string = DEFAULT_BUCKET): Promise<void> {
  // Try to get bucket; if missing, create it as public
  const { data: list } = await supabaseAdmin.storage.listBuckets();
  const exists = Array.isArray(list) && list.some((b: any) => b.name === bucket); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!exists) {
    await supabaseAdmin.storage.createBucket(bucket, { public: true, fileSizeLimit: '50MB' });
  }
}

export async function uploadDataUrlToBucket(params: {
  dataUrl: string;
  fileName: string; // e.g., projectId/ts-rand.png
  bucket?: string;
}): Promise<string> {
  const bucket = params.bucket || DEFAULT_BUCKET;
  await ensurePublicBucket(bucket);

  const { dataUrl, fileName } = params;
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) throw new Error('Invalid data URL');
  const contentType = match[1] || 'image/png';
  const b64 = match[2];
  const buffer = Buffer.from(b64, 'base64');

  const { error: upErr } = await supabaseAdmin.storage.from(bucket).upload(fileName, buffer, {
    contentType,
    upsert: true,
  });
  if (upErr) throw upErr;

  const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);
  const publicUrl = pub?.publicUrl;
  if (!publicUrl) throw new Error('Failed to get public URL');
  return publicUrl;
}

export async function uploadRemoteImageToBucket(params: {
  urlOrData: string;
  fileName: string;
  bucket?: string;
}): Promise<string> {
  const dataUrl = await fetchImageAsDataUrl(params.urlOrData);
  return uploadDataUrlToBucket({ dataUrl, fileName: params.fileName, bucket: params.bucket });
} 