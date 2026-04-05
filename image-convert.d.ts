export declare class ImageConvert extends HTMLElement {
  constructor()
  connectedCallback(): void
  disconnectedCallback(): void

  static readonly observedAttributes: readonly [
    'mode', 'format', 'quality', 'strip-metadata', 'accept'
  ]

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void

  /** Theme mode: 'light' | 'dark' | null (auto) */
  mode: 'light' | 'dark' | null
  /** Default output format */
  format: 'png' | 'jpeg' | 'webp' | 'avif'
  /** Export quality 0–1 for lossy formats */
  quality: number
  /** Strip EXIF metadata */
  stripMetadata: boolean
  /** Accepted file types */
  accept: string
}

declare global {
  interface HTMLElementTagNameMap {
    'image-convert': ImageConvert
  }
}
