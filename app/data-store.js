const data = require('./../data-processing/covid-cases-processed.json')
const processData = require('./process-data.js')
const d3 = require('d3')

window.d3 = d3

// const startingTransform =  d3.zoomTransform( 4.897345569600865, 0.5584153203977849, -2518.799953362894)
//const startingTransform = d3.zoomIdentity.translate( -2518.799953362894, 0.5584153203977849).scale( 4.89734556960086)
//const startingTransform = d3.zoomIdentity.translate( 0.5584153203977849, -2518.799953362894).scale( 4.89734556960086)
const startingTransform = d3.zoomIdentity
// for starting stransform, scale from bottom left. not sure why this works
const scaleFromBottomLeft = (scaleAmount, height) => {
  return d3.zoomIdentity.translate(0, -height*(scaleAmount - 1)).scale(scaleAmount)
}



module.exports = (state, emitter) => {
  //  console.log('t', startingTransform)
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
      //  transform: scaleFromBottomLeft(4, state.layout.graph.height)
    },
    panel: { width: 300, isOpen: false }
  }

  resize(false)


  state.layout.graph.transformX = scaleFromBottomLeft(4.5, state.layout.graph.height)
  state.layout.graph.transformY = scaleFromBottomLeft(4.5, state.layout.graph.height)

  console.log(state.layout.graph.transform)
  //  state.layout.graph.transform = scaleToDomain(0, 600, state.layout.graph.width)
  const plots = require('./plot-types.js')(state)

  state.plot = plots.currentPlot

  state.plotSettings = {
    scale: {
      options: [{ label: 'linear'}, {label: 'log'}],
      selected: 0
    },
    type: {
      options: plots.plotTypes,
      selected: 1
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




  // state.margin =

  const color = d3.scaleOrdinal(state.data.countries.map(d => d.continent), d3.schemeSet1).unknown("black")
  //  console.log(data)
  state.selected = null



  let updateInterval = setInterval(incrementDate, state.updateInterval)

  emitter.on('update settings', (key, index) => {
    state.plotSettings[key].selected = index
    state.plot = plots.setPlot({
      log: state.plotSettings.scale.selected == 0 ? false: true,
      type: state.plotSettings.type.selected
    })
    if(key === 'scale' || key === 'type') {
      //    state.layout.graph.transform =  d3.zoomIdentity
      state.animatedGraph.graph.resetZoom()
    }
    updateScales()
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
    console.log(e)
    const t = e.transform;
    const k = t.k / z.k;

    let tx = state.layout.graph.transformX
    let ty = state.layout.graph.transformY
    //  const point = e.sourceEvent ? d3.pointer(e) : [width / 2, height / 2];
    const shift = e.sourceEvent && e.sourceEvent.shiftKey;
    const point = [ 0, state.layout.graph.height]
    if (k === 1) {
      tx = tx.translate((t.x - z.x)/tx.k, 0)
      ty = ty.translate(0, (t.y - z.y) / ty.k)
    } else {
      tx = tx.scale(shift ? 1/k : k)
      ty = ty.translate(0, - state.layout.graph.height*(k-1)).scale(k)
    }
    state.layout.graph.transformX = tx
    state.layout.graph.transformY = ty
    z = t
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

  function updateScales () {
    const transformX = state.layout.graph.transformX
    const transformY = state.layout.graph.transformY
    const plot = state.plot
    plot.zx = transformX.rescaleX(plot.x.scale()).interpolate(d3.interpolateRound)
    plot.zy = transformY.rescaleY(plot.y.scale()).interpolate(d3.interpolateRound)
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
    console.log(y0, y1, yScale, height)

    const xScale = height/(x1 - x0) - 0.1
    console.log('x', x0, x1, xScale)
    // return d3.zoomIdentity
    //          .scale(width / (x1 - x0), 0.5)
    //          .translate(-x0, 0)
    return {
      x: d3.zoomIdentity.translate(0, 0).scale(xScale),
      y: d3.zoomIdentity.translate(0, -y0*(yScale - 1)).scale(yScale)
    }
    // !! problem: zoom only has onw k value, to do: https://observablehq.com/@d3/x-y-zoom
    //  return d3.zoomIdentity.translate(0, -height*(yScale - 1)).scale(yScale, yScale)
  }

  // const scaleFromBottomLeft = (scaleAmount, height) => {
  //   return d3.zoomIdentity.translate(0, -height*(scaleAmount - 1)).scale(scaleAmount)
  // }

  function updateExtent(x, y) {
  //  console.log(state.plot)

    //   const xRange = [state.plot.zx(x[0]), state.plot.zx(x[1])]
    // const xMin = state.plot.zx(x[0])
    // const xMax =  state.plot.zx(x[1])
    console.log(x, y, state.plot.x.scale()(x[1]), state.plot.y.scale()(y[1]) )
    const getTransforms  = scaleToDomain(
      state.plot.x.scale()(x[0]),
      state.plot.x.scale()(x[1]),
      state.plot.y.scale()(y[0]),
      state.plot.y.scale()(y[1]),
      state.layout.graph.width,
      state.layout.graph.height
    )
    state.layout.graph.transformX = getTransforms.x
    state.layout.graph.transformY = getTransforms.y

    updateScales()
    state.animatedGraph.graph.setZoom(state.layout.graph.transform)
    //  console.log(x, xRange)
  }

  emitter.on('setDate', (dateIndex) => {
    state.dateIndex = dateIndex
    emitter.emit('render')
  })



}
