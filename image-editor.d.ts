export declare class ImageEditor extends HTMLElement {
  constructor()
  connectedCallback(): void
  disconnectedCallback(): void

  static readonly observedAttributes: readonly [
    'src', 'mode', 'width', 'height', 'format', 'quality',
    'max-history', 'readonly', 'no-toolbar', 'aspect-ratio'
  ]

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void

  /** URL of image to load */
  src: string | null
  /** Theme mode: 'light' | 'dark' | null (auto) */
  mode: 'light' | 'dark' | null
  /** Default export format */
  format: 'png' | 'jpeg' | 'webp'
  /** Export quality 0–1 for JPEG/WebP */
  quality: number
  /** Maximum undo steps */
  maxHistory: number
  /** Disable all editing */
  readonly: boolean
  /** Hide toolbar */
  noToolbar: boolean
  /** Crop aspect ratio lock (e.g. 16/9) or null */
  aspectRatio: number | null

  /** Current image pixel width (read-only) */
  readonly imageWidth: number
  /** Current image pixel height (read-only) */
  readonly imageHeight: number
  /** Whether an image is loaded (read-only) */
  readonly hasImage: boolean
  /** Whether edits have been made (read-only) */
  readonly isDirty: boolean
  /** Whether undo is available (read-only) */
  readonly canUndo: boolean
  /** Whether redo is available (read-only) */
  readonly canRedo: boolean
  /** Current zoom level where 1 = 100% (read-only) */
  readonly zoomLevel: number
  /** Active tool name or null (read-only) */
  readonly currentTool: string | null
  /** Number of history entries (read-only) */
  readonly historyLength: number

  /** Load image from URL, File, or Blob */
  loadImage(source: string | File | Blob): Promise<void>
  /** Crop to specified pixel region */
  crop(x: number, y: number, w: number, h: number): void
  /** Rotate by 90° increments */
  rotate(degrees: number): void
  /** Flip horizontally */
  flipHorizontal(): void
  /** Flip vertically */
  flipVertical(): void
  /** Resize to specified dimensions */
  resize(w: number, h: number): void
  /** Apply a filter (e.g. 'brightness', 1.2) */
  applyFilter(name: string, value: number): void
  /** Reset all filters to defaults */
  resetFilters(): void
  /** Undo last operation */
  undo(): void
  /** Redo last undone operation */
  redo(): void
  /** Reset to original loaded image */
  reset(): void
  /** Set zoom level (1 = 100%) */
  zoomTo(level: number): void
  /** Fit image to workspace */
  zoomToFit(): void
  /** Get image as Blob */
  getBlob(format?: string, quality?: number): Promise<Blob | null>
  /** Get image as data URL */
  getDataURL(format?: string, quality?: number): string
  /** Trigger browser download */
  download(filename?: string, format?: string, quality?: number): Promise<void>
  /** Re-render the component */
  render(): void
}

declare global {
  interface HTMLElementTagNameMap {
    'image-editor': ImageEditor
  }
}
