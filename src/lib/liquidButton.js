// Mouse/touch-reactive liquid blob button, adapted from the vanilla-JS
// `fluid-btn.js` widget used for the Google sign-in button on mono-donut.com.
// Ported to a class with a proper `destroy()` so it can be mounted/unmounted
// by a React component instead of running once at page load.
//
// The shape is a closed loop of spring-loaded points: each is pulled back to
// its origin and pushed away from every active pointer, then the loop is drawn
// as one bezier path per layer.

const XMLNS = 'http://www.w3.org/2000/svg'

// Mirrors the original `value * 1 || fallback`: a missing, non-numeric or zero
// data-attribute falls back rather than producing NaN.
function num(value, fallback) {
  return Number(value) || fallback
}

function length(x, y) {
  return Math.sqrt(x * x + y * y)
}

export class LiquidButton {
  constructor(svg, { text } = {}) {
    const options = svg.dataset
    this.id = LiquidButton.nextId || (LiquidButton.nextId = 1)
    LiquidButton.nextId++
    this.tension = num(options.tension, 0.4)
    this.width = num(options.width, 200)
    this.height = num(options.height, 50)
    this.margin = num(options.margin, 50)
    this.hoverFactor = num(options.hoverFactor, -0.1)
    this.gap = num(options.gap, 5)
    this.forceFactor = num(options.forceFactor, 0.2)
    this.noise = num(options.noise, 0)
    this.color1 = options.color1 || '#36DFE7'
    this.color2 = options.color2 || '#8F17E1'
    this.color3 = options.color3 || '#BF09E6'
    this.textColor = options.textColor || '#FFFFFF'
    // Passed explicitly rather than scraped from svg.innerHTML: React 18
    // StrictMode mounts effects twice in dev, and scraping innerHTML on the
    // second mount would read back whatever the (torn-down) first instance
    // had appended, corrupting the label.
    this.text = text || '▶'
    this.svg = svg
    this.destroyed = false
    this.touches = []

    // Two stacked blobs: the back one (index 0) is stiffer and flatter, the
    // front one (index 1) is looser and carries the gradient fill.
    this.layers = [
      { points: [], viscosity: 0.5, mouseForce: 100, forceLimit: 2 },
      { points: [], viscosity: 0.8, mouseForce: 150, forceLimit: 3 },
    ]

    this.layers.forEach((layer, index) => {
      const prefix = `layer${index + 1}`
      layer.viscosity = num(options[`${prefix}Viscosity`], layer.viscosity)
      layer.mouseForce = num(options[`${prefix}MouseForce`], layer.mouseForce)
      layer.forceLimit = num(options[`${prefix}ForceLimit`], layer.forceLimit)
      layer.path = document.createElementNS(XMLNS, 'path')
      this.svg.appendChild(layer.path)
    })

    this.svgText = document.createElementNS(XMLNS, 'text')
    this.svgText.setAttribute('x', '50%')
    this.svgText.setAttribute('y', '50%')
    this.svgText.setAttribute('dy', ~~(this.height / 8) + 'px')
    this.svgText.setAttribute('font-size', ~~(this.height / 3.5))
    this.svgText.setAttribute('text-anchor', 'middle')
    this.svgText.setAttribute('pointer-events', 'none')
    this.svg.appendChild(this.svgText)
    this.svgDefs = document.createElementNS(XMLNS, 'defs')
    this.svg.appendChild(this.svgDefs)

    this.mouseHandler = (e) => {
      this.touches = [{ x: e.offsetX, y: e.offsetY, force: 1 }]
    }
    this.touchHandler = (e) => {
      // Touch events are bound to the whole body (a finger can leave the SVG
      // mid-drag), so points outside the SVG box are filtered out here.
      const rect = this.svg.getBoundingClientRect()
      this.touches = [...e.changedTouches]
        .map((touch) => ({ x: touch.pageX - rect.left, y: touch.pageY - rect.top, force: touch.force || 1 }))
        .filter((touch) => touch.x > 0 && touch.y > 0 && touch.x < this.svgWidth && touch.y < this.svgHeight)
      e.preventDefault()
    }
    this.clearHandler = () => {
      this.touches = []
    }

    // Registered from one table so destroy() can tear down exactly the same
    // set — nothing outlives the React component that mounted the engine.
    this.listeners = [
      [document.body, 'touchstart', this.touchHandler],
      [document.body, 'touchmove', this.touchHandler],
      [document.body, 'touchend', this.clearHandler],
      [document.body, 'touchcancel', this.clearHandler],
      [this.svg, 'mousemove', this.mouseHandler],
      [this.svg, 'mouseout', this.clearHandler],
    ]
    for (const [target, event, handler] of this.listeners) {
      target.addEventListener(event, handler)
    }

    this.initOrigins()
    this.animate()
  }

  destroy() {
    this.destroyed = true
    if (this.rafId) cancelAnimationFrame(this.rafId)
    for (const [target, event, handler] of this.listeners) {
      target.removeEventListener(event, handler)
    }
    for (const layer of this.layers) layer.path.remove()
    this.svgText.remove()
    this.svgDefs.remove()
  }

  get svgWidth() {
    return this.width + this.margin * 2
  }

  get svgHeight() {
    return this.height + this.margin * 2
  }

  distance(p1, p2) {
    return length(p1.x - p2.x, p1.y - p2.y)
  }

