/**
 * Minimal EXIF parser — read and strip EXIF from JPEG files.
 * Zero dependencies. Works with ArrayBuffer from File/Blob.
 */

// EXIF tag IDs
const TAGS = {
  // IFD0 (main image)
  0x010f: 'make',
  0x0110: 'model',
  0x0112: 'orientation',
  0x011a: 'xResolution',
  0x011b: 'yResolution',
  0x0131: 'software',
  0x0132: 'dateTime',
  0x0213: 'yCbCrPositioning',
  0x8769: '_exifIFDPointer',
  0x8825: '_gpsIFDPointer',
  // Sub-IFD (EXIF)
  0x829a: 'exposureTime',
  0x829d: 'fNumber',
  0x8827: 'iso',
  0x9000: 'exifVersion',
  0x9003: 'dateOriginal',
  0x9004: 'dateDigitized',
  0x9204: 'exposureBias',
  0x9207: 'meteringMode',
  0x9209: 'flash',
  0x920a: 'focalLength',
  0xa001: 'colorSpace',
  0xa002: 'pixelXDimension',
  0xa003: 'pixelYDimension',
  0xa406: 'whiteBalance',
  // GPS IFD
  0x0001: 'gpsLatitudeRef',
  0x0002: 'gpsLatitude',
  0x0003: 'gpsLongitudeRef',
  0x0004: 'gpsLongitude',
  0x0005: 'gpsAltitudeRef',
  0x0006: 'gpsAltitude'
}

// Data type sizes (bytes per component)
const TYPE_SIZES = {
  1: 1,  // BYTE
  2: 1,  // ASCII
  3: 2,  // SHORT
  4: 4,  // LONG
  5: 8,  // RATIONAL (2x LONG)
  7: 1,  // UNDEFINED
  9: 4,  // SLONG
  10: 8  // SRATIONAL
}

/**
 * Parse EXIF metadata from an ArrayBuffer.
 * Returns an object with readable metadata fields, or null if no EXIF found.
 */
export function parseExif(buffer) {
  const view = new DataView(buffer)

  // Check JPEG SOI
  if (view.getUint16(0) !== 0xFFD8) return null

  // Find APP1 (EXIF) segment
  let offset = 2
  while (offset < view.byteLength - 4) {
    const marker = view.getUint16(offset)
    if (marker === 0xFFE1) {
      // Found APP1
      const segLen = view.getUint16(offset + 2)
      // Check "Exif\0\0" header
      if (
        view.getUint8(offset + 4) === 0x45 && // E
        view.getUint8(offset + 5) === 0x78 && // x
        view.getUint8(offset + 6) === 0x69 && // i
        view.getUint8(offset + 7) === 0x66 && // f
        view.getUint8(offset + 8) === 0x00 &&
        view.getUint8(offset + 9) === 0x00
      ) {
        return _parseTIFF(view, offset + 10, segLen - 8)
      }
      offset += 2 + segLen
    } else if ((marker & 0xFF00) === 0xFF00) {
      // Skip other markers
      if (marker === 0xFFDA) break // Start of scan — stop
      offset += 2 + view.getUint16(offset + 2)
    } else {
      break
    }
  }

  return null
}

function _parseTIFF(view, tiffStart, _maxLen) {
  const bo = view.getUint16(tiffStart) === 0x4949 // true = little-endian (II)
  const ifd0Offset = view.getUint32(tiffStart + 4, bo)

  const result = {}

  // Parse IFD0
  const ifd0 = _parseIFD(view, tiffStart, tiffStart + ifd0Offset, bo)
  Object.assign(result, ifd0)

  // Parse Sub-IFD (EXIF)
  if (ifd0._exifIFDPointer) {
    const exifIFD = _parseIFD(view, tiffStart, tiffStart + ifd0._exifIFDPointer, bo)
    delete result._exifIFDPointer
    Object.assign(result, exifIFD)
  }

  // Parse GPS IFD
  if (ifd0._gpsIFDPointer) {
    const gpsIFD = _parseIFD(view, tiffStart, tiffStart + ifd0._gpsIFDPointer, bo, true)
    delete result._gpsIFDPointer
    // Convert GPS coordinates to decimal degrees
    if (gpsIFD.gpsLatitude && gpsIFD.gpsLatitudeRef) {
      result.gpsLatitude = _gpsToDecimal(gpsIFD.gpsLatitude, gpsIFD.gpsLatitudeRef)
    }
    if (gpsIFD.gpsLongitude && gpsIFD.gpsLongitudeRef) {
      result.gpsLongitude = _gpsToDecimal(gpsIFD.gpsLongitude, gpsIFD.gpsLongitudeRef)
    }
    if (gpsIFD.gpsAltitude !== undefined) {
      result.gpsAltitude = gpsIFD.gpsAltitude
      if (gpsIFD.gpsAltitudeRef === 1) result.gpsAltitude = -result.gpsAltitude
    }
  }

  // Clean up internal pointers
  delete result._exifIFDPointer
  delete result._gpsIFDPointer
  delete result.gpsLatitudeRef
  delete result.gpsLongitudeRef
  delete result.gpsAltitudeRef

  return result
}

