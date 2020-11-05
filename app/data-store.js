const data = require('./../data-processing/covid-cases-processed.json')
const processData = require('./process-data.js')
const d3 = require('d3')
const zoom = require('./zoom.js')()

module.exports = (state, emitter) => {
  state.data = processData(data)
  state.dateIndex = 100
  state.updateInterval = 200
  state.isPlaying = true
  state.tooltip = null
  state.layout = {
    graph : {
      width: 0,
      height: 0,
      margin: { top: 40, bottom: 200, left: 50, right: 40 },
    },
    panel: { width: 300, isOpen: false }
  }

  resize(false)
  console.log(state.query)
  const plots = require('./plot-types.js')(state)
  state.plot = plots.currentPlot

  updateScales()

  state.plotSettings = {
    scale: {
      options: [{ label: 'linear'}, {label: 'log'}],
      selected: 0
    },
    type: {
      options: Object.keys(plots.plotTypes),
      selected: Object.keys(plots.plotTypes).indexOf('incidence')
    },
    labels : {
      selected: true ,
      label: 'show labels'
    },
    trajectories: {
      selected: true,
      label: 'show trajectories'
    },
    autoZoom: {
      selected: false,
      label: 'auto zoom'
    }
  }

  resize()
  state.selected = null

  let updateInterval = setInterval(incrementDate, state.updateInterval)

  emitter.on('update settings', (key, index) => {
    if(key) state.plotSettings[key].selected = index

    if(key === 'scale' || key === 'type') updatePlot()
    //  state.canvas.drawPlot()
    //  state.plot = plots.currentPlot
    emitter.emit('render')
  })


  emitter.on('togglePlay', () => {
    state.isPlaying = !state.isPlaying
    if(!state.isPlaying) {
      stopPlaying()
    } else {
      startPlaying()
    }
    emitter.emit('render')
  })

  emitter.on('setDate', (dateIndex) => {
    state.dateIndex = dateIndex
    emitter.emit('render')
  })

  emitter.on('setTooltip', (d) => {
    state.tooltip = d
    emitter.emit('render')
  })

  emitter.on('clearTooltip', (d) => {
  //  state.tooltip = null
    emitter.emit('render')
  })

  emitter.on('togglePanel', () => {
    state.layout.panel.isOpen = !state.layout.panel.isOpen
    resize()
    emitter.emit('render')
  })

  let z = d3.zoomIdentity;

  emitter.on('setSelected', (d) => {

    const xExtent = d3.extent(d[state.plot.x.key]).map((val) => val * state.plot.x.scaleBy)
    const yExtent = d3.extent(d[state.plot.y.key]).map((val) => val * state.plot.x.scaleBy)
    console.log(xExtent, yExtent)
      state.tooltip = d
    updateExtent(xExtent, yExtent)
    emitter.emit('render')
  })

  emitter.on('update zoom on touch', (e) => {
    zoom.updateFromTouchEvent(e)
    updateScales()
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

  function updatePlot() {
    state.plot = plots.setPlot({
      log: state.plotSettings.scale.selected == 0 ? false: true,
      type: state.plotSettings.type.selected
    })
    state.animatedGraph.graph.resetZoom()
    updateScales()
  }

  function updateScales () {
    const transformX = state.layout.graph.transformX
    const transformY = state.layout.graph.transformY
    const plot = state.plot
    plot.zx = zoom.tx().rescaleX(plot.x.scale()).interpolate(d3.interpolateRound)
    plot.zy = zoom.ty().rescaleY(plot.y.scale()).interpolate(d3.interpolateRound)
    if(state.canvas) state.canvas.drawPlot(state.plotSettings.trajectories.selected)
  }

  function stopPlaying() {
    state.isPlaying = false
    clearInterval(updateInterval)
  }

  function startPlaying() {
    if(state.dateIndex >= state.data.dates.length)
    state.dateIndex = 0
    updateInterval = setInterval(incrementDate, state.updateInterval)
  }

  function incrementDate() {
    if(state.dateIndex < state.data.dates.length - 1) {
      state.dateIndex++
    } else {
      stopPlaying()
      // stop playing
    }
    if(state.plotSettings.autoZoom.selected === true) {
      const plot = state.plot
      updateExtent(
        plot.x.dailyExtent[state.dateIndex]*plot.x.scaleBy,
        plot.y.dailyExtent[state.dateIndex]*plot.y.scaleBy
      )
    }
    emitter.emit('render')
  }

  const scaleToDomain = (x0, x1,y0, y1, width, height) => {
    const yScale = height/(y0 - y1) - 0.1
    const xScale = height/(x1 - x0) - 0.1
    return {
      x: d3.zoomIdentity.translate(0, 0).scale(xScale),
      y: d3.zoomIdentity.translate(0, -y0*(yScale - 1)).scale(yScale)
    }
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
    zx.transform(_gx, getTransforms.x)
    zy.transform(_gy, getTransforms.y)
    updateScales()
    state.animatedGraph.graph.setZoom()
  }

}
