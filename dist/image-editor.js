import { d as f, a as x, p as y, f as g, e as w, g as C } from "./format-utils-VEGgp_LA.js";
const _ = document.createElement("style");
_.textContent = "image-editor:not(:defined){display:block;opacity:0}";
document.head.appendChild(_);
const p = /* @__PURE__ */ new Set();
let d = null, u = null;
function b() {
  const l = document.documentElement, t = document.body;
  if (!l) return !1;
  if (l.classList.contains("dark") || t?.classList.contains("dark") || l.getAttribute("data-theme") === "dark" || l.getAttribute("data-bs-theme") === "dark" || l.getAttribute("data-mode") === "dark") return !0;
  const i = getComputedStyle(l).colorScheme;
  return !!(i && i.includes("dark") && !i.includes("light"));
}
function m() {
  const l = u;
  if (u = b(), l !== u)
    for (const t of p)
      t._onPageModeChange(u);
}
function k() {
  if (d) return;
  u = b(), d = new MutationObserver(m);
  const l = { attributes: !0, attributeFilter: ["class", "data-theme", "data-bs-theme", "data-mode", "style"] };
  d.observe(document.documentElement, l), document.body && d.observe(document.body, l), window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", m);
}
function z() {
  p.size > 0 || !d || (d.disconnect(), d = null, window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", m));
}
function R(l) {
  p.add(l), k(), l._onPageModeChange(u);
}
function S(l) {
  p.delete(l), z();
}
const n = {
  open: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13V5a1 1 0 0 1 1-1h3l2 2h5a1 1 0 0 1 1 1v1"/><path d="M2 13l1.5-5a1 1 0 0 1 1-.5h9a1 1 0 0 1 1 1.1L13.5 13z"/></svg>',
  crop: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 1v11h11"/><path d="M1 4h11v11"/></svg>',
  rotateLeft: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8a6 6 0 1 1 1.8 4.3"/><path d="M2 4v4h4"/></svg>',
  rotateRight: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 8a6 6 0 1 0-1.8 4.3"/><path d="M14 4v4h-4"/></svg>',
  flipH: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1v14"/><path d="M3 4l-2 4 2 4"/><path d="M13 4l2 4-2 4"/></svg>',
  flipV: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 8h14"/><path d="M4 3L8 1l4 2"/><path d="M4 13l4 2 4-2"/></svg>',
  resize: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="12" height="12" rx="1"/><path d="M7 14V7h7"/></svg>',
  filters: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="4"/><circle cx="10" cy="6" r="4" opacity="0.5"/><circle cx="8" cy="10" r="4" opacity="0.5"/></svg>',
  undo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h7a3 3 0 0 1 0 6H9"/><path d="M6 4L3 7l3 3"/></svg>',
  redo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7H6a3 3 0 0 0 0 6h1"/><path d="M10 4l3 3-3 3"/></svg>',
  zoomIn: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="5"/><path d="M12 12l3 3"/><path d="M5 7h4"/><path d="M7 5v4"/></svg>',
  zoomOut: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="5"/><path d="M12 12l3 3"/><path d="M5 7h4"/></svg>',
  zoomFit: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5V3a1 1 0 0 1 1-1h2"/><path d="M11 2h2a1 1 0 0 1 1 1v2"/><path d="M14 11v2a1 1 0 0 1-1 1h-2"/><path d="M5 14H3a1 1 0 0 1-1-1v-2"/><rect x="4" y="4" width="8" height="8" rx="0.5"/></svg>',
  download: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v8"/><path d="M5 7l3 3 3-3"/><path d="M2 12v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1"/></svg>',
  lock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="10" height="7" rx="1"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>',
  unlock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="10" height="7" rx="1"/><path d="M5 7V5a3 3 0 0 1 6 0"/></svg>',
  check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3 3 7-7"/></svg>',
  x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l8 8"/><path d="M12 4l-8 8"/></svg>',
  info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 7v4"/><path d="M8 5.5v0"/></svg>'
}, M = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
  { label: "2:3", value: 2 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "9:16", value: 9 / 16 }
], $ = [
  { label: "Custom", w: null, h: null },
  { label: "640 x 480", w: 640, h: 480 },
  { label: "800 x 600", w: 800, h: 600 },
  { label: "1024 x 768", w: 1024, h: 768 },
  { label: "1280 x 720", w: 1280, h: 720 },
  { label: "1920 x 1080", w: 1920, h: 1080 }
], h = [
  { name: "brightness", label: "Brightness", min: 0.5, max: 2, step: 0.05, initial: 1, unit: "" },
  { name: "contrast", label: "Contrast", min: 0.5, max: 2, step: 0.05, initial: 1, unit: "" },
  { name: "saturate", label: "Saturation", min: 0, max: 3, step: 0.05, initial: 1, unit: "" },
  { name: "blur", label: "Blur", min: 0, max: 10, step: 0.5, initial: 0, unit: "px" },
  { name: "grayscale", label: "Grayscale", min: 0, max: 100, step: 1, initial: 0, unit: "%" },
  { name: "sepia", label: "Sepia", min: 0, max: 100, step: 1, initial: 0, unit: "%" }
];
class E extends HTMLElement {
  static get observedAttributes() {
    return [
      "src",
      "mode",
      "width",
      "height",
      "format",
      "quality",
      "max-history",
      "readonly",
      "no-toolbar",
      "aspect-ratio"
    ];
  }
  constructor() {
    super(), this.attachShadow({ mode: "open" }), this._sourceCanvas = null, this._sourceCtx = null, this._displayCanvas = null, this._displayCtx = null, this._originalImage = null, this._hasImage = !1, this._isDirty = !1, this._currentTool = null, this._zoom = 1, this._panX = 0, this._panY = 0, this._isPanning = !1, this._panStartX = 0, this._panStartY = 0, this._panStartPanX = 0, this._panStartPanY = 0, this._history = [], this._historyIndex = -1, this._sourceFormat = null, this._sourceFileSize = 0, this._sourceArrayBuffer = null, this._exifData = null, this._avifSupported = !1, this._estimatedSize = 0, this._estimateTimer = null, this._cropRect = null, this._cropHandle = null, this._cropStartX = 0, this._cropStartY = 0, this._cropAspectRatio = null, this._resizeWidth = 0, this._resizeHeight = 0, this._resizeLocked = !0, this._filters = {};
    for (const t of h)
      this._filters[t.name] = t.initial;
    this._handleToolbarClick = this._handleToolbarClick.bind(this), this._handleKeydown = this._handleKeydown.bind(this), this._handleDrop = this._handleDrop.bind(this), this._handleDragOver = this._handleDragOver.bind(this), this._handleDragLeave = this._handleDragLeave.bind(this), this._handleFileChange = this._handleFileChange.bind(this), this._handleWheel = this._handleWheel.bind(this), this._handleCanvasMouseDown = this._handleCanvasMouseDown.bind(this), this._handleCanvasMouseMove = this._handleCanvasMouseMove.bind(this), this._handleCanvasMouseUp = this._handleCanvasMouseUp.bind(this), this._handleContextInput = this._handleContextInput.bind(this), this._handleContextClick = this._handleContextClick.bind(this), this._handleDropZoneClick = this._handleDropZoneClick.bind(this), this._resizeObserver = null;
  }
  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------
  connectedCallback() {
    this.render(), this._attachEventListeners(), R(this), f().then((i) => {
      this._avifSupported = i;
    }), this.src && this.loadImage(this.src), this._resizeObserver = new ResizeObserver(() => {
      this._hasImage && this._redrawDisplay();
    });
    const t = this.shadowRoot.querySelector(".workspace");
    t && this._resizeObserver.observe(t);
  }
  disconnectedCallback() {
    S(this), this._removeEventListeners(), this._resizeObserver && (this._resizeObserver.disconnect(), this._resizeObserver = null);
  }
  attributeChangedCallback(t, i, e) {
    if (!(!this.shadowRoot || i === e)) {
      if (t === "src" && e) {
        this.loadImage(e);
        return;
      }
      if (t === "mode" || t === "no-toolbar" || t === "readonly") {
        this.render(), this._attachEventListeners();
        return;
      }
      (t === "width" || t === "height") && this._updateEditorSize();
    }
  }
  _onPageModeChange(t) {
    this.hasAttribute("mode") || (this.setAttribute("data-page-mode", t ? "dark" : "light"), this.render(), this._attachEventListeners(), this._hasImage && (this._displayCanvas = this.shadowRoot.querySelector(".canvas"), this._displayCtx = this._displayCanvas?.getContext("2d"), this._showCanvas(), this._redrawDisplay()));
  }
  // -------------------------------------------------------------------------
  // Attribute getters/setters
  // -------------------------------------------------------------------------
  get src() {
    return this.getAttribute("src");
  }
  set src(t) {
    t ? this.setAttribute("src", t) : this.removeAttribute("src");
  }
  get mode() {
    return this.getAttribute("mode");
  }
  set mode(t) {
    t ? this.setAttribute("mode", t) : this.removeAttribute("mode");
  }
  get format() {
    return this.getAttribute("format") || "png";
  }
  set format(t) {
    this.setAttribute("format", t);
  }
  get quality() {
    const t = parseFloat(this.getAttribute("quality"));
    return isNaN(t) ? 0.92 : Math.max(0, Math.min(1, t));
  }
  set quality(t) {
    this.setAttribute("quality", String(t));
  }
  get maxHistory() {
    const t = parseInt(this.getAttribute("max-history"));
    return isNaN(t) ? 50 : Math.max(1, t);
  }
  set maxHistory(t) {
    this.setAttribute("max-history", String(t));
  }
  get readonly() {
    return this.hasAttribute("readonly");
  }
  set readonly(t) {
    t ? this.setAttribute("readonly", "") : this.removeAttribute("readonly");
  }
  get noToolbar() {
    return this.hasAttribute("no-toolbar");
  }
  set noToolbar(t) {
    t ? this.setAttribute("no-toolbar", "") : this.removeAttribute("no-toolbar");
  }
  get aspectRatio() {
    const t = this.getAttribute("aspect-ratio");
    if (!t) return null;
    const i = t.split(":").map(Number);
    return i.length === 2 && i[0] > 0 && i[1] > 0 ? i[0] / i[1] : null;
  }
  set aspectRatio(t) {
    t ? this.setAttribute("aspect-ratio", t) : this.removeAttribute("aspect-ratio");
  }
  // -------------------------------------------------------------------------
  // Read-only computed properties
  // -------------------------------------------------------------------------
  get imageWidth() {
    return this._sourceCanvas?.width || 0;
  }
  get imageHeight() {
    return this._sourceCanvas?.height || 0;
  }
  get hasImage() {
    return this._hasImage;
  }
  get isDirty() {
    return this._isDirty;
  }
  get canUndo() {
    return this._historyIndex > 0;
  }
  get canRedo() {
    return this._historyIndex < this._history.length - 1;
  }
  get zoomLevel() {
    return this._zoom;
  }
  get currentTool() {
    return this._currentTool;
  }
  get historyLength() {
    return this._history.length;
  }
  get sourceFormat() {
    return this._sourceFormat;
  }
  get exifData() {
    return this._exifData;
  }
  // -------------------------------------------------------------------------
  // Theme detection
  // -------------------------------------------------------------------------
  get _isDark() {
    if (this.mode === "dark") return !0;
    if (this.mode === "light") return !1;
    const t = this.getAttribute("data-page-mode");
    return t === "dark" ? !0 : t === "light" ? !1 : window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  // -------------------------------------------------------------------------
  // Image loading
  // -------------------------------------------------------------------------
  async loadImage(t) {
    try {
      let i, e = null, o = 0;
      if (t instanceof Blob || t instanceof File)
        o = t.size, e = await t.arrayBuffer(), i = await this._loadBlob(t);
      else if (typeof t == "string") {
        i = await this._loadURL(t);
        try {
          const r = await (await fetch(t)).blob();
          o = r.size, e = await r.arrayBuffer();
        } catch {
        }
      } else
        throw new Error("Invalid image source");
      e ? (this._sourceArrayBuffer = e, this._sourceFormat = x(e), this._sourceFileSize = o, this._exifData = y(e)) : (this._sourceArrayBuffer = null, this._sourceFormat = null, this._sourceFileSize = o, this._exifData = null), this._sourceCanvas = document.createElement("canvas"), this._sourceCanvas.width = i.naturalWidth || i.width, this._sourceCanvas.height = i.naturalHeight || i.height, this._sourceCtx = this._sourceCanvas.getContext("2d"), this._sourceCtx.drawImage(i, 0, 0), this._originalImage = this._sourceCtx.getImageData(
        0,
        0,
        this._sourceCanvas.width,
        this._sourceCanvas.height
      ), this._hasImage = !0, this._isDirty = !1, this._history = [], this._historyIndex = -1, this._pushHistory(), this._resetFilters(), this._currentTool = null, this._displayCanvas = this.shadowRoot.querySelector(".canvas"), this._displayCtx = this._displayCanvas?.getContext("2d"), this._showCanvas(), this.zoomToFit(), this._updateStatus(), this._updateToolbarState(), this.dispatchEvent(new CustomEvent("image-load", {
        bubbles: !0,
        composed: !0,
        detail: {
          width: this._sourceCanvas.width,
          height: this._sourceCanvas.height,
          src: typeof t == "string" ? t : t.name || "blob"
        }
      }));
    } catch (i) {
      console.error("image-editor: failed to load image", i), this.dispatchEvent(new CustomEvent("image-load-error", {
        bubbles: !0,
        composed: !0,
        detail: {
          src: typeof t == "string" ? t : "blob",
          error: i.message
        }
      }));
    }
  }
  _loadURL(t) {
    return new Promise((i, e) => {
      const o = new Image();
      o.crossOrigin = "anonymous", o.onload = () => i(o), o.onerror = () => e(new Error(`Failed to load image: ${t}`)), o.src = t;
    });
  }
  _loadBlob(t) {
    return new Promise((i, e) => {
      const o = URL.createObjectURL(t), a = new Image();
      a.onload = () => {
        URL.revokeObjectURL(o), i(a);
      }, a.onerror = () => {
        URL.revokeObjectURL(o), e(new Error("Failed to load image from blob"));
      }, a.src = o;
    });
  }
  // -------------------------------------------------------------------------
  // Canvas display
  // -------------------------------------------------------------------------
  _showCanvas() {
    const t = this.shadowRoot.querySelector(".drop-zone"), i = this.shadowRoot.querySelector(".canvas");
    t && (t.hidden = !0), i && (i.hidden = !1);
  }
  _hideCanvas() {
    const t = this.shadowRoot.querySelector(".drop-zone"), i = this.shadowRoot.querySelector(".canvas");
    t && (t.hidden = !1), i && (i.hidden = !0);
  }
  _redrawDisplay() {
    if (!this._sourceCanvas || !this._displayCanvas || !this._displayCtx) return;
    const t = this.shadowRoot.querySelector(".workspace");
    if (!t) return;
    const i = t.getBoundingClientRect(), e = window.devicePixelRatio || 1;
    this._displayCanvas.width = i.width * e, this._displayCanvas.height = i.height * e, this._displayCanvas.style.width = i.width + "px", this._displayCanvas.style.height = i.height + "px";
    const o = this._displayCtx;
    o.setTransform(e, 0, 0, e, 0, 0), o.clearRect(0, 0, i.width, i.height);
    const a = this._sourceCanvas.width * this._zoom, r = this._sourceCanvas.height * this._zoom, s = (i.width - a) / 2 + this._panX, c = (i.height - r) / 2 + this._panY, v = this._buildFilterString();
    o.save(), v !== "none" && (o.filter = v), o.imageSmoothingEnabled = !0, o.imageSmoothingQuality = "high", o.drawImage(this._sourceCanvas, s, c, a, r), o.restore(), this._imageRect = { x: s, y: c, w: a, h: r };
  }
  // -------------------------------------------------------------------------
  // Zoom & Pan
  // -------------------------------------------------------------------------
  zoomTo(t) {
    this._zoom = Math.max(0.1, Math.min(5, t)), this._redrawDisplay(), this._updateZoomLabel(), this.dispatchEvent(new CustomEvent("zoom-change", {
      bubbles: !0,
      composed: !0,
      detail: { level: this._zoom }
    }));
  }
  zoomToFit() {
    if (!this._sourceCanvas) return;
    const t = this.shadowRoot.querySelector(".workspace");
    if (!t) return;
    const i = t.getBoundingClientRect(), e = 20, o = (i.width - e * 2) / this._sourceCanvas.width, a = (i.height - e * 2) / this._sourceCanvas.height;
    this._zoom = Math.min(1, Math.min(o, a)), this._panX = 0, this._panY = 0, this._redrawDisplay(), this._updateZoomLabel(), this.dispatchEvent(new CustomEvent("zoom-change", {
      bubbles: !0,
      composed: !0,
      detail: { level: this._zoom }
    }));
  }
  _updateZoomLabel() {
    const t = this.shadowRoot.querySelector(".zoom-label");
    t && (t.textContent = Math.round(this._zoom * 100) + "%");
  }
  // -------------------------------------------------------------------------
  // History (undo/redo)
  // -------------------------------------------------------------------------
  _pushHistory() {
    if (!this._sourceCanvas) return;
    this._historyIndex < this._history.length - 1 && (this._history = this._history.slice(0, this._historyIndex + 1));
    const t = this._sourceCtx.getImageData(
      0,
      0,
      this._sourceCanvas.width,
      this._sourceCanvas.height
    );
    for (this._history.push({
      imageData: t,
      width: this._sourceCanvas.width,
      height: this._sourceCanvas.height
    }), this._historyIndex = this._history.length - 1; this._history.length > this.maxHistory; )
      this._history.shift(), this._historyIndex--;
    this._updateToolbarState(), this.dispatchEvent(new CustomEvent("history-change", {
      bubbles: !0,
      composed: !0,
      detail: { canUndo: this.canUndo, canRedo: this.canRedo, length: this._history.length }
    }));
  }
  undo() {
    !this.canUndo || this.readonly || (this._historyIndex--, this._restoreFromHistory(), this._updateToolbarState(), this.dispatchEvent(new CustomEvent("history-change", {
      bubbles: !0,
      composed: !0,
      detail: { canUndo: this.canUndo, canRedo: this.canRedo, length: this._history.length }
    })));
  }
  redo() {
    !this.canRedo || this.readonly || (this._historyIndex++, this._restoreFromHistory(), this._updateToolbarState(), this.dispatchEvent(new CustomEvent("history-change", {
      bubbles: !0,
      composed: !0,
      detail: { canUndo: this.canUndo, canRedo: this.canRedo, length: this._history.length }
    })));
  }
  _restoreFromHistory() {
    const t = this._history[this._historyIndex];
    t && (this._sourceCanvas.width = t.width, this._sourceCanvas.height = t.height, this._sourceCtx.putImageData(t.imageData, 0, 0), this._redrawDisplay(), this._updateStatus());
  }
  reset() {
    !this._originalImage || this.readonly || (this._sourceCanvas.width = this._originalImage.width, this._sourceCanvas.height = this._originalImage.height, this._sourceCtx.putImageData(this._originalImage, 0, 0), this._resetFilters(), this._pushHistory(), this._isDirty = !1, this.zoomToFit(), this._updateStatus());
  }
  // -------------------------------------------------------------------------
  // Edit operations
  // -------------------------------------------------------------------------
  rotate(t) {
    if (!this._hasImage || this.readonly) return;
    const i = (t % 360 + 360) % 360 / 90;
    if (i === 0) return;
    const e = this._sourceCanvas.width, o = this._sourceCanvas.height, a = document.createElement("canvas"), r = a.getContext("2d");
    i === 1 || i === 3 ? (a.width = o, a.height = e) : (a.width = e, a.height = o), r.save(), r.translate(a.width / 2, a.height / 2), r.rotate(i * 90 * Math.PI / 180), r.drawImage(this._sourceCanvas, -e / 2, -o / 2), r.restore(), this._sourceCanvas.width = a.width, this._sourceCanvas.height = a.height, this._sourceCtx.drawImage(a, 0, 0), this._isDirty = !0, this._pushHistory(), this.zoomToFit(), this._updateStatus(), this.dispatchEvent(new CustomEvent("image-edit", {
      bubbles: !0,
      composed: !0,
      detail: { action: "rotate", params: { degrees: t } }
    }));
  }
  flipHorizontal() {
    if (!this._hasImage || this.readonly) return;
    const t = this._sourceCanvas.width, i = this._sourceCanvas.height, e = document.createElement("canvas");
    e.width = t, e.height = i;
    const o = e.getContext("2d");
    o.translate(t, 0), o.scale(-1, 1), o.drawImage(this._sourceCanvas, 0, 0), this._sourceCtx.clearRect(0, 0, t, i), this._sourceCtx.drawImage(e, 0, 0), this._isDirty = !0, this._pushHistory(), this._redrawDisplay(), this.dispatchEvent(new CustomEvent("image-edit", {
      bubbles: !0,
      composed: !0,
      detail: { action: "flip-horizontal" }
    }));
  }
  flipVertical() {
    if (!this._hasImage || this.readonly) return;
    const t = this._sourceCanvas.width, i = this._sourceCanvas.height, e = document.createElement("canvas");
    e.width = t, e.height = i;
    const o = e.getContext("2d");
    o.translate(0, i), o.scale(1, -1), o.drawImage(this._sourceCanvas, 0, 0), this._sourceCtx.clearRect(0, 0, t, i), this._sourceCtx.drawImage(e, 0, 0), this._isDirty = !0, this._pushHistory(), this._redrawDisplay(), this.dispatchEvent(new CustomEvent("image-edit", {
      bubbles: !0,
      composed: !0,
      detail: { action: "flip-vertical" }
    }));
  }
  resize(t, i) {
    if (!this._hasImage || this.readonly) return;
    t = Math.max(1, Math.round(t)), i = Math.max(1, Math.round(i));
    const e = document.createElement("canvas");
    e.width = t, e.height = i;
    const o = e.getContext("2d");
    o.imageSmoothingEnabled = !0, o.imageSmoothingQuality = "high", o.drawImage(this._sourceCanvas, 0, 0, t, i), this._sourceCanvas.width = t, this._sourceCanvas.height = i, this._sourceCtx.drawImage(e, 0, 0), this._isDirty = !0, this._pushHistory(), this.zoomToFit(), this._updateStatus(), this.dispatchEvent(new CustomEvent("image-edit", {
      bubbles: !0,
      composed: !0,
      detail: { action: "resize", params: { width: t, height: i } }
    }));
  }
  crop(t, i, e, o) {
    if (!this._hasImage || this.readonly) return;
    t = Math.max(0, Math.round(t)), i = Math.max(0, Math.round(i)), e = Math.max(1, Math.round(Math.min(e, this._sourceCanvas.width - t))), o = Math.max(1, Math.round(Math.min(o, this._sourceCanvas.height - i)));
    const a = this._sourceCtx.getImageData(t, i, e, o);
    this._sourceCanvas.width = e, this._sourceCanvas.height = o, this._sourceCtx.putImageData(a, 0, 0), this._isDirty = !0, this._pushHistory(), this.zoomToFit(), this._updateStatus(), this.dispatchEvent(new CustomEvent("image-edit", {
      bubbles: !0,
      composed: !0,
      detail: { action: "crop", params: { x: t, y: i, width: e, height: o } }
    }));
  }
  // -------------------------------------------------------------------------
  // Filters
  // -------------------------------------------------------------------------
  applyFilter(t, i) {
    if (!this._hasImage || this.readonly) return;
    const e = h.find((o) => o.name === t);
    e && (this._filters[t] = Math.max(e.min, Math.min(e.max, i)), this._redrawDisplay());
  }
  resetFilters() {
    this._resetFilters(), this._redrawDisplay(), this._updateFilterSliders();
  }
  _resetFilters() {
    for (const t of h)
      this._filters[t.name] = t.initial;
  }
  _buildFilterString() {
    const t = [];
    for (const i of h) {
      const e = this._filters[i.name];
      e !== i.initial && t.push(`${i.name}(${e}${i.unit})`);
    }
    return t.length > 0 ? t.join(" ") : "none";
  }
  _hasActiveFilters() {
    return h.some((t) => this._filters[t.name] !== t.initial);
  }
  _commitFilters() {
    if (!this._hasActiveFilters() || this.readonly) return;
    const t = this._sourceCanvas.width, i = this._sourceCanvas.height, e = document.createElement("canvas");
    e.width = t, e.height = i;
    const o = e.getContext("2d");
    o.filter = this._buildFilterString(), o.drawImage(this._sourceCanvas, 0, 0), this._sourceCtx.clearRect(0, 0, t, i), this._sourceCtx.drawImage(e, 0, 0), this._resetFilters(), this._isDirty = !0, this._pushHistory(), this._redrawDisplay(), this._updateFilterSliders(), this.dispatchEvent(new CustomEvent("image-edit", {
      bubbles: !0,
      composed: !0,
      detail: { action: "filter" }
    }));
  }
  // -------------------------------------------------------------------------
  // Export
  // -------------------------------------------------------------------------
  getDataURL(t, i) {
    if (!this._sourceCanvas) return "";
    const e = t || this.format, o = i !== void 0 ? i : this.quality, a = e === "jpeg" ? "image/jpeg" : e === "webp" ? "image/webp" : "image/png";
    if (this._hasActiveFilters()) {
      const r = document.createElement("canvas");
      r.width = this._sourceCanvas.width, r.height = this._sourceCanvas.height;
      const s = r.getContext("2d");
      return s.filter = this._buildFilterString(), s.drawImage(this._sourceCanvas, 0, 0), r.toDataURL(a, o);
    }
    return this._sourceCanvas.toDataURL(a, o);
  }
  async getBlob(t, i) {
    if (!this._sourceCanvas) return null;
    const e = t || this.format, o = i !== void 0 ? i : this.quality, a = e === "jpeg" ? "image/jpeg" : e === "webp" ? "image/webp" : "image/png";
    let r = this._sourceCanvas;
    if (this._hasActiveFilters()) {
      r = document.createElement("canvas"), r.width = this._sourceCanvas.width, r.height = this._sourceCanvas.height;
      const s = r.getContext("2d");
      s.filter = this._buildFilterString(), s.drawImage(this._sourceCanvas, 0, 0);
    }
    return new Promise((s) => {
      r.toBlob((c) => s(c), a, o);
    });
  }
  async download(t, i, e) {
    const o = i || this.format, a = await this.getBlob(o, e);
    if (!a) return;
    const r = t || `image.${o}`, s = URL.createObjectURL(a), c = document.createElement("a");
    c.href = s, c.download = r, c.click(), URL.revokeObjectURL(s), this.dispatchEvent(new CustomEvent("image-export", {
      bubbles: !0,
      composed: !0,
      detail: { format: o, quality: e || this.quality, size: a.size }
    }));
  }
  // -------------------------------------------------------------------------
  // Tool management
  // -------------------------------------------------------------------------
  _setTool(t) {
    const i = this._currentTool;
    i === t ? (this._currentTool = null, this._hideCropOverlay(), this._hideContextBar()) : (this._currentTool = t, this._hideCropOverlay(), this._showContextBar(t), t === "crop" && this._initCrop(), t === "export" && this._updateEstimatedSize()), this._updateToolbarState(), this.dispatchEvent(new CustomEvent("tool-change", {
      bubbles: !0,
      composed: !0,
      detail: { tool: this._currentTool, previous: i }
    }));
  }
  // -------------------------------------------------------------------------
  // Crop tool
  // -------------------------------------------------------------------------
  _initCrop() {
    if (!this._hasImage || !this._imageRect) return;
    const t = this._imageRect, i = Math.min(t.w, t.h) * 0.1;
    this._cropRect = {
      x: t.x + i,
      y: t.y + i,
      w: t.w - i * 2,
      h: t.h - i * 2
    }, this._cropAspectRatio = this.aspectRatio || null, this._cropAspectRatio && this._constrainCropToAspect(), this._showCropOverlay();
  }
  _showCropOverlay() {
    const t = this.shadowRoot.querySelector(".crop-overlay");
    t && (t.hidden = !1, this.shadowRoot.querySelectorAll(".crop-dim").forEach((i) => i.hidden = !1), this._updateCropOverlay());
  }
  _hideCropOverlay() {
    const t = this.shadowRoot.querySelector(".crop-overlay");
    t && (t.hidden = !0), this.shadowRoot.querySelectorAll(".crop-dim").forEach((i) => i.hidden = !0), this._cropRect = null;
  }
  _updateCropOverlay() {
    const t = this.shadowRoot.querySelector(".crop-overlay");
    if (!t || !this._cropRect || !this._imageRect) return;
    const i = this._cropRect, e = this._imageRect;
    i.x = Math.max(e.x, Math.min(i.x, e.x + e.w - 20)), i.y = Math.max(e.y, Math.min(i.y, e.y + e.h - 20)), i.w = Math.max(20, Math.min(i.w, e.x + e.w - i.x)), i.h = Math.max(20, Math.min(i.h, e.y + e.h - i.y)), t.style.left = i.x + "px", t.style.top = i.y + "px", t.style.width = i.w + "px", t.style.height = i.h + "px";
    const a = this.shadowRoot.querySelector(".workspace")?.querySelectorAll(".crop-dim");
    a.length === 4 && (a[0].style.cssText = `left:${e.x}px;top:${e.y}px;width:${e.w}px;height:${i.y - e.y}px`, a[1].style.cssText = `left:${e.x}px;top:${i.y + i.h}px;width:${e.w}px;height:${e.y + e.h - i.y - i.h}px`, a[2].style.cssText = `left:${e.x}px;top:${i.y}px;width:${i.x - e.x}px;height:${i.h}px`, a[3].style.cssText = `left:${i.x + i.w}px;top:${i.y}px;width:${e.x + e.w - i.x - i.w}px;height:${i.h}px`);
  }
  _constrainCropToAspect() {
    if (!this._cropRect || !this._cropAspectRatio) return;
    const t = this._cropRect, i = t.h * this._cropAspectRatio;
    if (i <= t.w)
      t.x += (t.w - i) / 2, t.w = i;
    else {
      const e = t.w / this._cropAspectRatio;
      t.y += (t.h - e) / 2, t.h = e;
    }
  }
  _applyCrop() {
    if (!this._cropRect || !this._imageRect) return;
    const t = this._imageRect, i = this._cropRect, e = (i.x - t.x) / this._zoom, o = (i.y - t.y) / this._zoom, a = i.w / this._zoom, r = i.h / this._zoom;
    this._hideCropOverlay(), this._currentTool = null, this._hideContextBar(), this._updateToolbarState(), this.crop(e, o, a, r);
  }
  _getCropHandle(t, i) {
    if (!this._cropRect) return null;
    const e = this._cropRect, o = 8, a = [
      { name: "nw", x: e.x, y: e.y },
      { name: "ne", x: e.x + e.w, y: e.y },
      { name: "sw", x: e.x, y: e.y + e.h },
      { name: "se", x: e.x + e.w, y: e.y + e.h },
      { name: "n", x: e.x + e.w / 2, y: e.y },
      { name: "s", x: e.x + e.w / 2, y: e.y + e.h },
      { name: "w", x: e.x, y: e.y + e.h / 2 },
      { name: "e", x: e.x + e.w, y: e.y + e.h / 2 }
    ];
    for (const r of a)
      if (Math.abs(t - r.x) <= o && Math.abs(i - r.y) <= o) return r.name;
    return t >= e.x && t <= e.x + e.w && i >= e.y && i <= e.y + e.h ? "move" : null;
  }
  // -------------------------------------------------------------------------
  // Context bar
  // -------------------------------------------------------------------------
  _showContextBar(t) {
    const i = this.shadowRoot.querySelector(".context-bar");
    i && (i.hidden = !1, i.innerHTML = this._getContextBarHTML(t));
  }
  _hideContextBar() {
    const t = this.shadowRoot.querySelector(".context-bar");
    t && (t.hidden = !0, t.innerHTML = "");
  }
  _getContextBarHTML(t) {
    if (t === "crop")
      return `
        <div class="context-group">
          <span class="context-label">Aspect:</span>
          ${M.map((e) => `<button class="context-btn ${e.value === null && !this._cropAspectRatio || e.value !== null && Math.abs(e.value - this._cropAspectRatio) < 0.01 ? "active" : ""}" data-context-action="crop-aspect" data-value="${e.value}">${e.label}</button>`).join("")}
        </div>
        <div class="context-group context-actions">
          <button class="context-btn primary" data-context-action="crop-apply">${n.check} Apply</button>
          <button class="context-btn" data-context-action="crop-cancel">${n.x} Cancel</button>
        </div>`;
    if (t === "resize") {
      const i = this._resizeWidth || this.imageWidth, e = this._resizeHeight || this.imageHeight;
      return `
        <div class="context-group">
          <span class="context-label">Size:</span>
          <select class="context-select" data-context-action="resize-preset">${$.map(
        (a) => `<option value="${a.w}x${a.h}" ${a.w === i && a.h === e ? "selected" : ""}>${a.label}</option>`
      ).join("")}</select>
          <input type="number" class="context-input" data-context-action="resize-w" value="${i}" min="1" max="10000" aria-label="Width">
          <span class="context-label">x</span>
          <input type="number" class="context-input" data-context-action="resize-h" value="${e}" min="1" max="10000" aria-label="Height">
          <button class="context-btn icon-btn ${this._resizeLocked ? "active" : ""}" data-context-action="resize-lock" aria-label="Lock aspect ratio" title="Lock aspect ratio">${this._resizeLocked ? n.lock : n.unlock}</button>
        </div>
        <div class="context-group context-actions">
          <button class="context-btn primary" data-context-action="resize-apply">${n.check} Apply</button>
          <button class="context-btn" data-context-action="resize-cancel">${n.x} Cancel</button>
        </div>`;
    }
    if (t === "filters")
      return `
        <div class="context-group context-filters">
          ${h.map(
        (e) => `
        <div class="filter-slider">
          <label>${e.label}</label>
          <input type="range" min="${e.min}" max="${e.max}" step="${e.step}" value="${this._filters[e.name]}" data-context-action="filter-slider" data-filter="${e.name}" aria-label="${e.label}">
          <span class="filter-value">${this._filters[e.name]}${e.unit}</span>
        </div>`
      ).join("")}
        </div>
        <div class="context-group context-actions">
          <button class="context-btn primary" data-context-action="filter-apply">${n.check} Apply</button>
          <button class="context-btn" data-context-action="filter-reset">${n.x} Reset</button>
        </div>`;
    if (t === "export") {
      const i = this._avifSupported ? `<option value="avif" ${this.format === "avif" ? "selected" : ""}>AVIF</option>` : "", e = this._estimatedSize > 0 ? g(this._estimatedSize) : "...";
      return `
        <div class="context-group">
          <span class="context-label">Format:</span>
          <select class="context-select" data-context-action="export-format">
            <option value="png" ${this.format === "png" ? "selected" : ""}>PNG</option>
            <option value="jpeg" ${this.format === "jpeg" ? "selected" : ""}>JPEG</option>
            <option value="webp" ${this.format === "webp" ? "selected" : ""}>WebP</option>
            ${i}
          </select>
          <span class="context-label quality-label">Quality:</span>
          <input type="range" class="context-range" min="0.1" max="1" step="0.05" value="${this.quality}" data-context-action="export-quality" aria-label="Export quality">
          <span class="quality-value">${Math.round(this.quality * 100)}%</span>
          <span class="context-label">≈</span>
          <span class="estimated-size">${e}</span>
        </div>
        <div class="context-group context-actions">
          <button class="context-btn primary" data-context-action="export-download">${n.download} Download</button>
        </div>`;
    }
    if (t === "metadata") {
      if (!this._exifData || Object.keys(this._exifData).length === 0)
        return '<div class="context-group"><span class="context-label">No EXIF metadata found in this image.</span></div>';
      const i = [], e = this._exifData;
      return e.make && i.push(["Camera", `${e.make}${e.model ? " " + e.model : ""}`]), (e.dateOriginal || e.dateTime) && i.push(["Date", e.dateOriginal || e.dateTime]), e.pixelXDimension && e.pixelYDimension && i.push(["Original Size", `${e.pixelXDimension} × ${e.pixelYDimension}`]), e.orientation && i.push(["Orientation", e.orientation]), e.exposureTime && i.push(["Exposure", e.exposureTime < 1 ? `1/${Math.round(1 / e.exposureTime)}s` : `${e.exposureTime}s`]), e.fNumber && i.push(["Aperture", `f/${e.fNumber}`]), e.iso && i.push(["ISO", e.iso]), e.focalLength && i.push(["Focal Length", `${e.focalLength}mm`]), e.flash !== void 0 && i.push(["Flash", e.flash & 1 ? "Fired" : "No flash"]), e.software && i.push(["Software", e.software]), e.gpsLatitude !== void 0 && e.gpsLongitude !== void 0 && i.push(["GPS", `${e.gpsLatitude.toFixed(4)}, ${e.gpsLongitude.toFixed(4)}`]), e.colorSpace && i.push(["Color Space", e.colorSpace === 1 ? "sRGB" : e.colorSpace === 65535 ? "Uncalibrated" : e.colorSpace]), e.whiteBalance !== void 0 && i.push(["White Balance", e.whiteBalance === 0 ? "Auto" : "Manual"]), `<div class="context-group context-metadata"><div class="meta-grid">${i.map(
        ([a, r]) => `<span class="meta-key">${a}</span><span class="meta-value">${r}</span>`
      ).join("")}</div></div>`;
    }
    return "";
  }
  _updateEstimatedSize() {
    !this._sourceCanvas || this._currentTool !== "export" || (clearTimeout(this._estimateTimer), this._estimateTimer = setTimeout(async () => {
      const t = this.shadowRoot.querySelector('[data-context-action="export-format"]'), i = this.shadowRoot.querySelector('[data-context-action="export-quality"]'), e = t?.value || this.format, o = i ? parseFloat(i.value) : this.quality;
      this._estimatedSize = await w(this._sourceCanvas, e, o);
      const a = this.shadowRoot.querySelector(".estimated-size");
      a && (a.textContent = g(this._estimatedSize));
    }, 200));
  }
  _updateFilterSliders() {
    const t = this.shadowRoot.querySelector(".context-bar");
    if (!t || this._currentTool !== "filters") return;
    t.querySelectorAll("input[data-filter]").forEach((e) => {
      const o = e.getAttribute("data-filter");
      if (this._filters[o] !== void 0) {
        e.value = this._filters[o];
        const a = e.parentElement.querySelector(".filter-value"), r = h.find((s) => s.name === o);
        a && r && (a.textContent = this._filters[o] + r.unit);
      }
    });
  }
  // -------------------------------------------------------------------------
  // Event handling
  // -------------------------------------------------------------------------
  _attachEventListeners() {
    this._removeEventListeners();
    const t = this.shadowRoot.querySelector(".toolbar");
    t && t.addEventListener("click", this._handleToolbarClick);
    const i = this.shadowRoot.querySelector(".workspace");
    i && (i.addEventListener("drop", this._handleDrop), i.addEventListener("dragover", this._handleDragOver), i.addEventListener("dragleave", this._handleDragLeave), i.addEventListener("wheel", this._handleWheel, { passive: !1 })), i && i.addEventListener("mousedown", this._handleCanvasMouseDown);
    const e = this.shadowRoot.querySelector(".drop-zone");
    e && e.addEventListener("click", this._handleDropZoneClick);
    const o = this.shadowRoot.querySelector(".file-input");
    o && o.addEventListener("change", this._handleFileChange);
    const a = this.shadowRoot.querySelector(".context-bar");
    a && (a.addEventListener("input", this._handleContextInput), a.addEventListener("click", this._handleContextClick), a.addEventListener("change", this._handleContextInput)), document.addEventListener("mousemove", this._handleCanvasMouseMove), document.addEventListener("mouseup", this._handleCanvasMouseUp), document.addEventListener("keydown", this._handleKeydown);
  }
  _removeEventListeners() {
    document.removeEventListener("mousemove", this._handleCanvasMouseMove), document.removeEventListener("mouseup", this._handleCanvasMouseUp), document.removeEventListener("keydown", this._handleKeydown);
  }
  _handleToolbarClick(t) {
    const i = t.target.closest("[data-action]");
    if (!i || i.disabled) return;
    const e = i.getAttribute("data-action");
    if (!(this.readonly && e !== "zoom-in" && e !== "zoom-out" && e !== "zoom-fit" && e !== "export"))
      switch (e) {
        case "open":
          this.shadowRoot.querySelector(".file-input")?.click();
          break;
        case "crop":
          this._setTool("crop");
          break;
        case "rotate-left":
          this.rotate(-90);
          break;
        case "rotate-right":
          this.rotate(90);
          break;
        case "flip-h":
          this.flipHorizontal();
          break;
        case "flip-v":
          this.flipVertical();
          break;
        case "resize":
          this._resizeWidth = this.imageWidth, this._resizeHeight = this.imageHeight, this._setTool("resize");
          break;
        case "filters":
          this._setTool("filters");
          break;
        case "metadata":
          this._setTool("metadata");
          break;
        case "undo":
          this.undo();
          break;
        case "redo":
          this.redo();
          break;
        case "zoom-in":
          this.zoomTo(this._zoom * 1.25);
          break;
        case "zoom-out":
          this.zoomTo(this._zoom / 1.25);
          break;
        case "zoom-fit":
          this.zoomToFit();
          break;
        case "export":
          this._setTool("export");
          break;
      }
  }
  _handleKeydown(t) {
    if (!this.contains(document.activeElement) && !this.shadowRoot.contains(this.shadowRoot.activeElement)) return;
    t.key === "Escape" && this._currentTool && (this._hideCropOverlay(), this._currentTool = null, this._hideContextBar(), this._updateToolbarState(), this._resetFilters(), this._redrawDisplay());
    const i = t.metaKey || t.ctrlKey;
    if (i && t.key === "z" && !t.shiftKey && (t.preventDefault(), this.undo()), i && t.key === "z" && t.shiftKey && (t.preventDefault(), this.redo()), this._currentTool === "crop" && this._cropRect) {
      const e = t.shiftKey ? 10 : 1;
      t.key === "ArrowLeft" && (this._cropRect.x -= e, this._updateCropOverlay(), t.preventDefault()), t.key === "ArrowRight" && (this._cropRect.x += e, this._updateCropOverlay(), t.preventDefault()), t.key === "ArrowUp" && (this._cropRect.y -= e, this._updateCropOverlay(), t.preventDefault()), t.key === "ArrowDown" && (this._cropRect.y += e, this._updateCropOverlay(), t.preventDefault()), t.key === "Enter" && (this._applyCrop(), t.preventDefault());
    }
  }
  _handleDrop(t) {
    t.preventDefault(), t.stopPropagation();
    const i = this.shadowRoot.querySelector(".workspace");
    if (i && i.classList.remove("drag-over"), this.readonly) return;
    const e = t.dataTransfer?.files?.[0];
    e && e.type.startsWith("image/") && this.loadImage(e);
  }
  _handleDragOver(t) {
    t.preventDefault();
    const i = this.shadowRoot.querySelector(".workspace");
    i && i.classList.add("drag-over");
  }
  _handleDragLeave(t) {
    t.preventDefault();
    const i = this.shadowRoot.querySelector(".workspace");
    i && i.classList.remove("drag-over");
  }
  _handleFileChange(t) {
    const i = t.target.files?.[0];
    i && this.loadImage(i), t.target.value = "";
  }
  _handleWheel(t) {
    if (!this._hasImage) return;
    t.preventDefault();
    const i = t.deltaY > 0 ? 0.9 : 1.1;
    this.zoomTo(this._zoom * i);
  }
  _handleDropZoneClick() {
    this.readonly || this.shadowRoot.querySelector(".file-input")?.click();
  }
  _handleCanvasMouseDown(t) {
    if (!this._hasImage || !this._displayCanvas || t.target.closest?.(".drop-zone") || t.target.classList?.contains("drop-zone")) return;
    const i = this._displayCanvas.getBoundingClientRect(), e = t.clientX - i.left, o = t.clientY - i.top;
    if (this._currentTool === "crop" && this._cropRect) {
      const a = this._getCropHandle(e, o);
      if (a) {
        this._cropHandle = a, this._cropStartX = e, this._cropStartY = o, this._cropStartRect = { ...this._cropRect }, t.preventDefault();
        return;
      }
    }
    this._isPanning = !0, this._panStartX = t.clientX, this._panStartY = t.clientY, this._panStartPanX = this._panX, this._panStartPanY = this._panY, this._displayCanvas.style.cursor = "grabbing";
  }
  _handleCanvasMouseMove(t) {
    if (this._hasImage) {
      if (this._cropHandle && this._cropRect && this._cropStartRect) {
        const i = this._displayCanvas.getBoundingClientRect(), e = t.clientX - i.left, o = t.clientY - i.top, a = e - this._cropStartX, r = o - this._cropStartY, s = this._cropStartRect;
        this._cropHandle === "move" ? (this._cropRect.x = s.x + a, this._cropRect.y = s.y + r) : (this._cropHandle.includes("w") && (this._cropRect.x = s.x + a, this._cropRect.w = s.w - a), this._cropHandle.includes("e") && (this._cropRect.w = s.w + a), this._cropHandle.includes("n") && (this._cropRect.y = s.y + r, this._cropRect.h = s.h - r), this._cropHandle.includes("s") && (this._cropRect.h = s.h + r), this._cropAspectRatio && (this._cropHandle.includes("e") || this._cropHandle.includes("w") ? this._cropRect.h = this._cropRect.w / this._cropAspectRatio : this._cropRect.w = this._cropRect.h * this._cropAspectRatio)), this._updateCropOverlay();
        return;
      }
      this._isPanning && (this._panX = this._panStartPanX + (t.clientX - this._panStartX), this._panY = this._panStartPanY + (t.clientY - this._panStartY), this._redrawDisplay());
    }
  }
  _handleCanvasMouseUp() {
    this._cropHandle = null, this._cropStartRect = null, this._isPanning && (this._isPanning = !1, this._displayCanvas && (this._displayCanvas.style.cursor = this._currentTool === "crop" ? "crosshair" : "grab"));
  }
  _handleContextInput(t) {
    const i = t.target.getAttribute("data-context-action");
    if (i) {
      if (i === "filter-slider") {
        const e = t.target.getAttribute("data-filter"), o = parseFloat(t.target.value);
        this._filters[e] = o;
        const a = h.find((s) => s.name === e), r = t.target.parentElement.querySelector(".filter-value");
        r && a && (r.textContent = o + a.unit), this._redrawDisplay();
      }
      if (i === "resize-w" && (this._resizeWidth = parseInt(t.target.value) || 1, this._resizeLocked && this.imageWidth > 0)) {
        this._resizeHeight = Math.round(this._resizeWidth * this.imageHeight / this.imageWidth);
        const e = this.shadowRoot.querySelector('[data-context-action="resize-h"]');
        e && (e.value = this._resizeHeight);
      }
      if (i === "resize-h" && (this._resizeHeight = parseInt(t.target.value) || 1, this._resizeLocked && this.imageHeight > 0)) {
        this._resizeWidth = Math.round(this._resizeHeight * this.imageWidth / this.imageHeight);
        const e = this.shadowRoot.querySelector('[data-context-action="resize-w"]');
        e && (e.value = this._resizeWidth);
      }
      if (i === "resize-preset") {
        const e = t.target.value;
        if (e && e !== "nullxnull") {
          const [o, a] = e.split("x").map(Number);
          if (o && a) {
            this._resizeWidth = o, this._resizeHeight = a;
            const r = this.shadowRoot.querySelector('[data-context-action="resize-w"]'), s = this.shadowRoot.querySelector('[data-context-action="resize-h"]');
            r && (r.value = o), s && (s.value = a);
          }
        }
      }
      if (i === "export-quality") {
        const e = parseFloat(t.target.value), o = t.target.parentElement.querySelector(".quality-value");
        o && (o.textContent = Math.round(e * 100) + "%"), this._updateEstimatedSize();
      }
      i === "export-format" && this._updateEstimatedSize();
    }
  }
  _handleContextClick(t) {
    const i = t.target.closest("[data-context-action]");
    if (!i) return;
    switch (i.getAttribute("data-context-action")) {
      case "crop-aspect": {
        const o = i.getAttribute("data-value");
        this._cropAspectRatio = o === "null" ? null : parseFloat(o), this._cropAspectRatio && this._cropRect && (this._constrainCropToAspect(), this._updateCropOverlay()), this.shadowRoot.querySelectorAll('[data-context-action="crop-aspect"]').forEach((r) => r.classList.remove("active")), i.classList.add("active");
        break;
      }
      case "crop-apply":
        this._applyCrop();
        break;
      case "crop-cancel":
        this._hideCropOverlay(), this._currentTool = null, this._hideContextBar(), this._updateToolbarState();
        break;
      case "resize-lock":
        this._resizeLocked = !this._resizeLocked, i.innerHTML = this._resizeLocked ? n.lock : n.unlock, i.classList.toggle("active", this._resizeLocked);
        break;
      case "resize-apply":
        this.resize(this._resizeWidth, this._resizeHeight), this._currentTool = null, this._hideContextBar(), this._updateToolbarState();
        break;
      case "resize-cancel":
        this._currentTool = null, this._hideContextBar(), this._updateToolbarState();
        break;
      case "filter-apply":
        this._commitFilters(), this._currentTool = null, this._hideContextBar(), this._updateToolbarState();
        break;
      case "filter-reset":
        this.resetFilters();
        break;
      case "export-download": {
        const o = this.shadowRoot.querySelector('[data-context-action="export-format"]'), a = this.shadowRoot.querySelector('[data-context-action="export-quality"]'), r = o?.value || this.format, s = a ? parseFloat(a.value) : this.quality;
        this.download(null, r, s);
        break;
      }
    }
  }
  // -------------------------------------------------------------------------
  // UI updates
  // -------------------------------------------------------------------------
  _updateEditorSize() {
    const t = this.getAttribute("width"), i = this.getAttribute("height"), e = this.shadowRoot.querySelector(".editor-container");
    e && (e.style.width = t ? t + "px" : "", e.style.height = i ? i + "px" : "");
  }
  _updateStatus() {
    const t = this.shadowRoot.querySelector(".image-dimensions");
    if (t && this._hasImage) {
      const i = [];
      this._sourceFormat && i.push(C(this._sourceFormat)), i.push(`${this.imageWidth} × ${this.imageHeight} px`), this._sourceFileSize > 0 && i.push(g(this._sourceFileSize)), t.textContent = i.join(" • ");
    } else t && (t.textContent = "");
  }
  _updateToolbarState() {
    const t = this.shadowRoot;
    if (!t) return;
    const i = t.querySelector('[data-action="undo"]'), e = t.querySelector('[data-action="redo"]');
    i && (i.disabled = !this.canUndo), e && (e.disabled = !this.canRedo), t.querySelectorAll('[data-action="crop"], [data-action="rotate-left"], [data-action="rotate-right"], [data-action="flip-h"], [data-action="flip-v"], [data-action="resize"], [data-action="filters"], [data-action="metadata"], [data-action="export"]').forEach((r) => {
      r.disabled = !this._hasImage;
    }), t.querySelectorAll(".toolbar [data-action]").forEach((r) => {
      const s = r.getAttribute("data-action");
      r.classList.toggle("active", s === this._currentTool);
    });
  }
  // -------------------------------------------------------------------------
  // CSS generation
  // -------------------------------------------------------------------------
  _getStyles() {
    const t = this._isDark;
    return `
      :host {
        --_ie-bg: var(--color-surface, ${t ? "#1c1c1e" : "#ffffff"});
        --_ie-border-color: var(--color-border, ${t ? "#3a3a3c" : "#d1d5da"});
        --_ie-border-radius: var(--radius-m, 8px);
        --_ie-text-color: var(--color-text, ${t ? "#e5e5e7" : "#24292e"});
        --_ie-text-muted: var(--color-text-muted, ${t ? "#8e8e93" : "#586069"});
        --_ie-font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
        --_ie-toolbar-bg: var(--color-surface-raised, ${t ? "#2c2c2e" : "#f6f8fa"});
        --_ie-toolbar-border: var(--color-border, ${t ? "#3a3a3c" : "#d1d5da"});
        --_ie-button-bg: transparent;
        --_ie-button-color: var(--color-text-muted, ${t ? "#8e8e93" : "#586069"});
        --_ie-button-hover-bg: var(--color-hover-bg, ${t ? "#3a3a3c" : "#f3f4f6"});
        --_ie-button-active-bg: var(--color-active-bg, ${t ? "#48484a" : "#e5e7eb"});
        --_ie-button-active-color: var(--color-primary, ${t ? "#64b5f6" : "#2563eb"});
        --_ie-button-radius: var(--radius-s, 4px);
        --_ie-accent-color: var(--color-primary, ${t ? "#64b5f6" : "#2563eb"});
        --_ie-focus-color: var(--color-focus-ring, ${t ? "#64b5f6" : "#2563eb"});
        --_ie-workspace-bg: ${t ? "#1a1a1a" : "#e5e5e5"};
        --_ie-workspace-check: ${t ? "#2a2a2a" : "#cccccc"};
        --_ie-context-bg: var(--color-surface-raised, ${t ? "#2c2c2e" : "#f6f8fa"});
        --_ie-context-border: var(--color-border, ${t ? "#3a3a3c" : "#d1d5da"});
        --_ie-crop-border: var(--color-primary, ${t ? "#64b5f6" : "#2563eb"});
        --_ie-crop-handle: var(--color-primary, ${t ? "#64b5f6" : "#2563eb"});
        --_ie-crop-overlay: ${t ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.5)"};
        --_ie-crop-grid: rgba(255,255,255,0.3);
        --_ie-status-bg: var(--color-surface-raised, ${t ? "#2c2c2e" : "#f6f8fa"});
        --_ie-status-color: var(--color-text-muted, ${t ? "#8e8e93" : "#586069"});
        --_ie-slider-track: var(--color-border, ${t ? "#48484a" : "#d1d5da"});
        --_ie-slider-thumb: var(--color-primary, ${t ? "#64b5f6" : "#2563eb"});

        display: block;
        margin: var(--image-editor-margin, 1rem 0);
        font-family: var(--image-editor-font-family, var(--_ie-font-family));
        color: var(--image-editor-text-color, var(--_ie-text-color));
        box-sizing: border-box;
      }

      *, *::before, *::after {
        box-sizing: border-box;
      }

      .editor-container {
        display: flex;
        flex-direction: column;
        background: var(--image-editor-bg, var(--_ie-bg));
        border: 1px solid var(--image-editor-border-color, var(--_ie-border-color));
        border-radius: var(--image-editor-border-radius, var(--_ie-border-radius));
        overflow: hidden;
        min-height: 300px;
        height: 500px;
      }

      /* Toolbar */
      .toolbar {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: var(--image-editor-toolbar-padding, 4px 8px);
        background: var(--image-editor-toolbar-bg, var(--_ie-toolbar-bg));
        border-bottom: 1px solid var(--image-editor-toolbar-border, var(--_ie-toolbar-border));
        flex-shrink: 0;
        flex-wrap: wrap;
      }

      .toolbar-group {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .toolbar-group + .toolbar-group {
        margin-left: 4px;
        padding-left: 6px;
        border-left: 1px solid var(--image-editor-border-color, var(--_ie-border-color));
      }

      .toolbar-group:last-child {
        margin-left: auto;
        padding-left: 6px;
        border-left: 1px solid var(--image-editor-border-color, var(--_ie-border-color));
      }

      .toolbar button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: none;
        border-radius: var(--image-editor-button-radius, var(--_ie-button-radius));
        background: var(--image-editor-button-bg, var(--_ie-button-bg));
        color: var(--image-editor-button-color, var(--_ie-button-color));
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
      }

      .toolbar button svg {
        width: 18px;
        height: 18px;
      }

      .toolbar button:hover:not(:disabled) {
        background: var(--image-editor-button-hover-bg, var(--_ie-button-hover-bg));
      }

      .toolbar button:active:not(:disabled) {
        background: var(--image-editor-button-active-bg, var(--_ie-button-active-bg));
      }

      .toolbar button.active {
        color: var(--image-editor-button-active-color, var(--_ie-button-active-color));
        background: var(--image-editor-button-active-bg, var(--_ie-button-active-bg));
      }

      .toolbar button:disabled {
        opacity: var(--image-editor-button-disabled-opacity, 0.4);
        cursor: not-allowed;
      }

      .toolbar button:focus-visible {
        outline: 2px solid var(--image-editor-focus-color, var(--_ie-focus-color));
        outline-offset: -2px;
      }

      .zoom-label {
        font-size: 0.75rem;
        min-width: 3em;
        text-align: center;
        color: var(--image-editor-text-muted, var(--_ie-text-muted));
        user-select: none;
      }

      .file-input { display: none; }

      /* Context bar */
      .context-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: var(--image-editor-context-bg, var(--_ie-context-bg));
        border-bottom: 1px solid var(--image-editor-context-border, var(--_ie-context-border));
        flex-shrink: 0;
        flex-wrap: wrap;
      }

      .context-bar[hidden] { display: none; }

      .context-group {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .context-actions {
        margin-left: auto;
      }

      .context-label {
        font-size: 0.75rem;
        color: var(--image-editor-text-muted, var(--_ie-text-muted));
        user-select: none;
        white-space: nowrap;
      }

      .context-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border: 1px solid var(--image-editor-border-color, var(--_ie-border-color));
        border-radius: var(--image-editor-button-radius, var(--_ie-button-radius));
        background: var(--image-editor-bg, var(--_ie-bg));
        color: var(--image-editor-text-color, var(--_ie-text-color));
        font-size: 0.75rem;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        white-space: nowrap;
      }

      .context-btn svg {
        width: 14px;
        height: 14px;
      }

      .context-btn:hover {
        background: var(--image-editor-button-hover-bg, var(--_ie-button-hover-bg));
      }

      .context-btn.active {
        background: var(--image-editor-button-active-color, var(--_ie-button-active-color));
        color: white;
        border-color: var(--image-editor-button-active-color, var(--_ie-button-active-color));
      }

      .context-btn.primary {
        background: var(--image-editor-accent-color, var(--_ie-accent-color));
        color: white;
        border-color: var(--image-editor-accent-color, var(--_ie-accent-color));
      }

      .context-btn.primary:hover {
        opacity: 0.9;
      }

      .context-btn.icon-btn {
        padding: 4px 6px;
      }

      .context-select,
      .context-input {
        padding: 4px 8px;
        border: 1px solid var(--image-editor-border-color, var(--_ie-border-color));
        border-radius: var(--image-editor-button-radius, var(--_ie-button-radius));
        background: var(--image-editor-bg, var(--_ie-bg));
        color: var(--image-editor-text-color, var(--_ie-text-color));
        font-size: 0.75rem;
        font-family: inherit;
      }

      .context-input {
        width: 70px;
        text-align: center;
      }

      .context-input:focus,
      .context-select:focus {
        outline: 2px solid var(--image-editor-focus-color, var(--_ie-focus-color));
        outline-offset: -1px;
      }

      /* Filter sliders */
      .context-filters {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .filter-slider {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
      }

      .filter-slider label {
        color: var(--image-editor-text-muted, var(--_ie-text-muted));
        min-width: 5em;
        white-space: nowrap;
      }

      .filter-slider input[type="range"] {
        width: 80px;
        accent-color: var(--image-editor-slider-thumb, var(--_ie-slider-thumb));
      }

      .filter-value {
        font-variant-numeric: tabular-nums;
        min-width: 3.5em;
        text-align: right;
        color: var(--image-editor-text-muted, var(--_ie-text-muted));
      }

      .context-range {
        width: 80px;
        accent-color: var(--image-editor-slider-thumb, var(--_ie-slider-thumb));
      }

      .quality-value {
        font-size: 0.75rem;
        font-variant-numeric: tabular-nums;
        min-width: 2.5em;
        color: var(--image-editor-text-muted, var(--_ie-text-muted));
      }

      /* Workspace */
      .workspace {
        flex: 1;
        position: relative;
        overflow: hidden;
        background-color: var(--image-editor-workspace-bg, var(--_ie-workspace-bg));
        background-image:
          linear-gradient(45deg, var(--image-editor-workspace-check-color, var(--_ie-workspace-check)) 25%, transparent 25%),
          linear-gradient(-45deg, var(--image-editor-workspace-check-color, var(--_ie-workspace-check)) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, var(--image-editor-workspace-check-color, var(--_ie-workspace-check)) 75%),
          linear-gradient(-45deg, transparent 75%, var(--image-editor-workspace-check-color, var(--_ie-workspace-check)) 75%);
        background-size: 16px 16px;
        background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
      }

      .workspace.drag-over {
        outline: 3px dashed var(--image-editor-accent-color, var(--_ie-accent-color));
        outline-offset: -3px;
      }

      /* Drop zone */
      .drop-zone {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: var(--image-editor-text-muted, var(--_ie-text-muted));
        font-size: 0.875rem;
        background: var(--image-editor-bg, var(--_ie-bg));
        cursor: pointer;
      }

      .drop-zone[hidden] { display: none; }

      .drop-zone-icon {
        width: 48px;
        height: 48px;
        opacity: 0.4;
        color: var(--image-editor-text-muted, var(--_ie-text-muted));
      }

      .drop-zone-text {
        text-align: center;
        line-height: 1.5;
      }

      /* Canvas */
      .canvas {
        position: absolute;
        inset: 0;
        cursor: grab;
      }

      .canvas[hidden] { display: none; }

      /* Crop overlay */
      .crop-overlay {
        position: absolute;
        border: 2px solid var(--image-editor-crop-border, var(--_ie-crop-border));
        cursor: move;
        z-index: 10;
      }

      .crop-overlay[hidden] { display: none; }

      .crop-grid {
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        pointer-events: none;
      }

      .crop-grid-cell {
        border: 0.5px solid var(--image-editor-crop-grid-color, var(--_ie-crop-grid));
      }

      .crop-handle {
        position: absolute;
        width: 10px;
        height: 10px;
        background: var(--image-editor-crop-handle-color, var(--_ie-crop-handle));
        border: 1px solid white;
        border-radius: 1px;
      }

      .crop-handle.nw { top: -5px; left: -5px; cursor: nw-resize; }
      .crop-handle.ne { top: -5px; right: -5px; cursor: ne-resize; }
      .crop-handle.sw { bottom: -5px; left: -5px; cursor: sw-resize; }
      .crop-handle.se { bottom: -5px; right: -5px; cursor: se-resize; }
      .crop-handle.n { top: -5px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
      .crop-handle.s { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
      .crop-handle.w { top: 50%; left: -5px; transform: translateY(-50%); cursor: w-resize; }
      .crop-handle.e { top: 50%; right: -5px; transform: translateY(-50%); cursor: e-resize; }

      .crop-dim {
        position: absolute;
        background: var(--image-editor-crop-overlay, var(--_ie-crop-overlay));
        pointer-events: none;
        z-index: 9;
      }

      .crop-dim[hidden] { display: none; }

      /* Status bar */
      .status-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 12px;
        background: var(--image-editor-status-bg, var(--_ie-status-bg));
        border-top: 1px solid var(--image-editor-border-color, var(--_ie-border-color));
        font-size: var(--image-editor-status-font-size, 0.75rem);
        color: var(--image-editor-status-color, var(--_ie-status-color));
        flex-shrink: 0;
      }

      /* Responsive: touch targets */
      @media (pointer: coarse) {
        .toolbar button {
          width: 44px;
          height: 44px;
        }
        .context-btn {
          padding: 8px 12px;
          font-size: 0.8125rem;
        }
      }

      /* Responsive: narrow screens */
      @media (max-width: 480px) {
        .toolbar-group + .toolbar-group {
          margin-left: 2px;
          padding-left: 3px;
        }
        .toolbar button {
          width: 28px;
          height: 28px;
        }
        .toolbar button svg {
          width: 16px;
          height: 16px;
        }
        .zoom-label { display: none; }
        .context-filters {
          flex-direction: column;
        }
        .filter-slider input[type="range"] {
          width: 60px;
        }
      }

      /* Metadata grid */
      .meta-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 2px 12px;
        font-size: 0.75rem;
      }

      .meta-key {
        color: var(--image-editor-text-muted, var(--_ie-text-muted));
        white-space: nowrap;
      }

      .meta-value {
        color: var(--image-editor-text-color, var(--_ie-text-color));
        word-break: break-word;
      }

      .context-metadata {
        max-height: 120px;
        overflow-y: auto;
      }

      /* Estimated size */
      .estimated-size {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--image-editor-text-color, var(--_ie-text-color));
        min-width: 5em;
        font-variant-numeric: tabular-nums;
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          transition: none !important;
        }
      }
    `;
  }
  // -------------------------------------------------------------------------
  // HTML templates
  // -------------------------------------------------------------------------
  _getToolbarHTML() {
    return this.noToolbar ? "" : `
      <div class="toolbar" role="toolbar" aria-label="Image editing tools">
        <div class="toolbar-group toolbar-file">
          <button data-action="open" aria-label="Open image" title="Open image" ${this.readonly ? "disabled" : ""}>${n.open}</button>
          <input type="file" class="file-input" accept="image/*" tabindex="-1">
        </div>
        <div class="toolbar-group toolbar-tools">
          <button data-action="crop" aria-label="Crop" title="Crop" disabled>${n.crop}</button>
          <button data-action="rotate-left" aria-label="Rotate left 90°" title="Rotate left" disabled>${n.rotateLeft}</button>
          <button data-action="rotate-right" aria-label="Rotate right 90°" title="Rotate right" disabled>${n.rotateRight}</button>
          <button data-action="flip-h" aria-label="Flip horizontal" title="Flip horizontal" disabled>${n.flipH}</button>
          <button data-action="flip-v" aria-label="Flip vertical" title="Flip vertical" disabled>${n.flipV}</button>
          <button data-action="resize" aria-label="Resize" title="Resize" disabled>${n.resize}</button>
          <button data-action="filters" aria-label="Filters" title="Filters" disabled>${n.filters}</button>
          <button data-action="metadata" aria-label="Image info" title="Image info" disabled>${n.info}</button>
        </div>
        <div class="toolbar-group toolbar-history">
          <button data-action="undo" aria-label="Undo" title="Undo (Ctrl+Z)" disabled>${n.undo}</button>
          <button data-action="redo" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled>${n.redo}</button>
        </div>
        <div class="toolbar-group toolbar-zoom">
          <button data-action="zoom-out" aria-label="Zoom out" title="Zoom out">${n.zoomOut}</button>
          <span class="zoom-label">100%</span>
          <button data-action="zoom-in" aria-label="Zoom in" title="Zoom in">${n.zoomIn}</button>
          <button data-action="zoom-fit" aria-label="Fit to view" title="Fit to view">${n.zoomFit}</button>
        </div>
        <div class="toolbar-group toolbar-export">
          <button data-action="export" aria-label="Export" title="Export" disabled>${n.download}</button>
        </div>
      </div>`;
  }
  _getWorkspaceHTML() {
    return `
      <div class="workspace">
        <div class="drop-zone">
          <svg class="drop-zone-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="6" width="36" height="36" rx="4"/>
            <circle cx="18" cy="18" r="4"/>
            <path d="M42 30l-10-10L8 42"/>
          </svg>
          <div class="drop-zone-text">
            <slot>Drop an image here or click Open</slot>
          </div>
        </div>
        <canvas class="canvas" hidden></canvas>
        <div class="crop-overlay" hidden>
          <div class="crop-grid">
            <div class="crop-grid-cell"></div><div class="crop-grid-cell"></div><div class="crop-grid-cell"></div>
            <div class="crop-grid-cell"></div><div class="crop-grid-cell"></div><div class="crop-grid-cell"></div>
            <div class="crop-grid-cell"></div><div class="crop-grid-cell"></div><div class="crop-grid-cell"></div>
          </div>
          <div class="crop-handle nw"></div>
          <div class="crop-handle ne"></div>
          <div class="crop-handle sw"></div>
          <div class="crop-handle se"></div>
          <div class="crop-handle n"></div>
          <div class="crop-handle s"></div>
          <div class="crop-handle w"></div>
          <div class="crop-handle e"></div>
        </div>
        <div class="crop-dim" hidden></div>
        <div class="crop-dim" hidden></div>
        <div class="crop-dim" hidden></div>
        <div class="crop-dim" hidden></div>
      </div>`;
  }
  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  render() {
    this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <div class="editor-container">
        ${this._getToolbarHTML()}
        <div class="context-bar" hidden></div>
        ${this._getWorkspaceHTML()}
        <div class="status-bar">
          <span class="image-dimensions"></span>
        </div>
      </div>`, this._updateEditorSize();
  }
}
customElements.define("image-editor", E);
export {
  E as ImageEditor
};
