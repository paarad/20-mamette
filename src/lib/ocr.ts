import Tesseract from 'tesseract.js';

export async function imageHasText(base64DataUrl: string): Promise<boolean> {
  // Allow disabling OCR via env for speed or to avoid worker issues in some runtimes
  if (process.env.MAMETTE_OCR_ENABLED === 'false') {
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