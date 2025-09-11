import Tesseract from 'tesseract.js';

export async function imageHasText(base64DataUrl: string): Promise<boolean> {
  try {
    const { data } = await Tesseract.recognize(base64DataUrl, 'eng+fra');
    const text = (data.text || '').replace(/\s+/g, '');
    return text.length > 0;
  } catch (_e) {
    // If OCR fails, be conservative and treat as containing text to avoid leaking typographic images
    return true;
  }
} 