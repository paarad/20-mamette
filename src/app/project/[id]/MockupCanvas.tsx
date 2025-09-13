"use client";
import { useEffect, useRef, useState } from 'react';

type TemplateKey = 'paperbackFront' | 'hardcoverAngled' | 'stackTop';

export default function MockupCanvas({ imageUrl, defaultTitle, defaultAuthor }: { imageUrl: string; defaultTitle?: string; defaultAuthor?: string; }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [template, setTemplate] = useState<TemplateKey>('paperbackFront');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState<string>(defaultTitle || '');
  const [author, setAuthor] = useState<string>(defaultAuthor || '');

  useEffect(() => { setTitle(defaultTitle || ''); }, [defaultTitle]);
  useEffect(() => { setAuthor(defaultAuthor || ''); }, [defaultAuthor]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!imageUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isCancelled = false;
    setLoading(true);

    const img = new Image();
    const proxied = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (isCancelled) return;
      renderTemplate(ctx, img, template);
      setLoading(false);
    };
    img.onerror = () => setLoading(false);
    img.src = proxied;

    return () => {
      isCancelled = true;
    };
  }, [imageUrl, template]);

  function renderTemplate(ctx: CanvasRenderingContext2D, img: HTMLImageElement, key: TemplateKey) {
    const width = 1400;
    const height = 980; // extra space for caption
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // BG
    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(0, 0, width, height);
    const grad = ctx.createRadialGradient(width * 0.6, height * 0.35, 50, width * 0.6, height * 0.35, Math.max(width, height));
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Mockup area
    if (key === 'paperbackFront') drawPaperbackFront(ctx, img, width, height - 120);
    else if (key === 'hardcoverAngled') drawHardcoverAngled(ctx, img, width, height - 120);
    else drawStackTop(ctx, img, width, height - 120);

    // Caption area (below book)
    const captionY = height - 100;
    ctx.fillStyle = '#111827';
    ctx.font = '700 28px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
    if (title) {
      drawCenteredText(ctx, title, width / 2, captionY);
    }
    ctx.font = '400 22px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillStyle = '#374151';
    if (author) {
      drawCenteredText(ctx, author, width / 2, captionY + 34);
    }
  }

  function drawCenteredText(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number) {
    const maxWidth = 1200;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, y, maxWidth);
  }

  function drawPaperbackFront(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) {
    const bookW = 480;
    const bookH = 720;
    const x = (W - bookW) / 2;
    const y = (H - bookH) / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = '#fff';
    roundRect(ctx, x, y, bookW, bookH, 8);
    ctx.fill();
    ctx.restore();

    drawCoverImageFit(ctx, img, x + 10, y + 10, bookW - 20, bookH - 20);

    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, bookW, bookH, 8);
    ctx.stroke();
  }

  function drawHardcoverAngled(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) {
    const cx = W * 0.45;
    const cy = H * 0.52;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.transform(1, -0.2, 0.2, 1, 0, 0);

    const bookW = 420;
    const bookH = 640;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = '#fff';
    roundRect(ctx, -bookW / 2, -bookH / 2, bookW, bookH, 10);
    ctx.fill();
    ctx.restore();

    drawCoverImageFit(ctx, img, -bookW / 2 + 10, -bookH / 2 + 10, bookW - 20, bookH - 20);

    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    roundRect(ctx, -bookW / 2, -bookH / 2, bookW, bookH, 10);
    ctx.stroke();

    ctx.restore();

    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(cx + 230, cy - 300, 26, 600);
  }

  function drawStackTop(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) {
    const stackX = W * 0.2;
    const stackY = H * 0.35;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = '#fff';
    roundRect(ctx, stackX, stackY, 520, 60, 8);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#f1f5f9';
    roundRect(ctx, stackX + 20, stackY - 40, 520, 60, 8);
    ctx.fill();

    roundRect(ctx, stackX + 40, stackY - 120, 520, 60, 8);
    ctx.fillStyle = '#fff';
    ctx.fill();

    drawCoverImageFit(ctx, img, stackX + 50, stackY - 115, 500, 50);
  }

  function drawCoverImageFit(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
    const iw = img.width;
    const ih = img.height;
    const ir = iw / ih;
    const r = w / h;
    let dw = w;
    let dh = h;
    if (ir > r) {
      dh = w / ir;
      y += (h - dh) / 2;
    } else {
      dw = h * ir;
      x += (w - dw) / 2;
    }
    ctx.drawImage(img, x, y, dw, dh);
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `mamette-mockup-${template}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function quickExport(t: TemplateKey) {
    setTemplate(t);
    // Allow re-render before downloading
    setTimeout(() => handleDownload(), 120);
  }

  const templateOptions: { key: TemplateKey; label: string }[] = [
    { key: 'paperbackFront', label: 'Paperback front' },
    { key: 'hardcoverAngled', label: 'Hardcover angled' },
    { key: 'stackTop', label: 'Stack top' },
  ];

  const [aiStyle, setAiStyle] = useState<string>('studio');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiUrl, setAiUrl] = useState<string>('');
  const [aiError, setAiError] = useState<string>('');

  async function generateAiMockup() {
    if (!imageUrl) return;
    setAiLoading(true);
    setAiUrl('');
    setAiError('');
    try {
      const res = await fetch('/api/mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, style: aiStyle }),
      });
      const json = await res.json();
      if (res.ok && json.url) {
        setAiUrl(json.url);
      } else {
        setAiError(json.error || 'Mockup generation failed');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Mockup generation failed';
      setAiError(message);
    } finally {
      setAiLoading(false);
    }
  }

  function downloadAiMockup() {
    if (!aiUrl) return;
    const link = document.createElement('a');
    link.download = `mamette-ai-mockup-${aiStyle}.png`;
    link.href = `/api/export?url=${encodeURIComponent(aiUrl)}&filename=${encodeURIComponent(`mamette-ai-mockup-${aiStyle}.png`)}`;
    link.click();
  }

  return (
    <div>
      <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {templateOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setTemplate(opt.key)}
                className={`px-3 py-1.5 text-sm rounded-md border whitespace-nowrap ${template===opt.key? 'bg-neutral-900 text-white border-neutral-900':'border-neutral-200 hover:bg-neutral-50'}`}
              >
                {opt.label}
              </button>
            ))}
            <div className="ml-auto">
              <button onClick={handleDownload} className="px-3 py-1.5 text-sm rounded-md bg-neutral-800 text-white hover:bg-neutral-700">Download mockup</button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-500 mr-1">Quick export:</span>
            {templateOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => quickExport(opt.key)}
                className="px-2.5 py-1 text-xs rounded-md border border-neutral-200 hover:bg-neutral-50"
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-600 mb-1">Title (optional)</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm" placeholder="Title" />
            </div>
            <div>
              <label className="block text-xs text-neutral-600 mb-1">Author (optional)</label>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full px-3 py-2 border border-neutral-200 rounded-md text-sm" placeholder="Author" />
            </div>
          </div>

          <div className="mt-2 border-t border-neutral-200 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-neutral-800 mr-2">AI Mockup</span>
              <select value={aiStyle} onChange={(e) => setAiStyle(e.target.value)} className="px-3 py-1.5 border border-neutral-200 rounded-md text-sm">
                <option value="studio">Studio</option>
                <option value="desk">Desk</option>
                <option value="cozy">Cozy</option>
                <option value="minimal">Minimal</option>
              </select>
              <button onClick={generateAiMockup} disabled={aiLoading} className="px-3 py-1.5 text-sm rounded-md bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-60">
                {aiLoading ? 'Generating…' : 'Generate AI Mockup'}
              </button>
              {aiUrl && (
                <button onClick={downloadAiMockup} className="px-3 py-1.5 text-sm rounded-md border border-neutral-200 hover:bg-neutral-50">
                  Download AI Mockup
                </button>
              )}
            </div>
            {aiError && (
              <div className="mt-2 text-sm text-red-600">{aiError}</div>
            )}
            {aiUrl && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={aiUrl} alt="AI mockup" className="w-full rounded-lg border border-neutral-200" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="relative bg-white rounded-xl border border-neutral-200 p-2">
        {loading && <div className="absolute inset-0 flex items-center justify-center text-neutral-500">Preparing mockup…</div>}
        <canvas ref={canvasRef} className="w-full rounded-lg shadow-sm" />
      </div>
    </div>
  );
} 