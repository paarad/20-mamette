import { Buffer } from 'buffer'; // Required for Tesseract.js in some environments

export async function imageHasText(base64DataUrl: string): Promise<boolean> {
  // Make OCR strictly opt-in: only run when explicitly enabled
  if (process.env.MAMETTE_OCR_ENABLED !== 'true') {
    return false;
  }

  try {
    const { default: Tesseract } = await import('tesseract.js');
    const { data } = await Tesseract.recognize(base64DataUrl, 'eng+fra');
    const text = (data.text || '').replace(/\s+/g, '');
    return text.length > 0;
  } catch (_e) {
    // If OCR fails (e.g., worker-script path issue), do not block generation
    return false;
  }
} 