/**
 * @element image-editor
 * @summary A basic image editor web component for crop, rotate, filter, resize, and export.
 *
 * @attr {string} src - URL of image to load
 * @attr {string} mode - Theme mode: 'light' or 'dark' (auto-detects if omitted)
 * @attr {number} width - Constrain editor width
 * @attr {number} height - Constrain editor height
 * @attr {string} format - Default export format: 'png', 'jpeg', or 'webp'
 * @attr {number} quality - Export quality 0–1 for JPEG/WebP (default 0.92)
 * @attr {number} max-history - Maximum undo steps (default 50)
 * @attr {boolean} readonly - Disable all editing
 * @attr {boolean} no-toolbar - Hide toolbar for API-only use
 * @attr {string} aspect-ratio - Lock crop to ratio (e.g. '16:9')
 *
 * @cssprop --image-editor-bg - Editor background
 * @cssprop --image-editor-border-color - Border color
 * @cssprop --image-editor-border-radius - Corner radius
 * @cssprop --image-editor-toolbar-bg - Toolbar background
 * @cssprop --image-editor-button-color - Button icon color
 * @cssprop --image-editor-button-hover-bg - Button hover background
 * @cssprop --image-editor-button-active-color - Active tool button color
 * @cssprop --image-editor-accent-color - Accent/primary color
 * @cssprop --image-editor-crop-border - Crop selection border color
 * @cssprop --image-editor-workspace-bg - Canvas area background
 *
 * @fires image-load - When an image is loaded successfully
 * @fires image-load-error - When an image fails to load
 * @fires image-edit - When any edit operation is applied
 * @fires image-export - When the image is exported/downloaded
 * @fires tool-change - When the active tool changes
 * @fires zoom-change - When the zoom level changes
 * @fires history-change - When the undo/redo stack changes
 *
 * @example
 * <image-editor src="photo.jpg"></image-editor>
 *
 * @example
 * <image-editor mode="dark" format="webp" quality="0.85">
 *   <p>Drop an image here to start editing</p>
 * </image-editor>
 */

import { parseExif } from './lib/exif-parser.js'
import {
  detectMimeType, getFormatLabel,
  detectAVIFSupport, formatFileSize, estimateOutputSize
} from './lib/format-utils.js'

// ---------------------------------------------------------------------------
// Anti-FOUC — hide undefined element until registered
// ---------------------------------------------------------------------------
const _antiFlash = document.createElement('style')
_antiFlash.textContent =
  'image-editor:not(:defined){display:block;opacity:0}'
document.head.appendChild(_antiFlash)

// ---------------------------------------------------------------------------
// Page-level dark mode singleton (shared across instances)
// ---------------------------------------------------------------------------
const _registeredInstances = new Set()
let _pageObserver = null
let _currentPageDark = null

function _detectPageDarkMode() {
  const html = document.documentElement
  const body = document.body
  if (!html) return false

  // Tailwind: class="dark"
  if (html.classList.contains('dark') || body?.classList.contains('dark')) return true
  // Custom: data-theme="dark"
  if (html.getAttribute('data-theme') === 'dark') return true
  // Bootstrap: data-bs-theme="dark"
  if (html.getAttribute('data-bs-theme') === 'dark') return true
  // Vanilla Breeze: data-mode="dark"
  if (html.getAttribute('data-mode') === 'dark') return true
  // CSS property
  const cs = getComputedStyle(html).colorScheme
  if (cs && cs.includes('dark') && !cs.includes('light')) return true

  return false
}

function _onPageModeChange() {
  const wasDark = _currentPageDark
  _currentPageDark = _detectPageDarkMode()
  if (wasDark !== _currentPageDark) {
    for (const instance of _registeredInstances) {
      instance._onPageModeChange(_currentPageDark)
    }
  }
}

function _startObserving() {
  if (_pageObserver) return
  _currentPageDark = _detectPageDarkMode()

  _pageObserver = new MutationObserver(_onPageModeChange)
  const opts = { attributes: true, attributeFilter: ['class', 'data-theme', 'data-bs-theme', 'data-mode', 'style'] }
  _pageObserver.observe(document.documentElement, opts)
  if (document.body) _pageObserver.observe(document.body, opts)

  // Also listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', _onPageModeChange)
}

function _stopObserving() {
  if (_registeredInstances.size > 0 || !_pageObserver) return
  _pageObserver.disconnect()
  _pageObserver = null
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', _onPageModeChange)
}

function _registerInstance(instance) {
  _registeredInstances.add(instance)
  _startObserving()
  // Immediately notify of current state
  instance._onPageModeChange(_currentPageDark)
}

function _unregisterInstance(instance) {
  _registeredInstances.delete(instance)
  _stopObserving()
}

// ---------------------------------------------------------------------------
// SVG Icons (16x16 viewBox, stroke="currentColor", stroke-width="2")
// ---------------------------------------------------------------------------
const ICONS = {
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
}

// ---------------------------------------------------------------------------
// Aspect ratio presets
// ---------------------------------------------------------------------------
const ASPECT_PRESETS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '2:3', value: 2 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '9:16', value: 9 / 16 }
]

// ---------------------------------------------------------------------------
// Resize presets
// ---------------------------------------------------------------------------
const RESIZE_PRESETS = [
  { label: 'Custom', w: null, h: null },
  { label: '640 x 480', w: 640, h: 480 },
  { label: '800 x 600', w: 800, h: 600 },
  { label: '1024 x 768', w: 1024, h: 768 },
  { label: '1280 x 720', w: 1280, h: 720 },
  { label: '1920 x 1080', w: 1920, h: 1080 }
]

// ---------------------------------------------------------------------------
// Filter definitions
// ---------------------------------------------------------------------------
const FILTER_DEFS = [
  { name: 'brightness', label: 'Brightness', min: 0.5, max: 2, step: 0.05, initial: 1, unit: '' },
  { name: 'contrast', label: 'Contrast', min: 0.5, max: 2, step: 0.05, initial: 1, unit: '' },
  { name: 'saturate', label: 'Saturation', min: 0, max: 3, step: 0.05, initial: 1, unit: '' },
  { name: 'blur', label: 'Blur', min: 0, max: 10, step: 0.5, initial: 0, unit: 'px' },
  { name: 'grayscale', label: 'Grayscale', min: 0, max: 100, step: 1, initial: 0, unit: '%' },
  { name: 'sepia', label: 'Sepia', min: 0, max: 100, step: 1, initial: 0, unit: '%' }
]

