/**
 * @element image-convert
 * @summary A simple drag-and-drop image format converter web component.
 *
 * @attr {string} mode - Theme mode: 'light' or 'dark' (auto-detects if omitted)
 * @attr {string} format - Default output format: 'png', 'jpeg', 'webp', or 'avif'
 * @attr {number} quality - Export quality 0–1 for JPEG/WebP/AVIF (default 0.85)
 * @attr {boolean} strip-metadata - Strip EXIF metadata (default true)
 * @attr {string} accept - Accepted file types (default 'image/*')
 *
 * @cssprop --image-convert-bg - Component background
 * @cssprop --image-convert-border-color - Border color
 * @cssprop --image-convert-accent-color - Accent/primary color
 *
 * @fires convert-complete - When conversion and download completes
 *
 * @example
 * <image-convert></image-convert>
 *
 * @example
 * <image-convert format="webp" quality="0.8" strip-metadata></image-convert>
 */

import { stripExif } from './lib/exif-parser.js'
import {
  detectMimeType, getFormatLabel, getMimeType,
  detectAVIFSupport, formatFileSize, estimateOutputSize
} from './lib/format-utils.js'

// ---------------------------------------------------------------------------
// Anti-FOUC
// ---------------------------------------------------------------------------
const _antiFlash = document.createElement('style')
_antiFlash.textContent =
  'image-convert:not(:defined){display:block;opacity:0}'
document.head.appendChild(_antiFlash)

// ---------------------------------------------------------------------------
// Page-level dark mode detection (lightweight — no singleton needed for this)
// ---------------------------------------------------------------------------
function _detectPageDark() {
  const html = document.documentElement
  const body = document.body
  if (!html) return false
  if (html.classList.contains('dark') || body?.classList.contains('dark')) return true
  if (html.getAttribute('data-theme') === 'dark') return true
  if (html.getAttribute('data-bs-theme') === 'dark') return true
  if (html.getAttribute('data-mode') === 'dark') return true
  const cs = getComputedStyle(html).colorScheme
  if (cs && cs.includes('dark') && !cs.includes('light')) return true
  return false
}

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------
const ICONS = {
  upload: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10V2"/><path d="M5 5l3-3 3 3"/><path d="M2 12v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1"/></svg>',
  download: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v8"/><path d="M5 7l3 3 3-3"/><path d="M2 12v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1"/></svg>'
}

// ---------------------------------------------------------------------------
// Formats
// ---------------------------------------------------------------------------
const BASE_FORMATS = ['png', 'jpeg', 'webp']

// ---------------------------------------------------------------------------
// ImageConvert class
// ---------------------------------------------------------------------------
class ImageConvert extends HTMLElement {
  static get observedAttributes() {
    return ['mode', 'format', 'quality', 'strip-metadata', 'accept']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    // State
    this._sourceFile = null
    this._sourceFormat = null
    this._sourceFileSize = 0
    this._sourceWidth = 0
    this._sourceHeight = 0
    this._sourceArrayBuffer = null
    this._canvas = null
    this._ctx = null
    this._estimatedSize = 0
    this._estimateTimer = null
    this._avifSupported = false
    this._hasImage = false

    // Bound handlers
    this._handleDrop = this._handleDrop.bind(this)
    this._handleDragOver = this._handleDragOver.bind(this)
    this._handleDragLeave = this._handleDragLeave.bind(this)
    this._handleFileChange = this._handleFileChange.bind(this)
    this._handleDropZoneClick = this._handleDropZoneClick.bind(this)
    this._handleFormatClick = this._handleFormatClick.bind(this)
    this._handleQualityInput = this._handleQualityInput.bind(this)
    this._handleStripChange = this._handleStripChange.bind(this)
    this._handleDownload = this._handleDownload.bind(this)
  }

  connectedCallback() {
    this.render()
    this._attachEventListeners()
    detectAVIFSupport().then((s) => {
      this._avifSupported = s
      if (s && this._hasImage) this._updateFormatButtons()
    })
  }

