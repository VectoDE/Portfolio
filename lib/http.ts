// Request helpers without framework imports, so the unit tests can load them directly.

/** Upper limit for JSON bodies of small form endpoints such as POST /api/register. */
export const MAX_JSON_BODY_BYTES = 16 * 1024

export type LimitedJsonResult =
  /** body is the parsed JSON, or undefined when the body was empty or not valid JSON. */
  | { ok: true; body: unknown }
  | { ok: false; reason: "too-large" }

/** The parts of a Request that readJsonLimited needs; a Request or NextRequest fits. */
export interface JsonBodySource {
  headers: { get(name: string): string | null }
  body: ReadableStream<Uint8Array> | null
}

/**
 * Reads and parses a JSON request body, but never more than maxBytes.
 *
 * A Content-Length above the limit is refused before reading. Otherwise the stream is read chunk
 * by chunk with a byte counter and cancelled as soon as the limit is exceeded, which also covers
 * chunked uploads and a wrong Content-Length. Malformed JSON is not an error here; it yields
 * { ok: true, body: undefined } so the caller decides how to answer.
 */
export async function readJsonLimited(
  req: JsonBodySource,
  maxBytes: number = MAX_JSON_BODY_BYTES,
): Promise<LimitedJsonResult> {
  const declared = req.headers.get("content-length")
  if (declared !== null && /^\d+$/.test(declared.trim()) && Number(declared.trim()) > maxBytes) {
    await req.body?.cancel().catch(() => undefined)
    return { ok: false, reason: "too-large" }
  }

  if (!req.body) {
    return { ok: true, body: undefined }
  }

  const reader = req.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined)
        return { ok: false, reason: "too-large" }
      }
      chunks.push(value)
    }
  } catch {
    // Aborted or broken upload: treated like an unreadable body.
    return { ok: true, body: undefined }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  const text = new TextDecoder().decode(bytes)
  if (!text.trim()) {
    return { ok: true, body: undefined }
  }

  try {
    return { ok: true, body: JSON.parse(text) as unknown }
  } catch {
    return { ok: true, body: undefined }
  }
}