// ---------------------------------------------------------------------------
// ImageEditor class
// ---------------------------------------------------------------------------
class ImageEditor extends HTMLElement {
  static get observedAttributes() {
    return [
      'src', 'mode', 'width', 'height', 'format', 'quality',
      'max-history', 'readonly', 'no-toolbar', 'aspect-ratio'
    ]
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    // State
    this._sourceCanvas = null
    this._sourceCtx = null
    this._displayCanvas = null
    this._displayCtx = null
    this._originalImage = null
    this._hasImage = false
    this._isDirty = false
    this._currentTool = null
    this._zoom = 1
    this._panX = 0
    this._panY = 0
    this._isPanning = false
    this._panStartX = 0
    this._panStartY = 0
    this._panStartPanX = 0
    this._panStartPanY = 0

    // History
    this._history = []
    this._historyIndex = -1

    // Source file info
    this._sourceFormat = null       // MIME type of loaded file
    this._sourceFileSize = 0        // Original file size in bytes
    this._sourceArrayBuffer = null  // Raw file data for EXIF
    this._exifData = null           // Parsed EXIF metadata
    this._avifSupported = false     // Browser AVIF encode support
    this._estimatedSize = 0         // Estimated export size
    this._estimateTimer = null      // Debounce timer for size estimation

    // Crop state
    this._cropRect = null
    this._cropHandle = null
    this._cropStartX = 0
    this._cropStartY = 0
    this._cropAspectRatio = null

    // Resize state
    this._resizeWidth = 0
    this._resizeHeight = 0
    this._resizeLocked = true

    // Filter state
    this._filters = {}
    for (const f of FILTER_DEFS) {
      this._filters[f.name] = f.initial
    }

    // Bound handlers
    this._handleToolbarClick = this._handleToolbarClick.bind(this)
    this._handleKeydown = this._handleKeydown.bind(this)
    this._handleDrop = this._handleDrop.bind(this)
    this._handleDragOver = this._handleDragOver.bind(this)
    this._handleDragLeave = this._handleDragLeave.bind(this)
    this._handleFileChange = this._handleFileChange.bind(this)
    this._handleWheel = this._handleWheel.bind(this)
    this._handleCanvasMouseDown = this._handleCanvasMouseDown.bind(this)
    this._handleCanvasMouseMove = this._handleCanvasMouseMove.bind(this)
    this._handleCanvasMouseUp = this._handleCanvasMouseUp.bind(this)
    this._handleContextInput = this._handleContextInput.bind(this)
    this._handleContextClick = this._handleContextClick.bind(this)
    this._handleDropZoneClick = this._handleDropZoneClick.bind(this)

    // ResizeObserver for responsive display
    this._resizeObserver = null
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------
  connectedCallback() {
    this.render()
    this._attachEventListeners()
    _registerInstance(this)

    // Detect AVIF support
    detectAVIFSupport().then((supported) => {
      this._avifSupported = supported
    })

    if (this.src) {
      this.loadImage(this.src)
    }

    // Observe workspace size for fit-to-view
    this._resizeObserver = new ResizeObserver(() => {
      if (this._hasImage) this._redrawDisplay()
    })
    const workspace = this.shadowRoot.querySelector('.workspace')
    if (workspace) this._resizeObserver.observe(workspace)
  }

  disconnectedCallback() {
    _unregisterInstance(this)
    this._removeEventListeners()
    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
      this._resizeObserver = null
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.shadowRoot || oldValue === newValue) return

    if (name === 'src' && newValue) {
      this.loadImage(newValue)
      return
    }

    if (name === 'mode' || name === 'no-toolbar' || name === 'readonly') {
      this.render()
      this._attachEventListeners()
      return
    }

    if (name === 'width' || name === 'height') {
      this._updateEditorSize()
    }
  }

  _onPageModeChange(isDark) {
    if (!this.hasAttribute('mode')) {
      this.setAttribute('data-page-mode', isDark ? 'dark' : 'light')
      this.render()
      this._attachEventListeners()
      // Restore image display after re-render
      if (this._hasImage) {
        this._displayCanvas = this.shadowRoot.querySelector('.canvas')
        this._displayCtx = this._displayCanvas?.getContext('2d')
        this._showCanvas()
        this._redrawDisplay()
      }
    }
  }

  // -------------------------------------------------------------------------
  // Attribute getters/setters
  // -------------------------------------------------------------------------
  get src() {
    return this.getAttribute('src')
  }
  set src(val) {
    if (val) this.setAttribute('src', val)
    else this.removeAttribute('src')
  }

  get mode() {
    return this.getAttribute('mode')
  }
  set mode(val) {
    if (val) this.setAttribute('mode', val)
    else this.removeAttribute('mode')
  }

  get format() {
    return this.getAttribute('format') || 'png'
  }
  set format(val) {
    this.setAttribute('format', val)
  }

  get quality() {
    const q = parseFloat(this.getAttribute('quality'))
    return isNaN(q) ? 0.92 : Math.max(0, Math.min(1, q))
  }
  set quality(val) {
    this.setAttribute('quality', String(val))
  }

  get maxHistory() {
    const m = parseInt(this.getAttribute('max-history'))
    return isNaN(m) ? 50 : Math.max(1, m)
  }
  set maxHistory(val) {
    this.setAttribute('max-history', String(val))
  }

  get readonly() {
    return this.hasAttribute('readonly')
  }
  set readonly(val) {
    if (val) this.setAttribute('readonly', '')
    else this.removeAttribute('readonly')
  }

  get noToolbar() {
    return this.hasAttribute('no-toolbar')
  }
  set noToolbar(val) {
    if (val) this.setAttribute('no-toolbar', '')
    else this.removeAttribute('no-toolbar')
  }

