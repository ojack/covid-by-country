const data = require('./../data-processing/covid-cases-processed.json')
const processData = require('./process-data.js')
const d3 = require('d3')

module.exports = (state, emitter) => {
  state.data = processData(data)
  state.dateIndex = 100
  state.updateInterval = 200
  state.isPlaying = true
  state.tooltip = null
  const plots = require('./plot-types.js')(state)
  state.plot = plots.currentPlot

  state.plotSettings = {
    scale: {
      options: [{ label: 'linear'}, {label: 'log'}],
      selected: 0
    },
    type: {
      options: Object.values(plots.plotTypes),
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


  state.selected = null

  let updateInterval = setInterval(incrementDate, state.updateInterval)

  emitter.on('update settings', (key, index) => {
    if(key) state.plotSettings[key].selected = index
    if(key === 'scale' || key === 'type') updatePlot()
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

  let z = d3.zoomIdentity;







  // function resize (_updateZoomTransform = true) {
  //   console.log('resizing state')
  //   const panel = state.layout.panel.isOpen ? state.layout.panel.width : false
  //   state.layout.graph.width = window.innerWidth - panel - state.layout.graph.margin.left - state.layout.graph.margin.right
  //   state.layout.graph.height = window.innerHeight - state.layout.graph.margin.top - state.layout.graph.margin.bottom
  //   if(_updateZoomTransform) updateScales()
  // }

  function updatePlot() {
    state.plot = plots.setPlot({
      log: state.plotSettings.scale.selected == 0 ? false: true,
      type: Object.keys(plots.plotTypes)[state.plotSettings.type.selected]
    })
    state.animatedGraph.graph.resetZoom()
    emitter.emit('layout:updateScales')
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



}