function _parseIFD(view, tiffStart, ifdStart, le) {
  const result = {}
  try {
    const count = view.getUint16(ifdStart, le)
    for (let i = 0; i < count; i++) {
      const entryOffset = ifdStart + 2 + i * 12
      if (entryOffset + 12 > view.byteLength) break

      const tag = view.getUint16(entryOffset, le)
      const type = view.getUint16(entryOffset + 2, le)
      const numValues = view.getUint32(entryOffset + 4, le)
      const valueOffset = entryOffset + 8

      // Use GPS tags for GPS IFD, regular tags otherwise
      const tagName = TAGS[tag]
      if (!tagName) continue

      const totalBytes = (TYPE_SIZES[type] || 1) * numValues
      const dataOffset = totalBytes > 4
        ? tiffStart + view.getUint32(valueOffset, le)
        : valueOffset

      if (dataOffset + totalBytes > view.byteLength) continue

      result[tagName] = _readValue(view, dataOffset, type, numValues, le)
    }
  } catch {
    // Graceful failure on malformed EXIF
  }
  return result
}

function _readValue(view, offset, type, count, le) {
  switch (type) {
    case 1: // BYTE
    case 7: // UNDEFINED
      return count === 1 ? view.getUint8(offset) : _readBytes(view, offset, count)
    case 2: // ASCII
      return _readString(view, offset, count)
    case 3: // SHORT
      return count === 1 ? view.getUint16(offset, le) : _readShorts(view, offset, count, le)
    case 4: // LONG
      return count === 1 ? view.getUint32(offset, le) : _readLongs(view, offset, count, le)
    case 5: // RATIONAL
      if (count === 1) {
        const num = view.getUint32(offset, le)
        const den = view.getUint32(offset + 4, le)
        return den === 0 ? 0 : num / den
      }
      return _readRationals(view, offset, count, le)
    case 9: // SLONG
      return count === 1 ? view.getInt32(offset, le) : null
    case 10: // SRATIONAL
      if (count === 1) {
        const num = view.getInt32(offset, le)
        const den = view.getInt32(offset + 4, le)
        return den === 0 ? 0 : num / den
      }
      return null
    default:
      return null
  }
}

function _readString(view, offset, count) {
  let str = ''
  for (let i = 0; i < count - 1; i++) { // -1 to skip null terminator
    const c = view.getUint8(offset + i)
    if (c === 0) break
    str += String.fromCharCode(c)
  }
  return str
}

function _readBytes(view, offset, count) {
  const arr = []
  for (let i = 0; i < count; i++) arr.push(view.getUint8(offset + i))
  return arr
}

function _readShorts(view, offset, count, le) {
  const arr = []
  for (let i = 0; i < count; i++) arr.push(view.getUint16(offset + i * 2, le))
  return arr
}

function _readLongs(view, offset, count, le) {
  const arr = []
  for (let i = 0; i < count; i++) arr.push(view.getUint32(offset + i * 4, le))
  return arr
}

function _readRationals(view, offset, count, le) {
  const arr = []
  for (let i = 0; i < count; i++) {
    const num = view.getUint32(offset + i * 8, le)
    const den = view.getUint32(offset + i * 8 + 4, le)
    arr.push(den === 0 ? 0 : num / den)
  }
  return arr
}

function _gpsToDecimal(coords, ref) {
  if (!Array.isArray(coords) || coords.length < 3) return null
  let dec = coords[0] + coords[1] / 60 + coords[2] / 3600
  if (ref === 'S' || ref === 'W') dec = -dec
  return Math.round(dec * 1000000) / 1000000
}

/**
 * Strip EXIF data from a JPEG ArrayBuffer.
 * Returns a new ArrayBuffer with APP1 (EXIF) segments removed.
 * Non-JPEG inputs are returned unchanged.
 */
export function stripExif(buffer) {
  const view = new DataView(buffer)
  if (view.getUint16(0) !== 0xFFD8) return buffer

  const parts = []
  parts.push(new Uint8Array(buffer, 0, 2)) // SOI

  let offset = 2
  while (offset < view.byteLength - 2) {
    const marker = view.getUint16(offset)

    if (marker === 0xFFDA) {
      // Start of scan — copy everything from here to end
      parts.push(new Uint8Array(buffer, offset))
      break
    }

    if ((marker & 0xFF00) !== 0xFF00) break

    const segLen = view.getUint16(offset + 2)
    const segEnd = offset + 2 + segLen

    // Skip APP1 (EXIF) and APP13 (IPTC) segments
    if (marker === 0xFFE1 || marker === 0xFFED) {
      offset = segEnd
      continue
    }

    // Keep all other segments
    parts.push(new Uint8Array(buffer, offset, segEnd - offset))
    offset = segEnd
  }

  // Combine parts
  const totalLen = parts.reduce((sum, p) => sum + p.byteLength, 0)
  const result = new Uint8Array(totalLen)
  let pos = 0
  for (const part of parts) {
    result.set(part, pos)
    pos += part.byteLength
  }
  return result.buffer
}