  get aspectRatio() {
    const val = this.getAttribute('aspect-ratio')
    if (!val) return null
    const parts = val.split(':').map(Number)
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) return parts[0] / parts[1]
    return null
  }
  set aspectRatio(val) {
    if (val) this.setAttribute('aspect-ratio', val)
    else this.removeAttribute('aspect-ratio')
  }

  // -------------------------------------------------------------------------
  // Read-only computed properties
  // -------------------------------------------------------------------------
  get imageWidth() {
    return this._sourceCanvas?.width || 0
  }

  get imageHeight() {
    return this._sourceCanvas?.height || 0
  }

  get hasImage() {
    return this._hasImage
  }

  get isDirty() {
    return this._isDirty
  }

  get canUndo() {
    return this._historyIndex > 0
  }

  get canRedo() {
    return this._historyIndex < this._history.length - 1
  }

  get zoomLevel() {
    return this._zoom
  }

  get currentTool() {
    return this._currentTool
  }

  get historyLength() {
    return this._history.length
  }

  get sourceFormat() {
    return this._sourceFormat
  }

  get exifData() {
    return this._exifData
  }

  // -------------------------------------------------------------------------
  // Theme detection
  // -------------------------------------------------------------------------
  get _isDark() {
    if (this.mode === 'dark') return true
    if (this.mode === 'light') return false
    const pageMode = this.getAttribute('data-page-mode')
    if (pageMode === 'dark') return true
    if (pageMode === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // -------------------------------------------------------------------------
  // Image loading
  // -------------------------------------------------------------------------
  async loadImage(source) {
    try {
      let img
      let arrayBuffer = null
      let fileSize = 0

      if (source instanceof Blob || source instanceof File) {
        fileSize = source.size
        arrayBuffer = await source.arrayBuffer()
        img = await this._loadBlob(source)
      } else if (typeof source === 'string') {
        img = await this._loadURL(source)
        // Try to get file info from URL fetch
        try {
          const resp = await fetch(source)
          const blob = await resp.blob()
          fileSize = blob.size
          arrayBuffer = await blob.arrayBuffer()
        } catch { /* Cross-origin or network error — skip metadata */ }
      } else {
        throw new Error('Invalid image source')
      }

      // Detect source format and parse EXIF
      if (arrayBuffer) {
        this._sourceArrayBuffer = arrayBuffer
        this._sourceFormat = detectMimeType(arrayBuffer)
        this._sourceFileSize = fileSize
        this._exifData = parseExif(arrayBuffer)
      } else {
        this._sourceArrayBuffer = null
        this._sourceFormat = null
        this._sourceFileSize = fileSize
        this._exifData = null
      }

      // Create source canvas from loaded image
      this._sourceCanvas = document.createElement('canvas')
      this._sourceCanvas.width = img.naturalWidth || img.width
      this._sourceCanvas.height = img.naturalHeight || img.height
      this._sourceCtx = this._sourceCanvas.getContext('2d')
      this._sourceCtx.drawImage(img, 0, 0)
      this._originalImage = this._sourceCtx.getImageData(
        0, 0, this._sourceCanvas.width, this._sourceCanvas.height
      )

      this._hasImage = true
      this._isDirty = false
      this._history = []
      this._historyIndex = -1
      this._pushHistory()
      this._resetFilters()
      this._currentTool = null

      // Get display canvas reference and show it
      this._displayCanvas = this.shadowRoot.querySelector('.canvas')
      this._displayCtx = this._displayCanvas?.getContext('2d')
      this._showCanvas()
      this.zoomToFit()
      this._updateStatus()
      this._updateToolbarState()

      this.dispatchEvent(new CustomEvent('image-load', {
        bubbles: true,
        composed: true,
        detail: {
          width: this._sourceCanvas.width,
          height: this._sourceCanvas.height,
          src: typeof source === 'string' ? source : source.name || 'blob'
        }
      }))
    } catch (err) {
      console.error('image-editor: failed to load image', err)
      this.dispatchEvent(new CustomEvent('image-load-error', {
        bubbles: true,
        composed: true,
        detail: {
          src: typeof source === 'string' ? source : 'blob',
          error: err.message
        }
      }))
    }
  }

  _loadURL(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  }

  _loadBlob(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image from blob'))
      }
      img.src = url
    })
  }

  // -------------------------------------------------------------------------
  // Canvas display
  // -------------------------------------------------------------------------
  _showCanvas() {
    const dropZone = this.shadowRoot.querySelector('.drop-zone')
    const canvas = this.shadowRoot.querySelector('.canvas')
    if (dropZone) dropZone.hidden = true
    if (canvas) canvas.hidden = false
  }

  _hideCanvas() {
    const dropZone = this.shadowRoot.querySelector('.drop-zone')
    const canvas = this.shadowRoot.querySelector('.canvas')
    if (dropZone) dropZone.hidden = false
    if (canvas) canvas.hidden = true
  }

  _redrawDisplay() {
    if (!this._sourceCanvas || !this._displayCanvas || !this._displayCtx) return

    const workspace = this.shadowRoot.querySelector('.workspace')
    if (!workspace) return
    const wRect = workspace.getBoundingClientRect()

    // Size display canvas to workspace
    const dpr = window.devicePixelRatio || 1
    this._displayCanvas.width = wRect.width * dpr
    this._displayCanvas.height = wRect.height * dpr
    this._displayCanvas.style.width = wRect.width + 'px'
    this._displayCanvas.style.height = wRect.height + 'px'

    const ctx = this._displayCtx
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Clear with checkerboard (handled by CSS background)
    ctx.clearRect(0, 0, wRect.width, wRect.height)

    // Calculate image position (centered with zoom + pan)
    const imgW = this._sourceCanvas.width * this._zoom
    const imgH = this._sourceCanvas.height * this._zoom
    const x = (wRect.width - imgW) / 2 + this._panX
    const y = (wRect.height - imgH) / 2 + this._panY

    // Build filter string for preview
    const filterStr = this._buildFilterString()

    ctx.save()
    if (filterStr !== 'none') {
      ctx.filter = filterStr
    }
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(this._sourceCanvas, x, y, imgW, imgH)
    ctx.restore()

    // Store image rect for hit testing
    this._imageRect = { x, y, w: imgW, h: imgH }
  }

  // -------------------------------------------------------------------------
  // Zoom & Pan
  // -------------------------------------------------------------------------
  zoomTo(level) {
    this._zoom = Math.max(0.1, Math.min(5, level))
    this._redrawDisplay()
    this._updateZoomLabel()
    this.dispatchEvent(new CustomEvent('zoom-change', {
      bubbles: true, composed: true,
      detail: { level: this._zoom }
    }))
  }

  zoomToFit() {
    if (!this._sourceCanvas) return
    const workspace = this.shadowRoot.querySelector('.workspace')
    if (!workspace) return
    const wRect = workspace.getBoundingClientRect()
    const padding = 20
    const scaleX = (wRect.width - padding * 2) / this._sourceCanvas.width
    const scaleY = (wRect.height - padding * 2) / this._sourceCanvas.height
    this._zoom = Math.min(1, Math.min(scaleX, scaleY))
    this._panX = 0
    this._panY = 0
    this._redrawDisplay()
    this._updateZoomLabel()
    this.dispatchEvent(new CustomEvent('zoom-change', {
      bubbles: true, composed: true,
      detail: { level: this._zoom }
    }))
  }

  _updateZoomLabel() {
    const label = this.shadowRoot.querySelector('.zoom-label')
    if (label) label.textContent = Math.round(this._zoom * 100) + '%'
  }

  // -------------------------------------------------------------------------
  // History (undo/redo)
  // -------------------------------------------------------------------------
  _pushHistory() {
    if (!this._sourceCanvas) return

    // Trim any redo history
    if (this._historyIndex < this._history.length - 1) {
      this._history = this._history.slice(0, this._historyIndex + 1)
    }

    // Push current state
    const data = this._sourceCtx.getImageData(
      0, 0, this._sourceCanvas.width, this._sourceCanvas.height
    )
    this._history.push({
      imageData: data,
      width: this._sourceCanvas.width,
      height: this._sourceCanvas.height
    })
    this._historyIndex = this._history.length - 1

    // Trim oldest entries if over limit
    while (this._history.length > this.maxHistory) {
      this._history.shift()
      this._historyIndex--
    }

    this._updateToolbarState()
    this.dispatchEvent(new CustomEvent('history-change', {
      bubbles: true, composed: true,
      detail: { canUndo: this.canUndo, canRedo: this.canRedo, length: this._history.length }
    }))
  }

  undo() {
    if (!this.canUndo || this.readonly) return
    this._historyIndex--
    this._restoreFromHistory()
    this._updateToolbarState()
    this.dispatchEvent(new CustomEvent('history-change', {
      bubbles: true, composed: true,
      detail: { canUndo: this.canUndo, canRedo: this.canRedo, length: this._history.length }
    }))
  }

  redo() {
    if (!this.canRedo || this.readonly) return
    this._historyIndex++
    this._restoreFromHistory()
    this._updateToolbarState()
    this.dispatchEvent(new CustomEvent('history-change', {
      bubbles: true, composed: true,
      detail: { canUndo: this.canUndo, canRedo: this.canRedo, length: this._history.length }
    }))
  }

  _restoreFromHistory() {
    const state = this._history[this._historyIndex]
    if (!state) return
    this._sourceCanvas.width = state.width
    this._sourceCanvas.height = state.height
    this._sourceCtx.putImageData(state.imageData, 0, 0)
    this._redrawDisplay()
    this._updateStatus()
  }

  reset() {
    if (!this._originalImage || this.readonly) return
    this._sourceCanvas.width = this._originalImage.width
    this._sourceCanvas.height = this._originalImage.height
    this._sourceCtx.putImageData(this._originalImage, 0, 0)
    this._resetFilters()
    this._pushHistory()
    this._isDirty = false
    this.zoomToFit()
    this._updateStatus()
  }

  // -------------------------------------------------------------------------
  // Edit operations
  // -------------------------------------------------------------------------
  rotate(degrees) {
    if (!this._hasImage || this.readonly) return
    const steps = ((degrees % 360) + 360) % 360 / 90
    if (steps === 0) return

    const sw = this._sourceCanvas.width
    const sh = this._sourceCanvas.height

    // Create temp canvas for rotation
    const temp = document.createElement('canvas')
    const tctx = temp.getContext('2d')

    if (steps === 1 || steps === 3) {
      temp.width = sh
      temp.height = sw
    } else {
      temp.width = sw
      temp.height = sh
    }

    tctx.save()
    tctx.translate(temp.width / 2, temp.height / 2)
    tctx.rotate((steps * 90 * Math.PI) / 180)
    tctx.drawImage(this._sourceCanvas, -sw / 2, -sh / 2)
    tctx.restore()

    this._sourceCanvas.width = temp.width
    this._sourceCanvas.height = temp.height
    this._sourceCtx.drawImage(temp, 0, 0)

    this._isDirty = true
    this._pushHistory()
    this.zoomToFit()
    this._updateStatus()

    this.dispatchEvent(new CustomEvent('image-edit', {
      bubbles: true, composed: true,
      detail: { action: 'rotate', params: { degrees } }
    }))
  }

  flipHorizontal() {
    if (!this._hasImage || this.readonly) return
    const w = this._sourceCanvas.width
    const h = this._sourceCanvas.height
    const temp = document.createElement('canvas')
    temp.width = w
    temp.height = h
    const tctx = temp.getContext('2d')
    tctx.translate(w, 0)
    tctx.scale(-1, 1)
    tctx.drawImage(this._sourceCanvas, 0, 0)

    this._sourceCtx.clearRect(0, 0, w, h)
    this._sourceCtx.drawImage(temp, 0, 0)

    this._isDirty = true
    this._pushHistory()
    this._redrawDisplay()

    this.dispatchEvent(new CustomEvent('image-edit', {
      bubbles: true, composed: true,
      detail: { action: 'flip-horizontal' }
    }))
  }

  flipVertical() {
    if (!this._hasImage || this.readonly) return
    const w = this._sourceCanvas.width
    const h = this._sourceCanvas.height
    const temp = document.createElement('canvas')
    temp.width = w
    temp.height = h
    const tctx = temp.getContext('2d')
    tctx.translate(0, h)
    tctx.scale(1, -1)
    tctx.drawImage(this._sourceCanvas, 0, 0)

    this._sourceCtx.clearRect(0, 0, w, h)
    this._sourceCtx.drawImage(temp, 0, 0)

    this._isDirty = true
    this._pushHistory()
    this._redrawDisplay()

    this.dispatchEvent(new CustomEvent('image-edit', {
      bubbles: true, composed: true,
      detail: { action: 'flip-vertical' }
    }))
  }

  resize(w, h) {
    if (!this._hasImage || this.readonly) return
    w = Math.max(1, Math.round(w))
    h = Math.max(1, Math.round(h))

    const temp = document.createElement('canvas')
    temp.width = w
    temp.height = h
    const tctx = temp.getContext('2d')
    tctx.imageSmoothingEnabled = true
    tctx.imageSmoothingQuality = 'high'
    tctx.drawImage(this._sourceCanvas, 0, 0, w, h)

    this._sourceCanvas.width = w
    this._sourceCanvas.height = h
    this._sourceCtx.drawImage(temp, 0, 0)

    this._isDirty = true
    this._pushHistory()
    this.zoomToFit()
    this._updateStatus()

    this.dispatchEvent(new CustomEvent('image-edit', {
      bubbles: true, composed: true,
      detail: { action: 'resize', params: { width: w, height: h } }
    }))
  }

  crop(x, y, w, h) {
    if (!this._hasImage || this.readonly) return
    x = Math.max(0, Math.round(x))
    y = Math.max(0, Math.round(y))
    w = Math.max(1, Math.round(Math.min(w, this._sourceCanvas.width - x)))
    h = Math.max(1, Math.round(Math.min(h, this._sourceCanvas.height - y)))

    const imgData = this._sourceCtx.getImageData(x, y, w, h)
    this._sourceCanvas.width = w
    this._sourceCanvas.height = h
    this._sourceCtx.putImageData(imgData, 0, 0)

    this._isDirty = true
    this._pushHistory()
    this.zoomToFit()
    this._updateStatus()

    this.dispatchEvent(new CustomEvent('image-edit', {
      bubbles: true, composed: true,
      detail: { action: 'crop', params: { x, y, width: w, height: h } }
    }))
  }

  // -------------------------------------------------------------------------
  // Filters
  // -------------------------------------------------------------------------
  applyFilter(name, value) {
    if (!this._hasImage || this.readonly) return
    const def = FILTER_DEFS.find((f) => f.name === name)
    if (!def) return
    this._filters[name] = Math.max(def.min, Math.min(def.max, value))
    this._redrawDisplay()
  }

  resetFilters() {
    this._resetFilters()
    this._redrawDisplay()
    this._updateFilterSliders()
  }

  _resetFilters() {
    for (const f of FILTER_DEFS) {
      this._filters[f.name] = f.initial
    }
  }

  _buildFilterString() {
    const parts = []
    for (const f of FILTER_DEFS) {
      const val = this._filters[f.name]
      if (val !== f.initial) {
        parts.push(`${f.name}(${val}${f.unit})`)
      }
    }
    return parts.length > 0 ? parts.join(' ') : 'none'
  }

  _hasActiveFilters() {
    return FILTER_DEFS.some((f) => this._filters[f.name] !== f.initial)
  }

  _commitFilters() {
    if (!this._hasActiveFilters() || this.readonly) return

    const w = this._sourceCanvas.width
    const h = this._sourceCanvas.height
    const temp = document.createElement('canvas')
    temp.width = w
    temp.height = h
    const tctx = temp.getContext('2d')
    tctx.filter = this._buildFilterString()
    tctx.drawImage(this._sourceCanvas, 0, 0)

    this._sourceCtx.clearRect(0, 0, w, h)
    this._sourceCtx.drawImage(temp, 0, 0)

    this._resetFilters()
    this._isDirty = true
    this._pushHistory()
    this._redrawDisplay()
    this._updateFilterSliders()

    this.dispatchEvent(new CustomEvent('image-edit', {
      bubbles: true, composed: true,
      detail: { action: 'filter' }
    }))
  }

  // -------------------------------------------------------------------------
  // Export
  // -------------------------------------------------------------------------
  getDataURL(format, quality) {
    if (!this._sourceCanvas) return ''
    const fmt = format || this.format
    const q = quality !== undefined ? quality : this.quality
    const mimeType = fmt === 'jpeg' ? 'image/jpeg' : fmt === 'webp' ? 'image/webp' : 'image/png'

    // If filters are active, commit them to a temp canvas for export
    if (this._hasActiveFilters()) {
      const temp = document.createElement('canvas')
      temp.width = this._sourceCanvas.width
      temp.height = this._sourceCanvas.height
      const tctx = temp.getContext('2d')
      tctx.filter = this._buildFilterString()
      tctx.drawImage(this._sourceCanvas, 0, 0)
      return temp.toDataURL(mimeType, q)
    }

    return this._sourceCanvas.toDataURL(mimeType, q)
  }

  async getBlob(format, quality) {
    if (!this._sourceCanvas) return null
    const fmt = format || this.format
    const q = quality !== undefined ? quality : this.quality
    const mimeType = fmt === 'jpeg' ? 'image/jpeg' : fmt === 'webp' ? 'image/webp' : 'image/png'

    let canvas = this._sourceCanvas
    if (this._hasActiveFilters()) {
      canvas = document.createElement('canvas')
      canvas.width = this._sourceCanvas.width
      canvas.height = this._sourceCanvas.height
      const tctx = canvas.getContext('2d')
      tctx.filter = this._buildFilterString()
      tctx.drawImage(this._sourceCanvas, 0, 0)
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), mimeType, q)
    })
  }

  async download(filename, format, quality) {
    const fmt = format || this.format
    const blob = await this.getBlob(fmt, quality)
    if (!blob) return

    const name = filename || `image.${fmt}`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)

    this.dispatchEvent(new CustomEvent('image-export', {
      bubbles: true, composed: true,
      detail: { format: fmt, quality: quality || this.quality, size: blob.size }
    }))
  }

  // -------------------------------------------------------------------------
  // Tool management
  // -------------------------------------------------------------------------
  _setTool(tool) {
    const prev = this._currentTool
    if (prev === tool) {
      // Toggle off
      this._currentTool = null
      this._hideCropOverlay()
      this._hideContextBar()
    } else {
      this._currentTool = tool
      this._hideCropOverlay()
      this._showContextBar(tool)
      if (tool === 'crop') this._initCrop()
      if (tool === 'export') this._updateEstimatedSize()
    }
    this._updateToolbarState()
    this.dispatchEvent(new CustomEvent('tool-change', {
      bubbles: true, composed: true,
      detail: { tool: this._currentTool, previous: prev }
    }))
  }

  // -------------------------------------------------------------------------
  // Crop tool
  // -------------------------------------------------------------------------
  _initCrop() {
    if (!this._hasImage || !this._imageRect) return

    // Default crop to full image area
    const ir = this._imageRect
    const margin = Math.min(ir.w, ir.h) * 0.1
    this._cropRect = {
      x: ir.x + margin,
      y: ir.y + margin,
      w: ir.w - margin * 2,
      h: ir.h - margin * 2
    }
    this._cropAspectRatio = this.aspectRatio || null
    if (this._cropAspectRatio) {
      this._constrainCropToAspect()
    }
    this._showCropOverlay()
  }

  _showCropOverlay() {
    const overlay = this.shadowRoot.querySelector('.crop-overlay')
    if (!overlay) return
    overlay.hidden = false
    this.shadowRoot.querySelectorAll('.crop-dim').forEach((d) => d.hidden = false)
    this._updateCropOverlay()
  }

  _hideCropOverlay() {
    const overlay = this.shadowRoot.querySelector('.crop-overlay')
    if (overlay) overlay.hidden = true
    this.shadowRoot.querySelectorAll('.crop-dim').forEach((d) => d.hidden = true)
    this._cropRect = null
  }

  _updateCropOverlay() {
    const overlay = this.shadowRoot.querySelector('.crop-overlay')
    if (!overlay || !this._cropRect || !this._imageRect) return

    const cr = this._cropRect
    const ir = this._imageRect

    // Clamp crop to image bounds
    cr.x = Math.max(ir.x, Math.min(cr.x, ir.x + ir.w - 20))
    cr.y = Math.max(ir.y, Math.min(cr.y, ir.y + ir.h - 20))
    cr.w = Math.max(20, Math.min(cr.w, ir.x + ir.w - cr.x))
    cr.h = Math.max(20, Math.min(cr.h, ir.y + ir.h - cr.y))

    overlay.style.left = cr.x + 'px'
    overlay.style.top = cr.y + 'px'
    overlay.style.width = cr.w + 'px'
    overlay.style.height = cr.h + 'px'

    // Update dim regions (siblings of overlay in workspace)
    const workspace = this.shadowRoot.querySelector('.workspace')
    const dims = workspace?.querySelectorAll('.crop-dim')
    if (dims.length === 4) {
      // top
      dims[0].style.cssText = `left:${ir.x}px;top:${ir.y}px;width:${ir.w}px;height:${cr.y - ir.y}px`
      // bottom
      dims[1].style.cssText = `left:${ir.x}px;top:${cr.y + cr.h}px;width:${ir.w}px;height:${ir.y + ir.h - cr.y - cr.h}px`
      // left
      dims[2].style.cssText = `left:${ir.x}px;top:${cr.y}px;width:${cr.x - ir.x}px;height:${cr.h}px`
      // right
      dims[3].style.cssText = `left:${cr.x + cr.w}px;top:${cr.y}px;width:${ir.x + ir.w - cr.x - cr.w}px;height:${cr.h}px`
    }
  }

  _constrainCropToAspect() {
    if (!this._cropRect || !this._cropAspectRatio) return
    const cr = this._cropRect
    const targetW = cr.h * this._cropAspectRatio
    if (targetW <= cr.w) {
      cr.x += (cr.w - targetW) / 2
      cr.w = targetW
    } else {
      const targetH = cr.w / this._cropAspectRatio
      cr.y += (cr.h - targetH) / 2
      cr.h = targetH
    }
  }

  _applyCrop() {
    if (!this._cropRect || !this._imageRect) return

    const ir = this._imageRect
    const cr = this._cropRect

    // Convert display coordinates to image coordinates
    const sx = (cr.x - ir.x) / this._zoom
    const sy = (cr.y - ir.y) / this._zoom
    const sw = cr.w / this._zoom
    const sh = cr.h / this._zoom

    this._hideCropOverlay()
    this._currentTool = null
    this._hideContextBar()
    this._updateToolbarState()
    this.crop(sx, sy, sw, sh)
  }

  _getCropHandle(mx, my) {
    if (!this._cropRect) return null
    const cr = this._cropRect
    const hs = 8 // handle size

    const handles = [
      { name: 'nw', x: cr.x, y: cr.y },
      { name: 'ne', x: cr.x + cr.w, y: cr.y },
      { name: 'sw', x: cr.x, y: cr.y + cr.h },
      { name: 'se', x: cr.x + cr.w, y: cr.y + cr.h },
      { name: 'n', x: cr.x + cr.w / 2, y: cr.y },
      { name: 's', x: cr.x + cr.w / 2, y: cr.y + cr.h },
      { name: 'w', x: cr.x, y: cr.y + cr.h / 2 },
      { name: 'e', x: cr.x + cr.w, y: cr.y + cr.h / 2 }
    ]

    for (const h of handles) {
      if (Math.abs(mx - h.x) <= hs && Math.abs(my - h.y) <= hs) return h.name
    }

    // Check if inside crop (for move)
    if (mx >= cr.x && mx <= cr.x + cr.w && my >= cr.y && my <= cr.y + cr.h) return 'move'

    return null
  }

  // -------------------------------------------------------------------------
  // Context bar
  // -------------------------------------------------------------------------
  _showContextBar(tool) {
    const bar = this.shadowRoot.querySelector('.context-bar')
    if (!bar) return
    bar.hidden = false
    bar.innerHTML = this._getContextBarHTML(tool)
  }

  _hideContextBar() {
    const bar = this.shadowRoot.querySelector('.context-bar')
    if (bar) {
      bar.hidden = true
      bar.innerHTML = ''
    }
  }

  _getContextBarHTML(tool) {
    if (tool === 'crop') {
      const presets = ASPECT_PRESETS.map((p) => {
        const active = (p.value === null && !this._cropAspectRatio) ||
          (p.value !== null && Math.abs(p.value - this._cropAspectRatio) < 0.01)
        return `<button class="context-btn ${active ? 'active' : ''}" data-context-action="crop-aspect" data-value="${p.value}">${p.label}</button>`
      }).join('')
      return `
        <div class="context-group">
          <span class="context-label">Aspect:</span>
          ${presets}
        </div>
        <div class="context-group context-actions">
          <button class="context-btn primary" data-context-action="crop-apply">${ICONS.check} Apply</button>
          <button class="context-btn" data-context-action="crop-cancel">${ICONS.x} Cancel</button>
        </div>`
    }

    if (tool === 'resize') {
      const w = this._resizeWidth || this.imageWidth
      const h = this._resizeHeight || this.imageHeight
      const presetOptions = RESIZE_PRESETS.map((p) =>
        `<option value="${p.w}x${p.h}" ${p.w === w && p.h === h ? 'selected' : ''}>${p.label}</option>`
      ).join('')
      return `
        <div class="context-group">
          <span class="context-label">Size:</span>
          <select class="context-select" data-context-action="resize-preset">${presetOptions}</select>
          <input type="number" class="context-input" data-context-action="resize-w" value="${w}" min="1" max="10000" aria-label="Width">
          <span class="context-label">x</span>
          <input type="number" class="context-input" data-context-action="resize-h" value="${h}" min="1" max="10000" aria-label="Height">
          <button class="context-btn icon-btn ${this._resizeLocked ? 'active' : ''}" data-context-action="resize-lock" aria-label="Lock aspect ratio" title="Lock aspect ratio">${this._resizeLocked ? ICONS.lock : ICONS.unlock}</button>
        </div>
        <div class="context-group context-actions">
          <button class="context-btn primary" data-context-action="resize-apply">${ICONS.check} Apply</button>
          <button class="context-btn" data-context-action="resize-cancel">${ICONS.x} Cancel</button>
        </div>`
    }

    if (tool === 'filters') {
      const sliders = FILTER_DEFS.map((f) => `
        <div class="filter-slider">
          <label>${f.label}</label>
          <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${this._filters[f.name]}" data-context-action="filter-slider" data-filter="${f.name}" aria-label="${f.label}">
          <span class="filter-value">${this._filters[f.name]}${f.unit}</span>
        </div>`
      ).join('')
      return `
        <div class="context-group context-filters">
          ${sliders}
        </div>
        <div class="context-group context-actions">
          <button class="context-btn primary" data-context-action="filter-apply">${ICONS.check} Apply</button>
          <button class="context-btn" data-context-action="filter-reset">${ICONS.x} Reset</button>
        </div>`
    }

    if (tool === 'export') {
      const avifOption = this._avifSupported
        ? `<option value="avif" ${this.format === 'avif' ? 'selected' : ''}>AVIF</option>`
        : ''
      const sizeLabel = this._estimatedSize > 0 ? formatFileSize(this._estimatedSize) : '...'
      return `
        <div class="context-group">
          <span class="context-label">Format:</span>
          <select class="context-select" data-context-action="export-format">
            <option value="png" ${this.format === 'png' ? 'selected' : ''}>PNG</option>
            <option value="jpeg" ${this.format === 'jpeg' ? 'selected' : ''}>JPEG</option>
            <option value="webp" ${this.format === 'webp' ? 'selected' : ''}>WebP</option>
            ${avifOption}
          </select>
          <span class="context-label quality-label">Quality:</span>
          <input type="range" class="context-range" min="0.1" max="1" step="0.05" value="${this.quality}" data-context-action="export-quality" aria-label="Export quality">
          <span class="quality-value">${Math.round(this.quality * 100)}%</span>
          <span class="context-label">≈</span>
          <span class="estimated-size">${sizeLabel}</span>
        </div>
        <div class="context-group context-actions">
          <button class="context-btn primary" data-context-action="export-download">${ICONS.download} Download</button>
        </div>`
    }

    if (tool === 'metadata') {
      if (!this._exifData || Object.keys(this._exifData).length === 0) {
        return `<div class="context-group"><span class="context-label">No EXIF metadata found in this image.</span></div>`
      }
      const fields = []
      const d = this._exifData
      if (d.make) fields.push(['Camera', `${d.make}${d.model ? ' ' + d.model : ''}`])
      if (d.dateOriginal || d.dateTime) fields.push(['Date', d.dateOriginal || d.dateTime])
      if (d.pixelXDimension && d.pixelYDimension) fields.push(['Original Size', `${d.pixelXDimension} × ${d.pixelYDimension}`])
      if (d.orientation) fields.push(['Orientation', d.orientation])
      if (d.exposureTime) fields.push(['Exposure', d.exposureTime < 1 ? `1/${Math.round(1 / d.exposureTime)}s` : `${d.exposureTime}s`])
      if (d.fNumber) fields.push(['Aperture', `f/${d.fNumber}`])
      if (d.iso) fields.push(['ISO', d.iso])
      if (d.focalLength) fields.push(['Focal Length', `${d.focalLength}mm`])
      if (d.flash !== undefined) fields.push(['Flash', d.flash & 1 ? 'Fired' : 'No flash'])
      if (d.software) fields.push(['Software', d.software])
      if (d.gpsLatitude !== undefined && d.gpsLongitude !== undefined) {
        fields.push(['GPS', `${d.gpsLatitude.toFixed(4)}, ${d.gpsLongitude.toFixed(4)}`])
      }
      if (d.colorSpace) fields.push(['Color Space', d.colorSpace === 1 ? 'sRGB' : d.colorSpace === 65535 ? 'Uncalibrated' : d.colorSpace])
      if (d.whiteBalance !== undefined) fields.push(['White Balance', d.whiteBalance === 0 ? 'Auto' : 'Manual'])

      const grid = fields.map(([k, v]) =>
        `<span class="meta-key">${k}</span><span class="meta-value">${v}</span>`
      ).join('')

      return `<div class="context-group context-metadata"><div class="meta-grid">${grid}</div></div>`
    }

    return ''
  }

  _updateEstimatedSize() {
    if (!this._sourceCanvas || this._currentTool !== 'export') return
    clearTimeout(this._estimateTimer)
    this._estimateTimer = setTimeout(async () => {
      const fmtSelect = this.shadowRoot.querySelector('[data-context-action="export-format"]')
      const qRange = this.shadowRoot.querySelector('[data-context-action="export-quality"]')
      const fmt = fmtSelect?.value || this.format
      const q = qRange ? parseFloat(qRange.value) : this.quality
      this._estimatedSize = await estimateOutputSize(this._sourceCanvas, fmt, q)
      const sizeEl = this.shadowRoot.querySelector('.estimated-size')
      if (sizeEl) sizeEl.textContent = formatFileSize(this._estimatedSize)
    }, 200)
  }

  _updateFilterSliders() {
    const bar = this.shadowRoot.querySelector('.context-bar')
    if (!bar || this._currentTool !== 'filters') return
    const sliders = bar.querySelectorAll('input[data-filter]')
    sliders.forEach((slider) => {
      const name = slider.getAttribute('data-filter')
      if (this._filters[name] !== undefined) {
        slider.value = this._filters[name]
        const valueSpan = slider.parentElement.querySelector('.filter-value')
        const def = FILTER_DEFS.find((f) => f.name === name)
        if (valueSpan && def) valueSpan.textContent = this._filters[name] + def.unit
      }
    })
  }

  // -------------------------------------------------------------------------
  // Event handling
  // -------------------------------------------------------------------------
  _attachEventListeners() {
    this._removeEventListeners()

    const toolbar = this.shadowRoot.querySelector('.toolbar')
    if (toolbar) toolbar.addEventListener('click', this._handleToolbarClick)

    const workspace = this.shadowRoot.querySelector('.workspace')
    if (workspace) {
      workspace.addEventListener('drop', this._handleDrop)
      workspace.addEventListener('dragover', this._handleDragOver)
      workspace.addEventListener('dragleave', this._handleDragLeave)
      workspace.addEventListener('wheel', this._handleWheel, { passive: false })
    }

    // Listen on workspace (not canvas) so crop overlay clicks are captured
    if (workspace) {
      workspace.addEventListener('mousedown', this._handleCanvasMouseDown)
    }

    const dropZone = this.shadowRoot.querySelector('.drop-zone')
    if (dropZone) {
      dropZone.addEventListener('click', this._handleDropZoneClick)
    }

    const fileInput = this.shadowRoot.querySelector('.file-input')
    if (fileInput) fileInput.addEventListener('change', this._handleFileChange)

    const contextBar = this.shadowRoot.querySelector('.context-bar')
    if (contextBar) {
      contextBar.addEventListener('input', this._handleContextInput)
      contextBar.addEventListener('click', this._handleContextClick)
      contextBar.addEventListener('change', this._handleContextInput)
    }

    document.addEventListener('mousemove', this._handleCanvasMouseMove)
    document.addEventListener('mouseup', this._handleCanvasMouseUp)
    document.addEventListener('keydown', this._handleKeydown)
  }

  _removeEventListeners() {
    document.removeEventListener('mousemove', this._handleCanvasMouseMove)
    document.removeEventListener('mouseup', this._handleCanvasMouseUp)
    document.removeEventListener('keydown', this._handleKeydown)
  }

  _handleToolbarClick(e) {
    const btn = e.target.closest('[data-action]')
    if (!btn || btn.disabled) return
    const action = btn.getAttribute('data-action')

    if (this.readonly && action !== 'zoom-in' && action !== 'zoom-out' && action !== 'zoom-fit' && action !== 'export') return

    switch (action) {
      case 'open':
        this.shadowRoot.querySelector('.file-input')?.click()
        break
      case 'crop':
        this._setTool('crop')
        break
      case 'rotate-left':
        this.rotate(-90)
        break
      case 'rotate-right':
        this.rotate(90)
        break
      case 'flip-h':
        this.flipHorizontal()
        break
      case 'flip-v':
        this.flipVertical()
        break
      case 'resize':
        this._resizeWidth = this.imageWidth
        this._resizeHeight = this.imageHeight
        this._setTool('resize')
        break
      case 'filters':
        this._setTool('filters')
        break
      case 'metadata':
        this._setTool('metadata')
        break
      case 'undo':
        this.undo()
        break
      case 'redo':
        this.redo()
        break
      case 'zoom-in':
        this.zoomTo(this._zoom * 1.25)
        break
      case 'zoom-out':
        this.zoomTo(this._zoom / 1.25)
        break
      case 'zoom-fit':
        this.zoomToFit()
        break
      case 'export':
        this._setTool('export')
        break
    }
  }

  _handleKeydown(e) {
    // Only handle when this component or its shadow DOM has focus
    if (!this.contains(document.activeElement) && !this.shadowRoot.contains(this.shadowRoot.activeElement)) return

    if (e.key === 'Escape') {
      if (this._currentTool) {
        this._hideCropOverlay()
        this._currentTool = null
        this._hideContextBar()
        this._updateToolbarState()
        this._resetFilters()
        this._redrawDisplay()
      }
    }

    // Ctrl/Cmd + Z = undo, Ctrl/Cmd + Shift + Z = redo
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      this.undo()
    }
    if (mod && e.key === 'z' && e.shiftKey) {
      e.preventDefault()
      this.redo()
    }

    // Arrow keys nudge crop
    if (this._currentTool === 'crop' && this._cropRect) {
      const step = e.shiftKey ? 10 : 1
      if (e.key === 'ArrowLeft') { this._cropRect.x -= step; this._updateCropOverlay(); e.preventDefault() }
      if (e.key === 'ArrowRight') { this._cropRect.x += step; this._updateCropOverlay(); e.preventDefault() }
      if (e.key === 'ArrowUp') { this._cropRect.y -= step; this._updateCropOverlay(); e.preventDefault() }
      if (e.key === 'ArrowDown') { this._cropRect.y += step; this._updateCropOverlay(); e.preventDefault() }
      if (e.key === 'Enter') { this._applyCrop(); e.preventDefault() }
    }
  }

  _handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    const workspace = this.shadowRoot.querySelector('.workspace')
    if (workspace) workspace.classList.remove('drag-over')

    if (this.readonly) return
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('image/')) {
      this.loadImage(file)
    }
  }

  _handleDragOver(e) {
    e.preventDefault()
    const workspace = this.shadowRoot.querySelector('.workspace')
    if (workspace) workspace.classList.add('drag-over')
  }

  _handleDragLeave(e) {
    e.preventDefault()
    const workspace = this.shadowRoot.querySelector('.workspace')
    if (workspace) workspace.classList.remove('drag-over')
  }

  _handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) this.loadImage(file)
    e.target.value = '' // Reset so same file can be re-selected
  }

  _handleWheel(e) {
    if (!this._hasImage) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    this.zoomTo(this._zoom * delta)
  }

  _handleDropZoneClick() {
    if (this.readonly) return
    this.shadowRoot.querySelector('.file-input')?.click()
  }

  _handleCanvasMouseDown(e) {
    if (!this._hasImage || !this._displayCanvas) return
    // Ignore clicks on the drop zone (handled separately)
    if (e.target.closest?.('.drop-zone') || e.target.classList?.contains('drop-zone')) return

    const rect = this._displayCanvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    // Crop handle detection
    if (this._currentTool === 'crop' && this._cropRect) {
      const handle = this._getCropHandle(mx, my)
      if (handle) {
        this._cropHandle = handle
        this._cropStartX = mx
        this._cropStartY = my
        this._cropStartRect = { ...this._cropRect }
        e.preventDefault()
        return
      }
    }

    // Pan
    this._isPanning = true
    this._panStartX = e.clientX
    this._panStartY = e.clientY
    this._panStartPanX = this._panX
    this._panStartPanY = this._panY
    this._displayCanvas.style.cursor = 'grabbing'
  }

  _handleCanvasMouseMove(e) {
    if (!this._hasImage) return

    // Crop handle dragging
    if (this._cropHandle && this._cropRect && this._cropStartRect) {
      const rect = this._displayCanvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const dx = mx - this._cropStartX
      const dy = my - this._cropStartY
      const sr = this._cropStartRect

      if (this._cropHandle === 'move') {
        this._cropRect.x = sr.x + dx
        this._cropRect.y = sr.y + dy
      } else {
        if (this._cropHandle.includes('w')) {
          this._cropRect.x = sr.x + dx
          this._cropRect.w = sr.w - dx
        }
        if (this._cropHandle.includes('e')) {
          this._cropRect.w = sr.w + dx
        }
        if (this._cropHandle.includes('n')) {
          this._cropRect.y = sr.y + dy
          this._cropRect.h = sr.h - dy
        }
        if (this._cropHandle.includes('s')) {
          this._cropRect.h = sr.h + dy
        }

        // Enforce aspect ratio
        if (this._cropAspectRatio) {
          if (this._cropHandle.includes('e') || this._cropHandle.includes('w')) {
            this._cropRect.h = this._cropRect.w / this._cropAspectRatio
          } else {
            this._cropRect.w = this._cropRect.h * this._cropAspectRatio
          }
        }
      }

      this._updateCropOverlay()
      return
    }

    // Panning
    if (this._isPanning) {
      this._panX = this._panStartPanX + (e.clientX - this._panStartX)
      this._panY = this._panStartPanY + (e.clientY - this._panStartY)
      this._redrawDisplay()
    }
  }

  _handleCanvasMouseUp() {
    this._cropHandle = null
    this._cropStartRect = null
    if (this._isPanning) {
      this._isPanning = false
      if (this._displayCanvas) {
        this._displayCanvas.style.cursor = this._currentTool === 'crop' ? 'crosshair' : 'grab'
      }
    }
  }

  _handleContextInput(e) {
    const action = e.target.getAttribute('data-context-action')
    if (!action) return

    if (action === 'filter-slider') {
      const name = e.target.getAttribute('data-filter')
      const val = parseFloat(e.target.value)
      this._filters[name] = val
      const def = FILTER_DEFS.find((f) => f.name === name)
      const valueSpan = e.target.parentElement.querySelector('.filter-value')
      if (valueSpan && def) valueSpan.textContent = val + def.unit
      this._redrawDisplay()
    }

    if (action === 'resize-w') {
      this._resizeWidth = parseInt(e.target.value) || 1
      if (this._resizeLocked && this.imageWidth > 0) {
        this._resizeHeight = Math.round(this._resizeWidth * this.imageHeight / this.imageWidth)
        const hInput = this.shadowRoot.querySelector('[data-context-action="resize-h"]')
        if (hInput) hInput.value = this._resizeHeight
      }
    }

    if (action === 'resize-h') {
      this._resizeHeight = parseInt(e.target.value) || 1
      if (this._resizeLocked && this.imageHeight > 0) {
        this._resizeWidth = Math.round(this._resizeHeight * this.imageWidth / this.imageHeight)
        const wInput = this.shadowRoot.querySelector('[data-context-action="resize-w"]')
        if (wInput) wInput.value = this._resizeWidth
      }
    }

    if (action === 'resize-preset') {
      const val = e.target.value
      if (val && val !== 'nullxnull') {
        const [w, h] = val.split('x').map(Number)
        if (w && h) {
          this._resizeWidth = w
          this._resizeHeight = h
          const wInput = this.shadowRoot.querySelector('[data-context-action="resize-w"]')
          const hInput = this.shadowRoot.querySelector('[data-context-action="resize-h"]')
          if (wInput) wInput.value = w
          if (hInput) hInput.value = h
        }
      }
    }

    if (action === 'export-quality') {
      const val = parseFloat(e.target.value)
      const label = e.target.parentElement.querySelector('.quality-value')
      if (label) label.textContent = Math.round(val * 100) + '%'
      this._updateEstimatedSize()
    }

    if (action === 'export-format') {
      this._updateEstimatedSize()
    }
  }

  _handleContextClick(e) {
    const btn = e.target.closest('[data-context-action]')
    if (!btn) return
    const action = btn.getAttribute('data-context-action')

    switch (action) {
      case 'crop-aspect': {
        const val = btn.getAttribute('data-value')
        this._cropAspectRatio = val === 'null' ? null : parseFloat(val)
        if (this._cropAspectRatio && this._cropRect) {
          this._constrainCropToAspect()
          this._updateCropOverlay()
        }
        // Update active states
        const btns = this.shadowRoot.querySelectorAll('[data-context-action="crop-aspect"]')
        btns.forEach((b) => b.classList.remove('active'))
        btn.classList.add('active')
        break
      }
      case 'crop-apply':
        this._applyCrop()
        break
      case 'crop-cancel':
        this._hideCropOverlay()
        this._currentTool = null
        this._hideContextBar()
        this._updateToolbarState()
        break
      case 'resize-lock':
        this._resizeLocked = !this._resizeLocked
        btn.innerHTML = this._resizeLocked ? ICONS.lock : ICONS.unlock
        btn.classList.toggle('active', this._resizeLocked)
        break
      case 'resize-apply':
        this.resize(this._resizeWidth, this._resizeHeight)
        this._currentTool = null
        this._hideContextBar()
        this._updateToolbarState()
        break
      case 'resize-cancel':
        this._currentTool = null
        this._hideContextBar()
        this._updateToolbarState()
        break
      case 'filter-apply':
        this._commitFilters()
        this._currentTool = null
        this._hideContextBar()
        this._updateToolbarState()
        break
      case 'filter-reset':
        this.resetFilters()
        break
      case 'export-download': {
        const fmtSelect = this.shadowRoot.querySelector('[data-context-action="export-format"]')
        const qRange = this.shadowRoot.querySelector('[data-context-action="export-quality"]')
        const fmt = fmtSelect?.value || this.format
        const q = qRange ? parseFloat(qRange.value) : this.quality
        this.download(null, fmt, q)
        break
      }
      case 'export-format':
        // Format change — update quality label visibility
        break
    }
  }

  // -------------------------------------------------------------------------
  // UI updates
  // -------------------------------------------------------------------------
  _updateEditorSize() {
    const w = this.getAttribute('width')
    const h = this.getAttribute('height')
    const container = this.shadowRoot.querySelector('.editor-container')
    if (!container) return
    container.style.width = w ? w + 'px' : ''
    container.style.height = h ? h + 'px' : ''
  }

  _updateStatus() {
    const dims = this.shadowRoot.querySelector('.image-dimensions')
    if (dims && this._hasImage) {
      const parts = []
      if (this._sourceFormat) parts.push(getFormatLabel(this._sourceFormat))
      parts.push(`${this.imageWidth} × ${this.imageHeight} px`)
      if (this._sourceFileSize > 0) parts.push(formatFileSize(this._sourceFileSize))
      dims.textContent = parts.join(' • ')
    } else if (dims) {
      dims.textContent = ''
    }
  }

  _updateToolbarState() {
    const root = this.shadowRoot
    if (!root) return

    // Undo/redo
    const undoBtn = root.querySelector('[data-action="undo"]')
    const redoBtn = root.querySelector('[data-action="redo"]')
    if (undoBtn) undoBtn.disabled = !this.canUndo
    if (redoBtn) redoBtn.disabled = !this.canRedo

    // Tool editing buttons disabled when no image
    const editBtns = root.querySelectorAll('[data-action="crop"], [data-action="rotate-left"], [data-action="rotate-right"], [data-action="flip-h"], [data-action="flip-v"], [data-action="resize"], [data-action="filters"], [data-action="metadata"], [data-action="export"]')
    editBtns.forEach((btn) => {
      btn.disabled = !this._hasImage
    })

    // Active tool highlight
    const allBtns = root.querySelectorAll('.toolbar [data-action]')
    allBtns.forEach((btn) => {
      const action = btn.getAttribute('data-action')
      btn.classList.toggle('active', action === this._currentTool)
    })
  }

  // -------------------------------------------------------------------------
  // CSS generation
  // -------------------------------------------------------------------------
  _getStyles() {
    const isDark = this._isDark

    return `
      :host {
        --_ie-bg: var(--color-surface, ${isDark ? '#1c1c1e' : '#ffffff'});
        --_ie-border-color: var(--color-border, ${isDark ? '#3a3a3c' : '#d1d5da'});
        --_ie-border-radius: var(--radius-m, 8px);
        --_ie-text-color: var(--color-text, ${isDark ? '#e5e5e7' : '#24292e'});
        --_ie-text-muted: var(--color-text-muted, ${isDark ? '#8e8e93' : '#586069'});
        --_ie-font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
        --_ie-toolbar-bg: var(--color-surface-raised, ${isDark ? '#2c2c2e' : '#f6f8fa'});
        --_ie-toolbar-border: var(--color-border, ${isDark ? '#3a3a3c' : '#d1d5da'});
        --_ie-button-bg: transparent;
        --_ie-button-color: var(--color-text-muted, ${isDark ? '#8e8e93' : '#586069'});
        --_ie-button-hover-bg: var(--color-hover-bg, ${isDark ? '#3a3a3c' : '#f3f4f6'});
        --_ie-button-active-bg: var(--color-active-bg, ${isDark ? '#48484a' : '#e5e7eb'});
        --_ie-button-active-color: var(--color-primary, ${isDark ? '#64b5f6' : '#2563eb'});
        --_ie-button-radius: var(--radius-s, 4px);
        --_ie-accent-color: var(--color-primary, ${isDark ? '#64b5f6' : '#2563eb'});
        --_ie-focus-color: var(--color-focus-ring, ${isDark ? '#64b5f6' : '#2563eb'});
        --_ie-workspace-bg: ${isDark ? '#1a1a1a' : '#e5e5e5'};
        --_ie-workspace-check: ${isDark ? '#2a2a2a' : '#cccccc'};
        --_ie-context-bg: var(--color-surface-raised, ${isDark ? '#2c2c2e' : '#f6f8fa'});
        --_ie-context-border: var(--color-border, ${isDark ? '#3a3a3c' : '#d1d5da'});
        --_ie-crop-border: var(--color-primary, ${isDark ? '#64b5f6' : '#2563eb'});
        --_ie-crop-handle: var(--color-primary, ${isDark ? '#64b5f6' : '#2563eb'});
        --_ie-crop-overlay: ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)'};
        --_ie-crop-grid: rgba(255,255,255,0.3);
        --_ie-status-bg: var(--color-surface-raised, ${isDark ? '#2c2c2e' : '#f6f8fa'});
        --_ie-status-color: var(--color-text-muted, ${isDark ? '#8e8e93' : '#586069'});
        --_ie-slider-track: var(--color-border, ${isDark ? '#48484a' : '#d1d5da'});
        --_ie-slider-thumb: var(--color-primary, ${isDark ? '#64b5f6' : '#2563eb'});

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
    `
  }

  // -------------------------------------------------------------------------
  // HTML templates
  // -------------------------------------------------------------------------
  _getToolbarHTML() {
    if (this.noToolbar) return ''
    const isRO = this.readonly
    return `
      <div class="toolbar" role="toolbar" aria-label="Image editing tools">
        <div class="toolbar-group toolbar-file">
          <button data-action="open" aria-label="Open image" title="Open image" ${isRO ? 'disabled' : ''}>${ICONS.open}</button>
          <input type="file" class="file-input" accept="image/*" tabindex="-1">
        </div>
        <div class="toolbar-group toolbar-tools">
          <button data-action="crop" aria-label="Crop" title="Crop" disabled>${ICONS.crop}</button>
          <button data-action="rotate-left" aria-label="Rotate left 90°" title="Rotate left" disabled>${ICONS.rotateLeft}</button>
          <button data-action="rotate-right" aria-label="Rotate right 90°" title="Rotate right" disabled>${ICONS.rotateRight}</button>
          <button data-action="flip-h" aria-label="Flip horizontal" title="Flip horizontal" disabled>${ICONS.flipH}</button>
          <button data-action="flip-v" aria-label="Flip vertical" title="Flip vertical" disabled>${ICONS.flipV}</button>
          <button data-action="resize" aria-label="Resize" title="Resize" disabled>${ICONS.resize}</button>
          <button data-action="filters" aria-label="Filters" title="Filters" disabled>${ICONS.filters}</button>
          <button data-action="metadata" aria-label="Image info" title="Image info" disabled>${ICONS.info}</button>
        </div>
        <div class="toolbar-group toolbar-history">
          <button data-action="undo" aria-label="Undo" title="Undo (Ctrl+Z)" disabled>${ICONS.undo}</button>
          <button data-action="redo" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled>${ICONS.redo}</button>
        </div>
        <div class="toolbar-group toolbar-zoom">
          <button data-action="zoom-out" aria-label="Zoom out" title="Zoom out">${ICONS.zoomOut}</button>
          <span class="zoom-label">100%</span>
          <button data-action="zoom-in" aria-label="Zoom in" title="Zoom in">${ICONS.zoomIn}</button>
          <button data-action="zoom-fit" aria-label="Fit to view" title="Fit to view">${ICONS.zoomFit}</button>
        </div>
        <div class="toolbar-group toolbar-export">
          <button data-action="export" aria-label="Export" title="Export" disabled>${ICONS.download}</button>
        </div>
      </div>`
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
      </div>`
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
      </div>`

    this._updateEditorSize()
  }
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
customElements.define('image-editor', ImageEditor)

export { ImageEditor }