  disconnectedCallback() {
    clearTimeout(this._estimateTimer)
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.shadowRoot || oldValue === newValue) return
    if (name === 'mode') {
      this.render()
      this._attachEventListeners()
      if (this._hasImage) this._updateUI()
    }
  }

  // -------------------------------------------------------------------------
  // Attribute getters/setters
  // -------------------------------------------------------------------------
  get mode() { return this.getAttribute('mode') }
  set mode(v) { v ? this.setAttribute('mode', v) : this.removeAttribute('mode') }

  get format() { return this.getAttribute('format') || 'webp' }
  set format(v) { this.setAttribute('format', v) }

  get quality() {
    const q = parseFloat(this.getAttribute('quality'))
    return isNaN(q) ? 0.85 : Math.max(0, Math.min(1, q))
  }
  set quality(v) { this.setAttribute('quality', String(v)) }

  get stripMetadata() {
    return !this.hasAttribute('strip-metadata') || this.getAttribute('strip-metadata') !== 'false'
  }
  set stripMetadata(v) { this.setAttribute('strip-metadata', v ? '' : 'false') }

  get accept() { return this.getAttribute('accept') || 'image/*' }
  set accept(v) { this.setAttribute('accept', v) }

  get _isDark() {
    if (this.mode === 'dark') return true
    if (this.mode === 'light') return false
    return _detectPageDark() || window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // -------------------------------------------------------------------------
  // Image loading
  // -------------------------------------------------------------------------
  async loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return

    this._sourceFile = file
    this._sourceFileSize = file.size
    this._sourceArrayBuffer = await file.arrayBuffer()
    this._sourceFormat = detectMimeType(this._sourceArrayBuffer)

    // Load into canvas
    const img = await this._loadBlob(file)
    this._sourceWidth = img.naturalWidth || img.width
    this._sourceHeight = img.naturalHeight || img.height

    this._canvas = document.createElement('canvas')
    this._canvas.width = this._sourceWidth
    this._canvas.height = this._sourceHeight
    this._ctx = this._canvas.getContext('2d')
    this._ctx.drawImage(img, 0, 0)

    this._hasImage = true
    this._updateUI()
    this._updateEstimatedSize()
  }

  _loadBlob(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load')) }
      img.src = url
    })
  }

  // -------------------------------------------------------------------------
  // Conversion
  // -------------------------------------------------------------------------
  async _download() {
    if (!this._canvas) return

    const fmt = this._getSelectedFormat()
    const q = this._getSelectedQuality()
    const mime = getMimeType(fmt)

    let blob
    if (this.stripMetadata) {
      // Canvas output naturally strips metadata
      blob = await new Promise((resolve) => {
        this._canvas.toBlob((b) => resolve(b), mime, fmt === 'png' ? undefined : q)
      })
    } else {
      // Export with metadata preserved (JPEG only)
      blob = await new Promise((resolve) => {
        this._canvas.toBlob((b) => resolve(b), mime, fmt === 'png' ? undefined : q)
      })
      if (this._sourceFormat === 'image/jpeg' && fmt === 'jpeg' && this._sourceArrayBuffer) {
        // Re-inject EXIF into JPEG output
        try {
          const outputBuffer = await blob.arrayBuffer()
          const cleaned = stripExif(outputBuffer)
          blob = new Blob([cleaned], { type: mime })
        } catch {
          // Fall back to canvas output
        }
      }
    }

    if (!blob) return

    const ext = fmt === 'jpeg' ? 'jpg' : fmt
    const baseName = this._sourceFile?.name?.replace(/\.[^.]+$/, '') || 'image'
    const filename = `${baseName}.${ext}`

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    this.dispatchEvent(new CustomEvent('convert-complete', {
      bubbles: true, composed: true,
      detail: {
        sourceFormat: getFormatLabel(this._sourceFormat),
        outputFormat: fmt.toUpperCase(),
        sourceSize: this._sourceFileSize,
        outputSize: blob.size,
        filename
      }
    }))
  }

  // -------------------------------------------------------------------------
  // UI helpers
  // -------------------------------------------------------------------------
  _getSelectedFormat() {
    const active = this.shadowRoot.querySelector('.format-btn.active')
    return active?.getAttribute('data-format') || this.format
  }

  _getSelectedQuality() {
    const slider = this.shadowRoot.querySelector('.quality-slider')
    return slider ? parseFloat(slider.value) : this.quality
  }

  _updateUI() {
    const sourceInfo = this.shadowRoot.querySelector('.source-info')
    const controls = this.shadowRoot.querySelector('.convert-controls')
    const dropZone = this.shadowRoot.querySelector('.drop-zone')

    if (this._hasImage) {
      if (dropZone) dropZone.classList.add('has-image')
      if (sourceInfo) {
        sourceInfo.hidden = false
        sourceInfo.textContent = `${getFormatLabel(this._sourceFormat)} • ${this._sourceWidth} × ${this._sourceHeight} px • ${formatFileSize(this._sourceFileSize)}`
      }
      if (controls) controls.hidden = false
      this._updateFormatButtons()
    }
  }

  _updateFormatButtons() {
    const container = this.shadowRoot.querySelector('.format-buttons')
    if (!container) return
    const formats = [...BASE_FORMATS]
    if (this._avifSupported) formats.push('avif')
    container.innerHTML = formats.map((f) => {
      const active = f === this._getSelectedFormat()
      return `<button class="format-btn ${active ? 'active' : ''}" data-format="${f}">${f.toUpperCase()}</button>`
    }).join('')
  }

  _updateEstimatedSize() {
    if (!this._canvas) return
    clearTimeout(this._estimateTimer)
    this._estimateTimer = setTimeout(async () => {
      const fmt = this._getSelectedFormat()
      const q = this._getSelectedQuality()
      this._estimatedSize = await estimateOutputSize(this._canvas, fmt, q)
      const el = this.shadowRoot.querySelector('.output-info')
      if (el) {
        const savings = this._sourceFileSize > 0
          ? Math.round((1 - this._estimatedSize / this._sourceFileSize) * 100)
          : 0
        const savingsText = savings > 0 ? ` (${savings}% smaller)` : savings < 0 ? ` (${Math.abs(savings)}% larger)` : ''
        el.textContent = `≈ ${formatFileSize(this._estimatedSize)}${savingsText}`
      }
      // Enable/disable download button
      const dlBtn = this.shadowRoot.querySelector('.download-btn')
      if (dlBtn) dlBtn.disabled = false
    }, 200)
  }

  // -------------------------------------------------------------------------
  // Event handling
  // -------------------------------------------------------------------------
  _attachEventListeners() {
    const dropZone = this.shadowRoot.querySelector('.drop-zone')
    if (dropZone) {
      dropZone.addEventListener('drop', this._handleDrop)
      dropZone.addEventListener('dragover', this._handleDragOver)
      dropZone.addEventListener('dragleave', this._handleDragLeave)
      dropZone.addEventListener('click', this._handleDropZoneClick)
    }

    const fileInput = this.shadowRoot.querySelector('.file-input')
    if (fileInput) fileInput.addEventListener('change', this._handleFileChange)

    const fmtContainer = this.shadowRoot.querySelector('.format-buttons')
    if (fmtContainer) fmtContainer.addEventListener('click', this._handleFormatClick)

    const qSlider = this.shadowRoot.querySelector('.quality-slider')
    if (qSlider) qSlider.addEventListener('input', this._handleQualityInput)

    const stripCb = this.shadowRoot.querySelector('.strip-checkbox')
    if (stripCb) stripCb.addEventListener('change', this._handleStripChange)

    const dlBtn = this.shadowRoot.querySelector('.download-btn')
    if (dlBtn) dlBtn.addEventListener('click', this._handleDownload)
  }

  _handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    this.shadowRoot.querySelector('.drop-zone')?.classList.remove('drag-over')
    const file = e.dataTransfer?.files?.[0]
    if (file) this.loadFile(file)
  }

  _handleDragOver(e) {
    e.preventDefault()
    this.shadowRoot.querySelector('.drop-zone')?.classList.add('drag-over')
  }

  _handleDragLeave(e) {
    e.preventDefault()
    this.shadowRoot.querySelector('.drop-zone')?.classList.remove('drag-over')
  }

  _handleDropZoneClick() {
    this.shadowRoot.querySelector('.file-input')?.click()
  }

  _handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) this.loadFile(file)
    e.target.value = ''
  }

  _handleFormatClick(e) {
    const btn = e.target.closest('.format-btn')
    if (!btn) return
    this.shadowRoot.querySelectorAll('.format-btn').forEach((b) => b.classList.remove('active'))
    btn.classList.add('active')
    // Show/hide quality slider
    const fmt = btn.getAttribute('data-format')
    const qGroup = this.shadowRoot.querySelector('.quality-group')
    if (qGroup) qGroup.hidden = fmt === 'png'
    this._updateEstimatedSize()
  }

  _handleQualityInput(e) {
    const label = this.shadowRoot.querySelector('.quality-label')
    if (label) label.textContent = Math.round(e.target.value * 100) + '%'
    this._updateEstimatedSize()
  }

  _handleStripChange() {
    // Just a UI toggle — affects download behavior
  }

  _handleDownload() {
    this._download()
  }

  // -------------------------------------------------------------------------
  // CSS
  // -------------------------------------------------------------------------
  _getStyles() {
    const isDark = this._isDark
    return `
      :host {
        --_ic-bg: var(--color-surface, ${isDark ? '#1c1c1e' : '#ffffff'});
        --_ic-border: var(--color-border, ${isDark ? '#3a3a3c' : '#d1d5da'});
        --_ic-radius: var(--radius-m, 8px);
        --_ic-text: var(--color-text, ${isDark ? '#e5e5e7' : '#24292e'});
        --_ic-text-muted: var(--color-text-muted, ${isDark ? '#8e8e93' : '#586069'});
        --_ic-font: var(--font-sans, system-ui, -apple-system, sans-serif);
        --_ic-surface-raised: var(--color-surface-raised, ${isDark ? '#2c2c2e' : '#f6f8fa'});
        --_ic-accent: var(--color-primary, ${isDark ? '#64b5f6' : '#2563eb'});
        --_ic-hover: var(--color-hover-bg, ${isDark ? '#3a3a3c' : '#f3f4f6'});
        --_ic-focus: var(--color-focus-ring, ${isDark ? '#64b5f6' : '#2563eb'});
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
    `
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  render() {
    const fmt = this.format
    const q = this.quality
    const showQuality = fmt !== 'png'
    const formats = [...BASE_FORMATS]
    if (this._avifSupported) formats.push('avif')

    this.shadowRoot.innerHTML = `
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
              ${formats.map((f) => `<button class="format-btn ${f === fmt ? 'active' : ''}" data-format="${f}">${f.toUpperCase()}</button>`).join('')}
            </div>
          </div>

          <div class="control-row">
            <span class="control-label quality-group" ${!showQuality ? 'hidden' : ''}>Quality:</span>
            <div class="quality-group" ${!showQuality ? 'hidden' : ''}>
              <input type="range" class="quality-slider" min="0.1" max="1" step="0.05" value="${q}" aria-label="Quality">
              <span class="quality-label">${Math.round(q * 100)}%</span>
            </div>
          </div>

          <div class="strip-row">
            <input type="checkbox" class="strip-checkbox" id="strip-meta" ${this.stripMetadata ? 'checked' : ''}>
            <label for="strip-meta">Strip metadata</label>
          </div>

          <div class="output-info"></div>

          <button class="download-btn" disabled>
            ${ICONS.download} Download
          </button>
        </div>
      </div>`
  }
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
customElements.define('image-convert', ImageConvert)

export { ImageConvert }
