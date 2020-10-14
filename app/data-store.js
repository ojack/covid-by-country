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
  console.log('t', startingTransform)
  state.data = processData(data)
  state.dateIndex = 20
  state.updateInterval = 350
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


  state.layout.graph.transform = scaleFromBottomLeft(4.5, state.layout.graph.height)
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
    state.tooltip = null
    emitter.emit('render')
  })

  emitter.on('togglePanel', () => {
    state.layout.panel.isOpen = !state.layout.panel.isOpen
    resize()
    emitter.emit('render')
  })

  emitter.on('update zoom', (transform) => {
    state.layout.graph.transform = transform
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
    const transform = state.layout.graph.transform
    const plot = state.plot
    plot.zx = transform.rescaleX(plot.x.scale()).interpolate(d3.interpolateRound)
    plot.zy = transform.rescaleY(plot.y.scale()).interpolate(d3.interpolateRound)
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
    emitter.emit('render')
  }

  emitter.on('setDate', (dateIndex) => {
    state.dateIndex = dateIndex
    emitter.emit('render')
  })



}
