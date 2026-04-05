/**
 * Format detection, AVIF support check, and file size utilities.
 * Zero dependencies.
 */

// Magic byte signatures
const SIGNATURES = [
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46] },
  { mime: 'image/bmp', bytes: [0x42, 0x4D] },
  { mime: 'image/tiff', bytes: [0x49, 0x49, 0x2A, 0x00] },
  { mime: 'image/tiff', bytes: [0x4D, 0x4D, 0x00, 0x2A] }
]

/**
 * Detect MIME type from ArrayBuffer magic bytes.
 */
export function detectMimeType(buffer) {
  const bytes = new Uint8Array(buffer, 0, Math.min(16, buffer.byteLength))

  // Standard signatures
  for (const sig of SIGNATURES) {
    if (sig.bytes.every((b, i) => bytes[i] === b)) return sig.mime
  }

  // WebP: starts with RIFF....WEBP
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'image/webp'
  }

  // AVIF: ftyp box with 'avif' or 'avis' brand
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11])
    if (brand === 'avif' || brand === 'avis') return 'image/avif'
  }

  // HEIC: ftyp box with 'heic' or 'heix' brand
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11])
    if (brand === 'heic' || brand === 'heix' || brand === 'mif1') return 'image/heic'
  }

  return 'application/octet-stream'
}

/**
 * Get short format label from MIME type.
 */
export function getFormatLabel(mime) {
  const labels = {
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
    'image/avif': 'AVIF',
    'image/gif': 'GIF',
    'image/bmp': 'BMP',
    'image/tiff': 'TIFF',
    'image/heic': 'HEIC',
    'image/svg+xml': 'SVG'
  }
  return labels[mime] || 'Unknown'
}

/**
 * Get MIME type from short format name.
 */
export function getMimeType(format) {
  const mimes = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
    bmp: 'image/bmp'
  }
  return mimes[format] || 'image/png'
}

// Cached AVIF support result
let _avifSupported = null

/**
 * Detect if the browser supports AVIF encoding via canvas.toBlob.
 * Result is cached after first call.
 */
export async function detectAVIFSupport() {
  if (_avifSupported !== null) return _avifSupported
  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    _avifSupported = await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob?.type === 'image/avif'),
        'image/avif',
        0.5
      )
    })
  } catch {
    _avifSupported = false
  }
  return _avifSupported
}

/**
 * Format a byte count as a human-readable string.
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * Estimate the output file size for given canvas, format, and quality.
 * Returns byte count via a quick toBlob() call.
 */
export function estimateOutputSize(canvas, format, quality) {
  const mime = getMimeType(format)
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ? blob.size : 0),
      mime,
      format === 'png' ? undefined : quality
    )
  })
}
