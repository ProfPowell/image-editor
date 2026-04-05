const U = {
  // IFD0 (main image)
  271: "make",
  272: "model",
  274: "orientation",
  282: "xResolution",
  283: "yResolution",
  305: "software",
  306: "dateTime",
  531: "yCbCrPositioning",
  34665: "_exifIFDPointer",
  34853: "_gpsIFDPointer",
  // Sub-IFD (EXIF)
  33434: "exposureTime",
  33437: "fNumber",
  34855: "iso",
  36864: "exifVersion",
  36867: "dateOriginal",
  36868: "dateDigitized",
  37380: "exposureBias",
  37383: "meteringMode",
  37385: "flash",
  37386: "focalLength",
  40961: "colorSpace",
  40962: "pixelXDimension",
  40963: "pixelYDimension",
  41990: "whiteBalance",
  // GPS IFD
  1: "gpsLatitudeRef",
  2: "gpsLatitude",
  3: "gpsLongitudeRef",
  4: "gpsLongitude",
  5: "gpsAltitudeRef",
  6: "gpsAltitude"
}, h = {
  1: 1,
  // BYTE
  2: 1,
  // ASCII
  3: 2,
  // SHORT
  4: 4,
  // LONG
  5: 8,
  // RATIONAL (2x LONG)
  7: 1,
  // UNDEFINED
  9: 4,
  // SLONG
  10: 8
  // SRATIONAL
};
function E(t) {
  const e = new DataView(t);
  if (e.getUint16(0) !== 65496) return null;
  let i = 2;
  for (; i < e.byteLength - 4; ) {
    const n = e.getUint16(i);
    if (n === 65505) {
      const s = e.getUint16(i + 2);
      if (e.getUint8(i + 4) === 69 && // E
      e.getUint8(i + 5) === 120 && // x
      e.getUint8(i + 6) === 105 && // i
      e.getUint8(i + 7) === 102 && // f
      e.getUint8(i + 8) === 0 && e.getUint8(i + 9) === 0)
        return b(e, i + 10);
      i += 2 + s;
    } else if ((n & 65280) === 65280) {
      if (n === 65498) break;
      i += 2 + e.getUint16(i + 2);
    } else
      break;
  }
  return null;
}
function b(t, e, i) {
  const n = t.getUint16(e) === 18761, s = t.getUint32(e + 4, n), r = {}, g = c(t, e, e + s, n);
  if (Object.assign(r, g), g._exifIFDPointer) {
    const a = c(t, e, e + g._exifIFDPointer, n);
    delete r._exifIFDPointer, Object.assign(r, a);
  }
  if (g._gpsIFDPointer) {
    const a = c(t, e, e + g._gpsIFDPointer, n);
    delete r._gpsIFDPointer, a.gpsLatitude && a.gpsLatitudeRef && (r.gpsLatitude = F(a.gpsLatitude, a.gpsLatitudeRef)), a.gpsLongitude && a.gpsLongitudeRef && (r.gpsLongitude = F(a.gpsLongitude, a.gpsLongitudeRef)), a.gpsAltitude !== void 0 && (r.gpsAltitude = a.gpsAltitude, a.gpsAltitudeRef === 1 && (r.gpsAltitude = -r.gpsAltitude));
  }
  return delete r._exifIFDPointer, delete r._gpsIFDPointer, delete r.gpsLatitudeRef, delete r.gpsLongitudeRef, delete r.gpsAltitudeRef, r;
}
function c(t, e, i, n) {
  const s = {};
  try {
    const r = t.getUint16(i, n);
    for (let g = 0; g < r; g++) {
      const a = i + 2 + g * 12;
      if (a + 12 > t.byteLength) break;
      const u = t.getUint16(a, n), o = t.getUint16(a + 2, n), m = t.getUint32(a + 4, n), p = a + 8, f = U[u];
      if (!f) continue;
      const d = (h[o] || 1) * m, l = d > 4 ? e + t.getUint32(p, n) : p;
      l + d > t.byteLength || (s[f] = y(t, l, o, m, n));
    }
  } catch {
  }
  return s;
}
function y(t, e, i, n, s) {
  switch (i) {
    case 1:
    // BYTE
    case 7:
      return n === 1 ? t.getUint8(e) : D(t, e, n);
    case 2:
      return L(t, e, n);
    case 3:
      return n === 1 ? t.getUint16(e, s) : A(t, e, n, s);
    case 4:
      return n === 1 ? t.getUint32(e, s) : I(t, e, n, s);
    case 5:
      if (n === 1) {
        const r = t.getUint32(e, s), g = t.getUint32(e + 4, s);
        return g === 0 ? 0 : r / g;
      }
      return _(t, e, n, s);
    case 9:
      return n === 1 ? t.getInt32(e, s) : null;
    case 10:
      if (n === 1) {
        const r = t.getInt32(e, s), g = t.getInt32(e + 4, s);
        return g === 0 ? 0 : r / g;
      }
      return null;
    default:
      return null;
  }
}
function L(t, e, i) {
  let n = "";
  for (let s = 0; s < i - 1; s++) {
    const r = t.getUint8(e + s);
    if (r === 0) break;
    n += String.fromCharCode(r);
  }
  return n;
}
function D(t, e, i) {
  const n = [];
  for (let s = 0; s < i; s++) n.push(t.getUint8(e + s));
  return n;
}
function A(t, e, i, n) {
  const s = [];
  for (let r = 0; r < i; r++) s.push(t.getUint16(e + r * 2, n));
  return s;
}
function I(t, e, i, n) {
  const s = [];
  for (let r = 0; r < i; r++) s.push(t.getUint32(e + r * 4, n));
  return s;
}
function _(t, e, i, n) {
  const s = [];
  for (let r = 0; r < i; r++) {
    const g = t.getUint32(e + r * 8, n), a = t.getUint32(e + r * 8 + 4, n);
    s.push(a === 0 ? 0 : g / a);
  }
  return s;
}
function F(t, e) {
  if (!Array.isArray(t) || t.length < 3) return null;
  let i = t[0] + t[1] / 60 + t[2] / 3600;
  return (e === "S" || e === "W") && (i = -i), Math.round(i * 1e6) / 1e6;
}
function B(t) {
  const e = new DataView(t);
  if (e.getUint16(0) !== 65496) return t;
  const i = [];
  i.push(new Uint8Array(t, 0, 2));
  let n = 2;
  for (; n < e.byteLength - 2; ) {
    const a = e.getUint16(n);
    if (a === 65498) {
      i.push(new Uint8Array(t, n));
      break;
    }
    if ((a & 65280) !== 65280) break;
    const u = e.getUint16(n + 2), o = n + 2 + u;
    if (a === 65505 || a === 65517) {
      n = o;
      continue;
    }
    i.push(new Uint8Array(t, n, o - n)), n = o;
  }
  const s = i.reduce((a, u) => a + u.byteLength, 0), r = new Uint8Array(s);
  let g = 0;
  for (const a of i)
    r.set(a, g), g += a.byteLength;
  return r.buffer;
}
const P = [
  { mime: "image/jpeg", bytes: [255, 216, 255] },
  { mime: "image/png", bytes: [137, 80, 78, 71] },
  { mime: "image/gif", bytes: [71, 73, 70] },
  { mime: "image/bmp", bytes: [66, 77] },
  { mime: "image/tiff", bytes: [73, 73, 42, 0] },
  { mime: "image/tiff", bytes: [77, 77, 0, 42] }
];
function k(t) {
  const e = new Uint8Array(t, 0, Math.min(16, t.byteLength));
  for (const i of P)
    if (i.bytes.every((n, s) => e[s] === n)) return i.mime;
  if (e[0] === 82 && e[1] === 73 && e[2] === 70 && e[3] === 70 && e[8] === 87 && e[9] === 69 && e[10] === 66 && e[11] === 80)
    return "image/webp";
  if (e[4] === 102 && e[5] === 116 && e[6] === 121 && e[7] === 112) {
    const i = String.fromCharCode(e[8], e[9], e[10], e[11]);
    if (i === "avif" || i === "avis") return "image/avif";
  }
  if (e[4] === 102 && e[5] === 116 && e[6] === 121 && e[7] === 112) {
    const i = String.fromCharCode(e[8], e[9], e[10], e[11]);
    if (i === "heic" || i === "heix" || i === "mif1") return "image/heic";
  }
  return "application/octet-stream";
}
function T(t) {
  return {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WebP",
    "image/avif": "AVIF",
    "image/gif": "GIF",
    "image/bmp": "BMP",
    "image/tiff": "TIFF",
    "image/heic": "HEIC",
    "image/svg+xml": "SVG"
  }[t] || "Unknown";
}
function R(t) {
  return {
    png: "image/png",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    webp: "image/webp",
    avif: "image/avif",
    gif: "image/gif",
    bmp: "image/bmp"
  }[t] || "image/png";
}
let x = null;
async function C() {
  if (x !== null) return x;
  try {
    const t = document.createElement("canvas");
    t.width = t.height = 1, x = await new Promise((e) => {
      t.toBlob(
        (i) => e(i?.type === "image/avif"),
        "image/avif",
        0.5
      );
    });
  } catch {
    x = !1;
  }
  return x;
}
function S(t) {
  return t === 0 ? "0 B" : t < 1024 ? t + " B" : t < 1024 * 1024 ? (t / 1024).toFixed(1) + " KB" : (t / (1024 * 1024)).toFixed(1) + " MB";
}
function j(t, e, i) {
  const n = R(e);
  return new Promise((s) => {
    t.toBlob(
      (r) => s(r ? r.size : 0),
      n,
      e === "png" ? void 0 : i
    );
  });
}
export {
  k as a,
  R as b,
  C as d,
  j as e,
  S as f,
  T as g,
  E as p,
  B as s
};