  // One physics step: accumulate forces into each point's velocity, integrate,
  // then recompute the bezier control points for the new positions.
  update() {
    for (const layer of this.layers) {
      const points = layer.points

      for (const point of points) {
        // Spring back towards the resting position, plus optional jitter.
        const dx = point.ox - point.x + (Math.random() - 0.5) * this.noise
        const dy = point.oy - point.y + (Math.random() - 0.5) * this.noise
        const d = length(dx, dy)
        const f = d * this.forceFactor
        point.vx += f * (dx / d || 0)
        point.vy += f * (dy / d || 0)

        for (const touch of this.touches) {
          // A pointer inside the button body attracts instead of repels, which
          // is what makes the blob swell around the cursor on hover.
          const insideButton =
            touch.x > this.margin &&
            touch.x < this.margin + this.width &&
            touch.y > this.margin &&
            touch.y < this.margin + this.height
          const mouseForce = insideButton ? layer.mouseForce * -this.hoverFactor : layer.mouseForce

          const mx = point.x - touch.x
          const my = point.y - touch.y
          const md = length(mx, my)
          const mf = Math.max(-layer.forceLimit, Math.min(layer.forceLimit, (mouseForce * touch.force) / md))
          point.vx += mf * (mx / md || 0)
          point.vy += mf * (my / md || 0)
        }

        point.vx *= layer.viscosity
        point.vy *= layer.viscosity
        point.x += point.vx
        point.y += point.vy
      }

      // Catmull-Rom-style handles: each point's control points lie along the
      // line through its two neighbours, scaled by the distance to each.
      points.forEach((point, index) => {
        const prev = points[(index + points.length - 1) % points.length]
        const next = points[(index + 1) % points.length]
        const dPrev = this.distance(point, prev)
        const dNext = this.distance(point, next)
        const line = { x: next.x - prev.x, y: next.y - prev.y }
        const dLine = length(line.x, line.y)
        point.cPrev = {
          x: point.x - (line.x / dLine) * dPrev * this.tension,
          y: point.y - (line.y / dLine) * dPrev * this.tension,
        }
        point.cNext = {
          x: point.x + (line.x / dLine) * dNext * this.tension,
          y: point.y + (line.y / dLine) * dNext * this.tension,
        }
      })
    }
  }

  animate() {
    this.rafId = requestAnimationFrame(() => {
      if (this.destroyed) return
      this.update()
      this.draw()
      this.animate()
    })
  }

  // Radial gradient centred on the active pointer, used as the front layer's
  // fill. Only one gradient can fill the path, so multi-touch tracks the last
  // point rather than building a def per finger.
  updateTouchGradient(layer) {
    if (this.touches.length === 0) {
      layer.path.style.fill = this.color2
      return
    }

    this.svgDefs.replaceChildren()
    const touch = this.touches[this.touches.length - 1]
    const gradient = document.createElementNS(XMLNS, 'radialGradient')
    gradient.id = `liquid-gradient-${this.id}`
    gradient.setAttribute('cx', touch.x / this.svgWidth)
    gradient.setAttribute('cy', touch.y / this.svgHeight)
    gradient.setAttribute('r', touch.force)

    for (const [color, offset] of [
      [this.color3, '0%'],
      [this.color2, '100%'],
    ]) {
      const stop = document.createElementNS(XMLNS, 'stop')
      stop.setAttribute('stop-color', color)
      stop.setAttribute('offset', offset)
      gradient.appendChild(stop)
    }

    this.svgDefs.appendChild(gradient)
    layer.path.style.fill = `url(#${gradient.id})`
  }

  draw() {
    this.layers.forEach((layer, index) => {
      if (index === 1) {
        this.updateTouchGradient(layer)
      } else {
        layer.path.style.fill = this.color1
      }

      const points = layer.points
      const commands = ['M', points[0].x, points[0].y]
      for (let i = 1; i < points.length; i++) {
        const next = points[(i + 1) % points.length]
        commands.push('C', points[i].cNext.x, points[i].cNext.y, next.cPrev.x, next.cPrev.y, next.x, next.y)
      }
      commands.push('Z')
      layer.path.setAttribute('d', commands.join(' '))
    })

    this.svgText.textContent = this.text
    this.svgText.style.fill = this.textColor
  }

  // Resting outline of the blob: a pill traced clockwise as top edge, right
  // cap, bottom edge, left cap. Both layers start from these same coordinates.
  outlineCoordinates() {
    const { width, height, margin, gap } = this
    const inset = ~~(height / 2)
    const capSteps = ~~(height * 1.25)
    const coordinates = []

    for (let x = inset; x < width - inset; x += gap) {
      coordinates.push({ x: x + margin, y: margin })
    }
    for (let alpha = capSteps; alpha >= 0; alpha -= gap) {
      const angle = (Math.PI / capSteps) * alpha
      coordinates.push({
        x: (Math.sin(angle) * height) / 2 + margin + width - height / 2,
        y: (Math.cos(angle) * height) / 2 + margin + height / 2,
      })
    }
    for (let x = width - inset - 1; x >= inset; x -= gap) {
      coordinates.push({ x: x + margin, y: margin + height })
    }
    for (let alpha = 0; alpha <= capSteps; alpha += gap) {
      const angle = (Math.PI / capSteps) * alpha
      coordinates.push({
        x: height - (Math.sin(angle) * height) / 2 + margin - height / 2,
        y: (Math.cos(angle) * height) / 2 + margin + height / 2,
      })
    }

    return coordinates
  }

  initOrigins() {
    this.svg.setAttribute('width', this.svgWidth)
    this.svg.setAttribute('height', this.svgHeight)

    const coordinates = this.outlineCoordinates()
    for (const layer of this.layers) {
      // Each layer needs its own point objects — they're mutated in place and
      // must drift independently.
      layer.points = coordinates.map(({ x, y }) => ({ x, y, ox: x, oy: y, vx: 0, vy: 0 }))
    }
  }
}
