import { NextRequest, NextResponse } from 'next/server';

/** Fonts pdfkit ships with. Anything else would be treated by pdfkit as a file path. */
export const ALLOWED_FONTS = new Set([
  'Helvetica-Bold',
  'Helvetica',
  'Times-Bold',
  'Times-Roman',
  'Courier-Bold',
  'Courier',
]);

export const MAX_CODES = 1000;
export const MAX_CODE_LENGTH = 64;
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_JSON_BYTES = 256 * 1024; // 256 KB

/** Code39 character set (uppercase letters, digits, space and - . $ / + %). */
const CODE39_RE = /^[0-9A-Z \-.$/+%]+$/;

export function isValidCode39(value: string): boolean {
  return value.length > 0 && value.length <= MAX_CODE_LENGTH && CODE39_RE.test(value);
}

export function clampNumber(raw: unknown, fallback: number, min: number, max: number): number {
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function clampInt(raw: unknown, fallback: number, min: number, max: number): number {
  return Math.round(clampNumber(raw, fallback, min, max));
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Fixed-window, in-memory rate limit per client IP and route.
 * Returns a 429 response when the limit is exceeded, otherwise null.
 */
export function rateLimit(
  request: NextRequest,
  route: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now();
  const key = `${route}:${clientIp(request)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return null;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }
  return null;
}

/** Rejects request bodies larger than maxBytes based on Content-Length. */
export function tooLarge(request: NextRequest, maxBytes: number): NextResponse | null {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > maxBytes) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 });
  }
  return null;
}
