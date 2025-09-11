export async function imageHasText(base64DataUrl: string): Promise<boolean> {
  const enabled = process.env.MAMETTE_OCR_ENABLED === 'true';
  if (!enabled) return false;

  try {
    const { default: Tesseract } = await import('tesseract.js');
    const { data } = await Tesseract.recognize(base64DataUrl, 'eng+fra');
    const text = (data.text || '').replace(/\s+/g, '');
    return text.length > 0;
  } catch (_e) {
    return false;
  }
} 