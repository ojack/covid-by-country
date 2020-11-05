const d3 = require('d3')
const zoom = require('./zoom.js')()

module.exports = (state, emitter) => {
  state.layout = {
    graph : {
      width: 0,
      height: 0,
      margin: { top: 40, bottom: 200, left: 50, right: 40 },
    },
    panel: { width: 300, isOpen: false }
  }

  resize(false)
  updateScales()

  emitter.on('togglePanel', () => {
    state.layout.panel.isOpen = !state.layout.panel.isOpen
    resize()
    emitter.emit('render')
  })

  emitter.on('layout:updateScales', () => {
    zoom.reset()
    updateScales()
  })

  emitter.on('update zoom on touch', (e) => {
    zoom.updateFromTouchEvent(e)
    updateScales()
    emitter.emit('render')
  })

  emitter.on('setSelected', (d) => {
    const xExtent = d3.extent(d[state.plot.x.key]).map((val) => val * state.plot.x.scaleBy)
    const yExtent = d3.extent(d[state.plot.y.key]).map((val) => val * state.plot.x.scaleBy)
    console.log(xExtent, yExtent)
    state.tooltip = d
    updateExtent(xExtent, yExtent)
    emitter.emit('render')
  })

  window.addEventListener('resize', () => {
    resize()
    emitter.emit('render')
  })

  function resize (_updateZoomTransform = true) {
    console.log('resizing state')
    const panel = state.layout.panel.isOpen ? state.layout.panel.width : false
    state.layout.graph.width = window.innerWidth - panel - state.layout.graph.margin.left - state.layout.graph.margin.right
    state.layout.graph.height = window.innerHeight - state.layout.graph.margin.top - state.layout.graph.margin.bottom
    if(_updateZoomTransform) updateScales()
  }

  function updateScales () {
    const transformX = state.layout.graph.transformX
    const transformY = state.layout.graph.transformY
    const plot = state.plot
    plot.zx = zoom.tx().rescaleX(plot.x.scale()).interpolate(d3.interpolateRound)
    plot.zy = zoom.ty().rescaleY(plot.y.scale()).interpolate(d3.interpolateRound)
    if(state.canvas) state.canvas.drawPlot(state.plotSettings.trajectories.selected)
  }

  function updateExtent(x, y) {
    const getTransforms  = scaleToDomain(
      state.plot.x.scale()(x[0]),
      state.plot.x.scale()(x[1]),
      state.plot.y.scale()(y[0]),
      state.plot.y.scale()(y[1]),
      state.layout.graph.width,
      state.layout.graph.height
    )
    zoom.updateExtent(getTransforms.x, getTransforms.y)
    updateScales()
    state.animatedGraph.graph.setZoom()
  }

  const scaleToDomain = (x0, x1,y0, y1, width, height) => {
    const yScale = height/(y0 - y1) - 0.1
    const xScale = height/(x1 - x0) - 0.1
    return {
      x: d3.zoomIdentity.translate(0, 0).scale(xScale),
      y: d3.zoomIdentity.translate(0, -y0*(yScale - 1)).scale(yScale)
    }
  }


}
