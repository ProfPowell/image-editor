import { test, expect } from '@playwright/test'

async function waitForComponent(page, selector, timeout = 3000) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel)
      return el && el.shadowRoot && el.shadowRoot.querySelector('.convert-container')
    },
    selector,
    { timeout }
  )
}

test.describe('image-convert', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/test-page.html')
    await waitForComponent(page, '#convert-default')
  })

  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------
  test.describe('rendering', () => {
    test('should create shadow DOM', async ({ page }) => {
      const hasShadow = await page.evaluate(() => {
        return !!document.querySelector('#convert-default').shadowRoot
      })
      expect(hasShadow).toBe(true)
    })

    test('should render drop zone', async ({ page }) => {
      const hasDropZone = await page.evaluate(() => {
        const el = document.querySelector('#convert-default')
        return !!el.shadowRoot.querySelector('.drop-zone')
      })
      expect(hasDropZone).toBe(true)
    })

    test('should hide controls when no image', async ({ page }) => {
      const controlsHidden = await page.evaluate(() => {
        const el = document.querySelector('#convert-default')
        return el.shadowRoot.querySelector('.convert-controls')?.hidden
      })
      expect(controlsHidden).toBe(true)
    })

    test('should hide source info when no image', async ({ page }) => {
      const infoHidden = await page.evaluate(() => {
        const el = document.querySelector('#convert-default')
        return el.shadowRoot.querySelector('.source-info')?.hidden
      })
      expect(infoHidden).toBe(true)
    })
  })

  // -----------------------------------------------------------------------
  // Attributes
  // -----------------------------------------------------------------------
  test.describe('attributes', () => {
    test('should default format to webp', async ({ page }) => {
      const format = await page.evaluate(() => {
        return document.querySelector('#convert-default').format
      })
      expect(format).toBe('webp')
    })

    test('should default quality to 0.85', async ({ page }) => {
      const quality = await page.evaluate(() => {
        return document.querySelector('#convert-default').quality
      })
      expect(quality).toBe(0.85)
    })

    test('should default stripMetadata to true', async ({ page }) => {
      const strip = await page.evaluate(() => {
        return document.querySelector('#convert-default').stripMetadata
      })
      expect(strip).toBe(true)
    })

    test('should reflect format attribute', async ({ page }) => {
      const format = await page.evaluate(() => {
        return document.querySelector('#convert-jpeg').format
      })
      expect(format).toBe('jpeg')
    })
  })

  // -----------------------------------------------------------------------
  // Image loading
  // -----------------------------------------------------------------------
  test.describe('image loading', () => {
    test('should load image from File', async ({ page }) => {
      const result = await page.evaluate(async () => {
        const el = document.querySelector('#convert-default')
        // Create a test image blob
        const canvas = document.createElement('canvas')
        canvas.width = 100
        canvas.height = 80
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'red'
        ctx.fillRect(0, 0, 100, 80)
        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
        const file = new File([blob], 'test.png', { type: 'image/png' })
        await el.loadFile(file)
        return {
          hasImage: el._hasImage,
          width: el._sourceWidth,
          height: el._sourceHeight
        }
      })
      expect(result.hasImage).toBe(true)
      expect(result.width).toBe(100)
      expect(result.height).toBe(80)
    })

    test('should show controls after load', async ({ page }) => {
      const controlsVisible = await page.evaluate(async () => {
        const el = document.querySelector('#convert-default')
        const canvas = document.createElement('canvas')
        canvas.width = 50
        canvas.height = 50
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'blue'
        ctx.fillRect(0, 0, 50, 50)
        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
        const file = new File([blob], 'test.png', { type: 'image/png' })
        await el.loadFile(file)
        return !el.shadowRoot.querySelector('.convert-controls')?.hidden
      })
      expect(controlsVisible).toBe(true)
    })

    test('should show source info after load', async ({ page }) => {
      const infoVisible = await page.evaluate(async () => {
        const el = document.querySelector('#convert-default')
        const canvas = document.createElement('canvas')
        canvas.width = 50
        canvas.height = 50
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'blue'
        ctx.fillRect(0, 0, 50, 50)
        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
        const file = new File([blob], 'test.png', { type: 'image/png' })
        await el.loadFile(file)
        const info = el.shadowRoot.querySelector('.source-info')
        return { hidden: info?.hidden, text: info?.textContent }
      })
      expect(infoVisible.hidden).toBe(false)
      expect(infoVisible.text).toContain('PNG')
      expect(infoVisible.text).toContain('50 × 50')
    })
  })

  // -----------------------------------------------------------------------
  // Format buttons
  // -----------------------------------------------------------------------
  test.describe('format selection', () => {
    test('should render format buttons', async ({ page }) => {
      const count = await page.evaluate(() => {
        const el = document.querySelector('#convert-default')
        return el.shadowRoot.querySelectorAll('.format-btn').length
      })
      expect(count).toBeGreaterThanOrEqual(3) // PNG, JPEG, WebP (+ AVIF if supported)
    })

    test('should have webp active by default', async ({ page }) => {
      const active = await page.evaluate(() => {
        const el = document.querySelector('#convert-default')
        const btn = el.shadowRoot.querySelector('.format-btn.active')
        return btn?.getAttribute('data-format')
      })
      expect(active).toBe('webp')
    })
  })

  // -----------------------------------------------------------------------
  // Estimated size
  // -----------------------------------------------------------------------
  test.describe('estimated size', () => {
    test('should show estimated size after load', async ({ page }) => {
      const size = await page.evaluate(async () => {
        const el = document.querySelector('#convert-default')
        const canvas = document.createElement('canvas')
        canvas.width = 100
        canvas.height = 100
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'green'
        ctx.fillRect(0, 0, 100, 100)
        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
        const file = new File([blob], 'test.png', { type: 'image/png' })
        await el.loadFile(file)
        // Wait for estimate debounce
        await new Promise(r => setTimeout(r, 400))
        return el.shadowRoot.querySelector('.output-info')?.textContent
      })
      expect(size).toBeTruthy()
      expect(size.length).toBeGreaterThan(0)
    })
  })

  // -----------------------------------------------------------------------
  // Dark mode
  // -----------------------------------------------------------------------
  test.describe('dark mode', () => {
    test('should apply dark mode with mode="dark"', async ({ page }) => {
      await waitForComponent(page, '#convert-dark')
      const bg = await page.evaluate(() => {
        const el = document.querySelector('#convert-dark')
        const container = el.shadowRoot.querySelector('.convert-container')
        return getComputedStyle(container).backgroundColor
      })
      expect(bg).not.toBe('rgb(255, 255, 255)')
    })
  })

  // -----------------------------------------------------------------------
  // Slot
  // -----------------------------------------------------------------------
  test.describe('slot content', () => {
    test('should render custom slot content', async ({ page }) => {
      await waitForComponent(page, '#convert-slot')
      const hasSlot = await page.evaluate(() => {
        const el = document.querySelector('#convert-slot')
        const slot = el.shadowRoot.querySelector('slot')
        return slot?.assignedNodes()?.length > 0
      })
      expect(hasSlot).toBe(true)
    })
  })
})
