import { d as f, a as g, s as b, g as u, f as m, e as _, b as y } from "./format-utils-VEGgp_LA.js";
const v = document.createElement("style");
v.textContent = "image-convert:not(:defined){display:block;opacity:0}";
document.head.appendChild(v);
function w() {
  const i = document.documentElement, t = document.body;
  if (!i) return !1;
  if (i.classList.contains("dark") || t?.classList.contains("dark") || i.getAttribute("data-theme") === "dark" || i.getAttribute("data-bs-theme") === "dark" || i.getAttribute("data-mode") === "dark") return !0;
  const e = getComputedStyle(i).colorScheme;
  return !!(e && e.includes("dark") && !e.includes("light"));
}
const x = {
  download: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v8"/><path d="M5 7l3 3 3-3"/><path d="M2 12v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1"/></svg>'
}, p = ["png", "jpeg", "webp"];
class S extends HTMLElement {
  static get observedAttributes() {
    return ["mode", "format", "quality", "strip-metadata", "accept"];
  }
  constructor() {
    super(), this.attachShadow({ mode: "open" }), this._sourceFile = null, this._sourceFormat = null, this._sourceFileSize = 0, this._sourceWidth = 0, this._sourceHeight = 0, this._sourceArrayBuffer = null, this._canvas = null, this._ctx = null, this._estimatedSize = 0, this._estimateTimer = null, this._avifSupported = !1, this._hasImage = !1, this._handleDrop = this._handleDrop.bind(this), this._handleDragOver = this._handleDragOver.bind(this), this._handleDragLeave = this._handleDragLeave.bind(this), this._handleFileChange = this._handleFileChange.bind(this), this._handleDropZoneClick = this._handleDropZoneClick.bind(this), this._handleFormatClick = this._handleFormatClick.bind(this), this._handleQualityInput = this._handleQualityInput.bind(this), this._handleStripChange = this._handleStripChange.bind(this), this._handleDownload = this._handleDownload.bind(this);
  }
  connectedCallback() {
    this.render(), this._attachEventListeners(), f().then((t) => {
      this._avifSupported = t, t && this._hasImage && this._updateFormatButtons();
    });
  }
  disconnectedCallback() {
    clearTimeout(this._estimateTimer);
  }
  attributeChangedCallback(t, e, a) {
    !this.shadowRoot || e === a || t === "mode" && (this.render(), this._attachEventListeners(), this._hasImage && this._updateUI());
  }
  // -------------------------------------------------------------------------
  // Attribute getters/setters
  // -------------------------------------------------------------------------
  get mode() {
    return this.getAttribute("mode");
  }
  set mode(t) {
    t ? this.setAttribute("mode", t) : this.removeAttribute("mode");
  }
  get format() {
    return this.getAttribute("format") || "webp";
  }
  set format(t) {
    this.setAttribute("format", t);
  }
  get quality() {
    const t = parseFloat(this.getAttribute("quality"));
    return isNaN(t) ? 0.85 : Math.max(0, Math.min(1, t));
  }
  set quality(t) {
    this.setAttribute("quality", String(t));
  }
  get stripMetadata() {
    return !this.hasAttribute("strip-metadata") || this.getAttribute("strip-metadata") !== "false";
  }
  set stripMetadata(t) {
    this.setAttribute("strip-metadata", t ? "" : "false");
  }
  get accept() {
    return this.getAttribute("accept") || "image/*";
  }
  set accept(t) {
    this.setAttribute("accept", t);
  }
  get _isDark() {
    return this.mode === "dark" ? !0 : this.mode === "light" ? !1 : w() || window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  // -------------------------------------------------------------------------
  // Image loading
  // -------------------------------------------------------------------------
  async loadFile(t) {
    if (!t || !t.type.startsWith("image/")) return;
    this._sourceFile = t, this._sourceFileSize = t.size, this._sourceArrayBuffer = await t.arrayBuffer(), this._sourceFormat = g(this._sourceArrayBuffer);
    const e = await this._loadBlob(t);
    this._sourceWidth = e.naturalWidth || e.width, this._sourceHeight = e.naturalHeight || e.height, this._canvas = document.createElement("canvas"), this._canvas.width = this._sourceWidth, this._canvas.height = this._sourceHeight, this._ctx = this._canvas.getContext("2d"), this._ctx.drawImage(e, 0, 0), this._hasImage = !0, this._updateUI(), this._updateEstimatedSize();
  }
  _loadBlob(t) {
    return new Promise((e, a) => {
      const o = URL.createObjectURL(t), r = new Image();
      r.onload = () => {
        URL.revokeObjectURL(o), e(r);
      }, r.onerror = () => {
        URL.revokeObjectURL(o), a(new Error("Failed to load"));
      }, r.src = o;
    });
  }
  // -------------------------------------------------------------------------
  // Conversion
  // -------------------------------------------------------------------------
  async _download() {
    if (!this._canvas) return;
    const t = this._getSelectedFormat(), e = this._getSelectedQuality(), a = y(t);
    let o;
    if (this.stripMetadata)
      o = await new Promise((n) => {
        this._canvas.toBlob((c) => n(c), a, t === "png" ? void 0 : e);
      });
    else if (o = await new Promise((n) => {
      this._canvas.toBlob((c) => n(c), a, t === "png" ? void 0 : e);
    }), this._sourceFormat === "image/jpeg" && t === "jpeg" && this._sourceArrayBuffer)
      try {
        const n = await o.arrayBuffer(), c = b(n);
        o = new Blob([c], { type: a });
      } catch {
      }
    if (!o) return;
    const r = t === "jpeg" ? "jpg" : t, l = `${this._sourceFile?.name?.replace(/\.[^.]+$/, "") || "image"}.${r}`, h = URL.createObjectURL(o), d = document.createElement("a");
    d.href = h, d.download = l, d.click(), URL.revokeObjectURL(h), this.dispatchEvent(new CustomEvent("convert-complete", {
      bubbles: !0,
      composed: !0,
      detail: {
        sourceFormat: u(this._sourceFormat),
        outputFormat: t.toUpperCase(),
        sourceSize: this._sourceFileSize,
        outputSize: o.size,
        filename: l
      }
    }));
  }
  // -------------------------------------------------------------------------
  // UI helpers
  // -------------------------------------------------------------------------
  _getSelectedFormat() {
    return this.shadowRoot.querySelector(".format-btn.active")?.getAttribute("data-format") || this.format;
  }
  _getSelectedQuality() {
    const t = this.shadowRoot.querySelector(".quality-slider");
    return t ? parseFloat(t.value) : this.quality;
  }
  _updateUI() {
    const t = this.shadowRoot.querySelector(".source-info"), e = this.shadowRoot.querySelector(".convert-controls"), a = this.shadowRoot.querySelector(".drop-zone");
    this._hasImage && (a && a.classList.add("has-image"), t && (t.hidden = !1, t.textContent = `${u(this._sourceFormat)} • ${this._sourceWidth} × ${this._sourceHeight} px • ${m(this._sourceFileSize)}`), e && (e.hidden = !1), this._updateFormatButtons());
  }
  _updateFormatButtons() {
    const t = this.shadowRoot.querySelector(".format-buttons");
    if (!t) return;
    const e = [...p];
    this._avifSupported && e.push("avif"), t.innerHTML = e.map((a) => `<button class="format-btn ${a === this._getSelectedFormat() ? "active" : ""}" data-format="${a}">${a.toUpperCase()}</button>`).join("");
  }
  _updateEstimatedSize() {
    this._canvas && (clearTimeout(this._estimateTimer), this._estimateTimer = setTimeout(async () => {
      const t = this._getSelectedFormat(), e = this._getSelectedQuality();
      this._estimatedSize = await _(this._canvas, t, e);
      const a = this.shadowRoot.querySelector(".output-info");
      if (a) {
        const r = this._sourceFileSize > 0 ? Math.round((1 - this._estimatedSize / this._sourceFileSize) * 100) : 0, s = r > 0 ? ` (${r}% smaller)` : r < 0 ? ` (${Math.abs(r)}% larger)` : "";
        a.textContent = `≈ ${m(this._estimatedSize)}${s}`;
      }
      const o = this.shadowRoot.querySelector(".download-btn");
      o && (o.disabled = !1);
    }, 200));
  }
  // -------------------------------------------------------------------------
  // Event handling
  // -------------------------------------------------------------------------
  _attachEventListeners() {
    const t = this.shadowRoot.querySelector(".drop-zone");
    t && (t.addEventListener("drop", this._handleDrop), t.addEventListener("dragover", this._handleDragOver), t.addEventListener("dragleave", this._handleDragLeave), t.addEventListener("click", this._handleDropZoneClick));
    const e = this.shadowRoot.querySelector(".file-input");
    e && e.addEventListener("change", this._handleFileChange);
    const a = this.shadowRoot.querySelector(".format-buttons");
    a && a.addEventListener("click", this._handleFormatClick);
    const o = this.shadowRoot.querySelector(".quality-slider");
    o && o.addEventListener("input", this._handleQualityInput);
    const r = this.shadowRoot.querySelector(".strip-checkbox");
    r && r.addEventListener("change", this._handleStripChange);
    const s = this.shadowRoot.querySelector(".download-btn");
    s && s.addEventListener("click", this._handleDownload);
  }
  _handleDrop(t) {
    t.preventDefault(), t.stopPropagation(), this.shadowRoot.querySelector(".drop-zone")?.classList.remove("drag-over");
    const e = t.dataTransfer?.files?.[0];
    e && this.loadFile(e);
  }
  _handleDragOver(t) {
    t.preventDefault(), this.shadowRoot.querySelector(".drop-zone")?.classList.add("drag-over");
  }
  _handleDragLeave(t) {
    t.preventDefault(), this.shadowRoot.querySelector(".drop-zone")?.classList.remove("drag-over");
  }
  _handleDropZoneClick() {
    this.shadowRoot.querySelector(".file-input")?.click();
  }
  _handleFileChange(t) {
    const e = t.target.files?.[0];
    e && this.loadFile(e), t.target.value = "";
  }
  _handleFormatClick(t) {
    const e = t.target.closest(".format-btn");
    if (!e) return;
    this.shadowRoot.querySelectorAll(".format-btn").forEach((r) => r.classList.remove("active")), e.classList.add("active");
    const a = e.getAttribute("data-format"), o = this.shadowRoot.querySelector(".quality-group");
    o && (o.hidden = a === "png"), this._updateEstimatedSize();
  }
  _handleQualityInput(t) {
    const e = this.shadowRoot.querySelector(".quality-label");
    e && (e.textContent = Math.round(t.target.value * 100) + "%"), this._updateEstimatedSize();
  }
  _handleStripChange() {
  }
  _handleDownload() {
    this._download();
  }
  // -------------------------------------------------------------------------
  // CSS
  // -------------------------------------------------------------------------
  _getStyles() {
    const t = this._isDark;
    return `
      :host {
        --_ic-bg: var(--color-surface, ${t ? "#1c1c1e" : "#ffffff"});
        --_ic-border: var(--color-border, ${t ? "#3a3a3c" : "#d1d5da"});
        --_ic-radius: var(--radius-m, 8px);
        --_ic-text: var(--color-text, ${t ? "#e5e5e7" : "#24292e"});
        --_ic-text-muted: var(--color-text-muted, ${t ? "#8e8e93" : "#586069"});
        --_ic-font: var(--font-sans, system-ui, -apple-system, sans-serif);
        --_ic-surface-raised: var(--color-surface-raised, ${t ? "#2c2c2e" : "#f6f8fa"});
        --_ic-accent: var(--color-primary, ${t ? "#64b5f6" : "#2563eb"});
        --_ic-hover: var(--color-hover-bg, ${t ? "#3a3a3c" : "#f3f4f6"});
        --_ic-focus: var(--color-focus-ring, ${t ? "#64b5f6" : "#2563eb"});
        --_ic-btn-radius: var(--radius-s, 4px);

        display: block;
        margin: var(--image-convert-margin, 1rem 0);
        font-family: var(--image-convert-font-family, var(--_ic-font));
        color: var(--image-convert-text-color, var(--_ic-text));
      }

      *, *::before, *::after { box-sizing: border-box; }

      .convert-container {
        background: var(--image-convert-bg, var(--_ic-bg));
        border: 1px solid var(--image-convert-border-color, var(--_ic-border));
        border-radius: var(--image-convert-border-radius, var(--_ic-radius));
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      /* Drop zone */
      .drop-zone {
        border: 2px dashed var(--image-convert-border-color, var(--_ic-border));
        border-radius: var(--_ic-btn-radius);
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
        color: var(--image-convert-text-muted, var(--_ic-text-muted));
      }

      .drop-zone:hover {
        border-color: var(--image-convert-accent-color, var(--_ic-accent));
        background: var(--_ic-hover);
      }

      .drop-zone.drag-over {
        border-color: var(--image-convert-accent-color, var(--_ic-accent));
        background: var(--_ic-hover);
      }

      .drop-zone.has-image {
        padding: 1rem;
        border-style: solid;
      }

      .drop-zone-icon {
        width: 32px;
        height: 32px;
        margin: 0 auto 0.5rem;
        opacity: 0.5;
        display: block;
      }

      .drop-zone-text {
        font-size: 0.875rem;
        line-height: 1.5;
      }

      .file-input { display: none; }

      /* Source info */
      .source-info {
        font-size: 0.8125rem;
        color: var(--image-convert-text-muted, var(--_ic-text-muted));
        text-align: center;
      }

      .source-info[hidden] { display: none; }

      /* Controls */
      .convert-controls { display: flex; flex-direction: column; gap: 0.75rem; }
      .convert-controls[hidden] { display: none; }

      .control-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .control-label {
        font-size: 0.8125rem;
        color: var(--image-convert-text-muted, var(--_ic-text-muted));
        min-width: 5em;
        white-space: nowrap;
      }

      /* Format buttons */
      .format-buttons {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .format-btn {
        padding: 6px 14px;
        border: 1px solid var(--image-convert-border-color, var(--_ic-border));
        border-radius: var(--_ic-btn-radius);
        background: var(--image-convert-bg, var(--_ic-bg));
        color: var(--image-convert-text-color, var(--_ic-text));
        font-size: 0.8125rem;
        font-weight: 500;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s, color 0.15s;
      }

      .format-btn:hover {
        background: var(--_ic-hover);
      }

      .format-btn.active {
        background: var(--image-convert-accent-color, var(--_ic-accent));
        color: white;
        border-color: var(--image-convert-accent-color, var(--_ic-accent));
      }

      .format-btn:focus-visible {
        outline: 2px solid var(--_ic-focus);
        outline-offset: -2px;
      }

      /* Quality slider */
      .quality-group { display: contents; }
      .quality-group[hidden] { display: none; }

      .quality-slider {
        flex: 1;
        min-width: 80px;
        accent-color: var(--image-convert-accent-color, var(--_ic-accent));
      }

      .quality-label {
        font-size: 0.8125rem;
        font-variant-numeric: tabular-nums;
        min-width: 2.5em;
        text-align: right;
        color: var(--image-convert-text-muted, var(--_ic-text-muted));
      }

      /* Strip checkbox */
      .strip-row {
        font-size: 0.8125rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--image-convert-text-muted, var(--_ic-text-muted));
      }

      .strip-checkbox {
        accent-color: var(--image-convert-accent-color, var(--_ic-accent));
      }

      /* Output info */
      .output-info {
        font-size: 0.875rem;
        font-weight: 600;
        text-align: center;
        color: var(--image-convert-text-color, var(--_ic-text));
        font-variant-numeric: tabular-nums;
        min-height: 1.25em;
      }

      /* Download button */
      .download-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 10px 16px;
        border: none;
        border-radius: var(--_ic-btn-radius);
        background: var(--image-convert-accent-color, var(--_ic-accent));
        color: white;
        font-size: 0.875rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: opacity 0.15s;
      }

      .download-btn:hover { opacity: 0.9; }
      .download-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .download-btn:focus-visible { outline: 2px solid var(--_ic-focus); outline-offset: 2px; }
      .download-btn svg { width: 16px; height: 16px; }

      @media (pointer: coarse) {
        .format-btn { padding: 10px 16px; }
        .download-btn { padding: 14px 16px; }
      }

      @media (prefers-reduced-motion: reduce) {
        * { transition: none !important; }
      }
    `;
  }
  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  render() {
    const t = this.format, e = this.quality, a = t !== "png", o = [...p];
    this._avifSupported && o.push("avif"), this.shadowRoot.innerHTML = `
      <style>${this._getStyles()}</style>
      <div class="convert-container">
        <div class="drop-zone">
          <svg class="drop-zone-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 10V2"/><path d="M5 5l3-3 3 3"/><path d="M2 12v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1"/>
          </svg>
          <div class="drop-zone-text">
            <slot>Drop an image here or click to browse</slot>
          </div>
          <input type="file" class="file-input" accept="${this.accept}" tabindex="-1">
        </div>

        <div class="source-info" hidden></div>

        <div class="convert-controls" hidden>
          <div class="control-row">
            <span class="control-label">Convert to:</span>
            <div class="format-buttons">
              ${o.map((r) => `<button class="format-btn ${r === t ? "active" : ""}" data-format="${r}">${r.toUpperCase()}</button>`).join("")}
            </div>
          </div>

          <div class="control-row">
            <span class="control-label quality-group" ${a ? "" : "hidden"}>Quality:</span>
            <div class="quality-group" ${a ? "" : "hidden"}>
              <input type="range" class="quality-slider" min="0.1" max="1" step="0.05" value="${e}" aria-label="Quality">
              <span class="quality-label">${Math.round(e * 100)}%</span>
            </div>
          </div>

          <div class="strip-row">
            <input type="checkbox" class="strip-checkbox" id="strip-meta" ${this.stripMetadata ? "checked" : ""}>
            <label for="strip-meta">Strip metadata</label>
          </div>

          <div class="output-info"></div>

          <button class="download-btn" disabled>
            ${x.download} Download
          </button>
        </div>
      </div>`;
  }
}
customElements.define("image-convert", S);
export {
  S as ImageConvert
};
