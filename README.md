# &lt;image-editor&gt;

A basic image editor web component for cropping, rotating, filtering, resizing, and exporting images. Built with vanilla JavaScript, zero dependencies, and designed for content editing workflows.

[Demos](https://profpowell.github.io/image-editor/) · [API Reference](https://profpowell.github.io/image-editor/api.html)

## Features

| Feature | Description |
|---------|-------------|
| **Crop** | Draggable handles with rule-of-thirds grid and aspect ratio presets |
| **Rotate** | 90° left/right rotation |
| **Flip** | Horizontal and vertical flip |
| **Resize** | Aspect ratio lock with common size presets |
| **Filters** | Brightness, contrast, saturation, blur, grayscale, sepia |
| **Undo/Redo** | Configurable history depth |
| **Export** | PNG, JPEG, or WebP with quality control |
| **Zoom/Pan** | Scroll wheel zoom, click-and-drag pan |
| **Themes** | Light/dark mode with auto-detection |
| **Drag & Drop** | Drop images directly onto the editor |
| **Accessible** | Full keyboard navigation, ARIA labels |
| **Themeable** | 35+ CSS custom properties |

## Installation

```bash
npm install @profpowell/image-editor
```

Or include directly via CDN:

```html
<script type="module" src="https://unpkg.com/@profpowell/image-editor"></script>
```

## Usage

### Basic

```html
<script type="module">
  import '@profpowell/image-editor'
</script>

<image-editor></image-editor>
```

### With a pre-loaded image

```html
<image-editor src="photo.jpg"></image-editor>
```

### Dark mode with JPEG export

```html
<image-editor mode="dark" format="jpeg" quality="0.85"></image-editor>
```

### Constrained size

```html
<image-editor width="600" height="400"></image-editor>
```

### Custom drop zone message

```html
<image-editor>
  <p>Drag your photo here to start editing</p>
</image-editor>
```

### Programmatic usage

```js
const editor = document.querySelector('image-editor')

// Load from file input
fileInput.addEventListener('change', (e) => {
  editor.loadImage(e.target.files[0])
})

// Listen for edits
editor.addEventListener('image-edit', (e) => {
  console.log('Edit:', e.detail.action)
})

// Export
const blob = await editor.getBlob('webp', 0.9)
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `src` | string | — | URL of image to load |
| `mode` | `'light'` \| `'dark'` | auto | Theme mode |
| `width` | number | — | Editor width in px |
| `height` | number | — | Editor height in px |
| `format` | `'png'` \| `'jpeg'` \| `'webp'` | `'png'` | Default export format |
| `quality` | number (0–1) | `0.92` | JPEG/WebP export quality |
| `max-history` | number | `50` | Maximum undo steps |
| `readonly` | boolean | `false` | Disable editing |
| `no-toolbar` | boolean | `false` | Hide toolbar |
| `aspect-ratio` | string | — | Lock crop ratio (e.g. `'16:9'`) |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `loadImage(src)` | `Promise<void>` | Load from URL, File, or Blob |
| `crop(x, y, w, h)` | void | Crop to pixel region |
| `rotate(degrees)` | void | Rotate by 90° increments |
| `flipHorizontal()` | void | Flip horizontally |
| `flipVertical()` | void | Flip vertically |
| `resize(w, h)` | void | Resize to dimensions |
| `applyFilter(name, value)` | void | Apply filter |
| `resetFilters()` | void | Reset all filters |
| `undo()` / `redo()` | void | History navigation |
| `reset()` | void | Reset to original image |
| `zoomTo(level)` | void | Set zoom (1 = 100%) |
| `zoomToFit()` | void | Fit image to view |
| `getBlob(format?, quality?)` | `Promise<Blob>` | Get as Blob |
| `getDataURL(format?, quality?)` | string | Get as data URL |
| `download(filename?, format?, quality?)` | void | Browser download |

## Events

| Event | Detail | When |
|-------|--------|------|
| `image-load` | `{ width, height, src }` | Image loaded |
| `image-load-error` | `{ src, error }` | Load failed |
| `image-edit` | `{ action, params }` | Edit applied |
| `image-export` | `{ format, quality, size }` | Exported |
| `tool-change` | `{ tool, previous }` | Tool changed |
| `zoom-change` | `{ level }` | Zoom changed |
| `history-change` | `{ canUndo, canRedo, length }` | History changed |

## CSS Custom Properties

All styling is controlled via CSS custom properties prefixed with `--image-editor-*`:

```css
image-editor {
  --image-editor-accent-color: #8b5cf6;
  --image-editor-toolbar-bg: #faf5ff;
  --image-editor-border-color: #c4b5fd;
}
```

See the full list in the [API reference](https://profpowell.github.io/image-editor/api.html).

## Vanilla Breeze

This component is [Vanilla Breeze](https://github.com/ProfPowell/vanilla-breeze) compatible — all tokens map automatically when used on a VB-themed page.

## Filter Names

| Name | Range | Default | Description |
|------|-------|---------|-------------|
| `brightness` | 0.5–2 | 1 | Brightness |
| `contrast` | 0.5–2 | 1 | Contrast |
| `saturate` | 0–3 | 1 | Saturation |
| `blur` | 0–10px | 0 | Gaussian blur |
| `grayscale` | 0–100% | 0 | Grayscale |
| `sepia` | 0–100% | 0 | Sepia tone |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Escape` | Cancel current tool |
| `Enter` | Apply crop |
| `Arrow keys` | Nudge crop selection |
| `Shift + Arrow` | Nudge crop by 10px |

## Browser Support

Requires browsers with support for:
- Custom Elements v1
- Shadow DOM v1
- Canvas 2D API
- CSS Custom Properties

## Development

```bash
npm install
npm run dev        # Start dev server
npm test           # Run Playwright tests
npm run test:ui    # Interactive test UI
npm run build      # Production build
npm run lint       # Lint
npm run format     # Format
```

## License

MIT
