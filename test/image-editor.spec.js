import { test, expect } from '@playwright/test'

/** Wait for the component to be defined and rendered */
async function waitForComponent(page, selector, timeout = 3000) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel)
      return el && el.shadowRoot && el.shadowRoot.querySelector('.editor-container')
    },
    selector,
    { timeout }
  )
}

/** Load a test image into a component via evaluate */
async function loadTestImage(page, selector) {
  await page.evaluate(async (sel) => {
    const el = document.querySelector(sel)
    await el.loadImage(window.__testImageDataURL)
  }, selector)
  // Brief wait for rendering
  await page.waitForTimeout(200)
}

test.describe('image-editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/test-page.html')
    await waitForComponent(page, '#test-default')
  })

  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------
  test.describe('rendering', () => {
    test('should create shadow DOM', async ({ page }) => {
      const hasShadow = await page.evaluate(() => {
        return !!document.querySelector('#test-default').shadowRoot
      })
      expect(hasShadow).toBe(true)
    })

    test('should render toolbar', async ({ page }) => {
      const hasToolbar = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        return !!el.shadowRoot.querySelector('.toolbar')
      })
      expect(hasToolbar).toBe(true)
    })

    test('should render workspace', async ({ page }) => {
      const hasWorkspace = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        return !!el.shadowRoot.querySelector('.workspace')
      })
      expect(hasWorkspace).toBe(true)
    })

    test('should render status bar', async ({ page }) => {
      const hasStatus = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        return !!el.shadowRoot.querySelector('.status-bar')
      })
      expect(hasStatus).toBe(true)
    })

    test('should show drop zone when no image', async ({ page }) => {
      const dropZoneVisible = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        const dz = el.shadowRoot.querySelector('.drop-zone')
        return dz && !dz.hidden
      })
      expect(dropZoneVisible).toBe(true)
    })

    test('should hide canvas when no image', async ({ page }) => {
      const canvasHidden = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        const canvas = el.shadowRoot.querySelector('.canvas')
        return canvas && canvas.hidden
      })
      expect(canvasHidden).toBe(true)
    })
  })

  // -----------------------------------------------------------------------
  // Attributes
  // -----------------------------------------------------------------------
  test.describe('attributes', () => {
    test('should reflect mode attribute', async ({ page }) => {
      const mode = await page.evaluate(() => {
        return document.querySelector('#test-dark').mode
      })
      expect(mode).toBe('dark')
    })

    test('should reflect format attribute', async ({ page }) => {
      const format = await page.evaluate(() => {
        return document.querySelector('#test-format').format
      })
      expect(format).toBe('jpeg')
    })

    test('should reflect quality attribute', async ({ page }) => {
      const quality = await page.evaluate(() => {
        return document.querySelector('#test-format').quality
      })
      expect(quality).toBe(0.8)
    })

    test('should reflect readonly attribute', async ({ page }) => {
      const isReadonly = await page.evaluate(() => {
        return document.querySelector('#test-readonly').readonly
      })
      expect(isReadonly).toBe(true)
    })

    test('should reflect no-toolbar attribute', async ({ page }) => {
      const noToolbar = await page.evaluate(() => {
        return document.querySelector('#test-no-toolbar').noToolbar
      })
      expect(noToolbar).toBe(true)
    })

    test('should reflect aspect-ratio attribute', async ({ page }) => {
      const ratio = await page.evaluate(() => {
        return document.querySelector('#test-aspect').aspectRatio
      })
      expect(ratio).toBeCloseTo(16 / 9, 2)
    })

    test('should default format to png', async ({ page }) => {
      const format = await page.evaluate(() => {
        return document.querySelector('#test-default').format
      })
      expect(format).toBe('png')
    })

    test('should default quality to 0.92', async ({ page }) => {
      const quality = await page.evaluate(() => {
        return document.querySelector('#test-default').quality
      })
      expect(quality).toBe(0.92)
    })

    test('should default maxHistory to 50', async ({ page }) => {
      const maxHistory = await page.evaluate(() => {
        return document.querySelector('#test-default').maxHistory
      })
      expect(maxHistory).toBe(50)
    })
  })

  // -----------------------------------------------------------------------
  // No toolbar
  // -----------------------------------------------------------------------
  test.describe('no-toolbar', () => {
    test('should hide toolbar when no-toolbar set', async ({ page }) => {
      await waitForComponent(page, '#test-no-toolbar')
      const hasToolbar = await page.evaluate(() => {
        const el = document.querySelector('#test-no-toolbar')
        return !!el.shadowRoot.querySelector('.toolbar')
      })
      expect(hasToolbar).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // Image loading
  // -----------------------------------------------------------------------
  test.describe('image loading', () => {
    test('should load image from data URL', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const hasImage = await page.evaluate(() => {
        return document.querySelector('#test-default').hasImage
      })
      expect(hasImage).toBe(true)
    })

    test('should set correct dimensions after load', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(200)
      expect(dims.h).toBe(150)
    })

    test('should show canvas after load', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const canvasVisible = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        const canvas = el.shadowRoot.querySelector('.canvas')
        return canvas && !canvas.hidden
      })
      expect(canvasVisible).toBe(true)
    })

    test('should hide drop zone after load', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dropZoneHidden = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        const dz = el.shadowRoot.querySelector('.drop-zone')
        return dz && dz.hidden
      })
      expect(dropZoneHidden).toBe(true)
    })

    test('should fire image-load event', async ({ page }) => {
      const eventFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          const el = document.querySelector('#test-default')
          el.addEventListener('image-load', (e) => {
            resolve({ width: e.detail.width, height: e.detail.height })
          })
          el.loadImage(window.__testImageDataURL)
        })
      })
      expect(eventFired.width).toBe(200)
      expect(eventFired.height).toBe(150)
    })

    test('should fire image-load-error for bad URLs', async ({ page }) => {
      const errorFired = await page.evaluate(() => {
        return new Promise((resolve) => {
          const el = document.querySelector('#test-default')
          el.addEventListener('image-load-error', (e) => {
            resolve(true)
          })
          el.loadImage('/nonexistent.png')
        })
      })
      expect(errorFired).toBe(true)
    })

    test('should initialize history after load', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const histLen = await page.evaluate(() => {
        return document.querySelector('#test-default').historyLength
      })
      expect(histLen).toBe(1)
    })
  })

  // -----------------------------------------------------------------------
  // Rotate / Flip
  // -----------------------------------------------------------------------
  test.describe('rotate and flip', () => {
    test('should rotate 90° right and swap dimensions', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.rotate(90)
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(150)
      expect(dims.h).toBe(200)
    })

    test('should rotate 90° left and swap dimensions', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.rotate(-90)
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(150)
      expect(dims.h).toBe(200)
    })

    test('should rotate 180° and keep dimensions', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.rotate(180)
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(200)
      expect(dims.h).toBe(150)
    })

    test('should flip horizontal without changing dimensions', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.flipHorizontal()
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(200)
      expect(dims.h).toBe(150)
    })

    test('should flip vertical without changing dimensions', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.flipVertical()
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(200)
      expect(dims.h).toBe(150)
    })

    test('should fire image-edit event on rotate', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const event = await page.evaluate(() => {
        return new Promise((resolve) => {
          const el = document.querySelector('#test-default')
          el.addEventListener('image-edit', (e) => resolve(e.detail), { once: true })
          el.rotate(90)
        })
      })
      expect(event.action).toBe('rotate')
    })

    test('should add to history on rotate', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const histLen = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.rotate(90)
        return el.historyLength
      })
      expect(histLen).toBe(2)
    })
  })

  // -----------------------------------------------------------------------
  // Crop
  // -----------------------------------------------------------------------
  test.describe('crop', () => {
    test('should crop to specified region', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.crop(10, 10, 100, 80)
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(100)
      expect(dims.h).toBe(80)
    })

    test('should clamp crop to image bounds', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.crop(0, 0, 999, 999)
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(200)
      expect(dims.h).toBe(150)
    })

    test('should fire image-edit event on crop', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const event = await page.evaluate(() => {
        return new Promise((resolve) => {
          const el = document.querySelector('#test-default')
          el.addEventListener('image-edit', (e) => resolve(e.detail), { once: true })
          el.crop(10, 10, 50, 50)
        })
      })
      expect(event.action).toBe('crop')
      expect(event.params.width).toBe(50)
    })
  })

  // -----------------------------------------------------------------------
  // Resize
  // -----------------------------------------------------------------------
  test.describe('resize', () => {
    test('should resize to specified dimensions', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.resize(100, 75)
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(100)
      expect(dims.h).toBe(75)
    })

    test('should fire image-edit event on resize', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const event = await page.evaluate(() => {
        return new Promise((resolve) => {
          const el = document.querySelector('#test-default')
          el.addEventListener('image-edit', (e) => resolve(e.detail), { once: true })
          el.resize(100, 100)
        })
      })
      expect(event.action).toBe('resize')
    })
  })

  // -----------------------------------------------------------------------
  // Filters
  // -----------------------------------------------------------------------
  test.describe('filters', () => {
    test('should apply filter without changing dimensions', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.applyFilter('brightness', 1.5)
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(200)
      expect(dims.h).toBe(150)
    })

    test('should detect active filters', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const result = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        const before = el._hasActiveFilters()
        el.applyFilter('brightness', 1.5)
        const after = el._hasActiveFilters()
        return { before, after }
      })
      expect(result.before).toBe(false)
      expect(result.after).toBe(true)
    })

    test('should reset filters', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const active = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.applyFilter('brightness', 1.5)
        el.resetFilters()
        return el._hasActiveFilters()
      })
      expect(active).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // Undo / Redo
  // -----------------------------------------------------------------------
  test.describe('undo and redo', () => {
    test('should undo rotation', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.rotate(90)
        el.undo()
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(200)
      expect(dims.h).toBe(150)
    })

    test('should redo undone rotation', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.rotate(90)
        el.undo()
        el.redo()
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(150)
      expect(dims.h).toBe(200)
    })

    test('canUndo should be false initially', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const canUndo = await page.evaluate(() => {
        return document.querySelector('#test-default').canUndo
      })
      expect(canUndo).toBe(false)
    })

    test('canUndo should be true after edit', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const canUndo = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.rotate(90)
        return el.canUndo
      })
      expect(canUndo).toBe(true)
    })

    test('canRedo should be true after undo', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const canRedo = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.rotate(90)
        el.undo()
        return el.canRedo
      })
      expect(canRedo).toBe(true)
    })

    test('should fire history-change event', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const event = await page.evaluate(() => {
        return new Promise((resolve) => {
          const el = document.querySelector('#test-default')
          el.addEventListener('history-change', (e) => resolve(e.detail), { once: true })
          el.rotate(90)
        })
      })
      expect(event.canUndo).toBe(true)
      expect(event.length).toBe(2)
    })

    test('should reset to original', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.rotate(90)
        el.crop(0, 0, 50, 50)
        el.reset()
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(200)
      expect(dims.h).toBe(150)
    })
  })

  // -----------------------------------------------------------------------
  // Zoom
  // -----------------------------------------------------------------------
  test.describe('zoom', () => {
    test('should set zoom level', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const zoom = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.zoomTo(2)
        return el.zoomLevel
      })
      expect(zoom).toBe(2)
    })

    test('should clamp zoom to min/max', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const zooms = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.zoomTo(0.01)
        const min = el.zoomLevel
        el.zoomTo(100)
        const max = el.zoomLevel
        return { min, max }
      })
      expect(zooms.min).toBe(0.1)
      expect(zooms.max).toBe(5)
    })

    test('should fire zoom-change event', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const event = await page.evaluate(() => {
        return new Promise((resolve) => {
          const el = document.querySelector('#test-default')
          el.addEventListener('zoom-change', (e) => resolve(e.detail), { once: true })
          el.zoomTo(1.5)
        })
      })
      expect(event.level).toBe(1.5)
    })
  })

  // -----------------------------------------------------------------------
  // Export
  // -----------------------------------------------------------------------
  test.describe('export', () => {
    test('should return data URL as PNG by default', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dataURL = await page.evaluate(() => {
        return document.querySelector('#test-default').getDataURL()
      })
      expect(dataURL).toMatch(/^data:image\/png/)
    })

    test('should return data URL as JPEG', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dataURL = await page.evaluate(() => {
        return document.querySelector('#test-default').getDataURL('jpeg')
      })
      expect(dataURL).toMatch(/^data:image\/jpeg/)
    })

    test('should return data URL as WebP', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dataURL = await page.evaluate(() => {
        return document.querySelector('#test-default').getDataURL('webp')
      })
      expect(dataURL).toMatch(/^data:image\/webp/)
    })

    test('should return blob', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const blobType = await page.evaluate(async () => {
        const blob = await document.querySelector('#test-default').getBlob('png')
        return blob?.type
      })
      expect(blobType).toBe('image/png')
    })

    test('should return empty string when no image', async ({ page }) => {
      const dataURL = await page.evaluate(() => {
        return document.querySelector('#test-default').getDataURL()
      })
      expect(dataURL).toBe('')
    })
  })

  // -----------------------------------------------------------------------
  // Light/Dark mode
  // -----------------------------------------------------------------------
  test.describe('light/dark mode', () => {
    test('should apply dark mode styles with mode="dark"', async ({ page }) => {
      await waitForComponent(page, '#test-dark')
      const bgColor = await page.evaluate(() => {
        const el = document.querySelector('#test-dark')
        const container = el.shadowRoot.querySelector('.editor-container')
        return getComputedStyle(container).backgroundColor
      })
      // Dark mode background should be dark
      expect(bgColor).not.toBe('rgb(255, 255, 255)')
    })

    test('should apply light mode styles with mode="light"', async ({ page }) => {
      await waitForComponent(page, '#test-light')
      const bgColor = await page.evaluate(() => {
        const el = document.querySelector('#test-light')
        const container = el.shadowRoot.querySelector('.editor-container')
        return getComputedStyle(container).backgroundColor
      })
      // Light mode background should be light
      expect(bgColor).toBe('rgb(255, 255, 255)')
    })
  })

  // -----------------------------------------------------------------------
  // Readonly
  // -----------------------------------------------------------------------
  test.describe('readonly', () => {
    test('should not rotate when readonly', async ({ page }) => {
      await loadTestImage(page, '#test-readonly')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-readonly')
        el.rotate(90)
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(200)
      expect(dims.h).toBe(150)
    })

    test('should not crop when readonly', async ({ page }) => {
      await loadTestImage(page, '#test-readonly')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-readonly')
        el.crop(0, 0, 50, 50)
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(200)
      expect(dims.h).toBe(150)
    })

    test('should not resize when readonly', async ({ page }) => {
      await loadTestImage(page, '#test-readonly')
      const dims = await page.evaluate(() => {
        const el = document.querySelector('#test-readonly')
        el.resize(50, 50)
        return { w: el.imageWidth, h: el.imageHeight }
      })
      expect(dims.w).toBe(200)
      expect(dims.h).toBe(150)
    })

    test('should disable edit buttons in toolbar', async ({ page }) => {
      await waitForComponent(page, '#test-readonly')
      const disabled = await page.evaluate(() => {
        const el = document.querySelector('#test-readonly')
        const openBtn = el.shadowRoot.querySelector('[data-action="open"]')
        return openBtn?.disabled
      })
      expect(disabled).toBe(true)
    })
  })

  // -----------------------------------------------------------------------
  // Constrained size
  // -----------------------------------------------------------------------
  test.describe('constrained size', () => {
    test('should apply width/height to container', async ({ page }) => {
      await waitForComponent(page, '#test-size')
      const size = await page.evaluate(() => {
        const el = document.querySelector('#test-size')
        const container = el.shadowRoot.querySelector('.editor-container')
        return {
          width: container.style.width,
          height: container.style.height
        }
      })
      expect(size.width).toBe('400px')
      expect(size.height).toBe('300px')
    })
  })

  // -----------------------------------------------------------------------
  // Custom slot
  // -----------------------------------------------------------------------
  test.describe('slot content', () => {
    test('should render custom slot content in drop zone', async ({ page }) => {
      await waitForComponent(page, '#test-slot')
      const slotContent = await page.evaluate(() => {
        const el = document.querySelector('#test-slot')
        const slot = el.shadowRoot.querySelector('slot')
        const assigned = slot?.assignedNodes()
        return assigned?.length > 0
      })
      expect(slotContent).toBe(true)
    })
  })

  // -----------------------------------------------------------------------
  // Dirty state
  // -----------------------------------------------------------------------
  test.describe('dirty state', () => {
    test('should not be dirty initially', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dirty = await page.evaluate(() => {
        return document.querySelector('#test-default').isDirty
      })
      expect(dirty).toBe(false)
    })

    test('should be dirty after edit', async ({ page }) => {
      await loadTestImage(page, '#test-default')
      const dirty = await page.evaluate(() => {
        const el = document.querySelector('#test-default')
        el.rotate(90)
        return el.isDirty
      })
      expect(dirty).toBe(true)
    })
  })
})
