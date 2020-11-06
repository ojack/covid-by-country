const data = require('./../data-processing/covid-cases-processed.json')
const processData = require('./process-data.js')
const d3 = require('d3')

module.exports = (state, emitter) => {
  state.data = processData(data)
  state.dateIndex = 100
  state.updateInterval = 200
  state.isPlaying = true
  state.tooltip = {
    content: null,
    point: [0, 0]
  }
  const plots = require('./plot-types.js')(state)
  state.plot = plots.currentPlot

  const scaleTypes = ['linear', 'log']
  state.plotSettings = {
    scale: {
      options: scaleTypes.map((label) => ({label: label, key: label})),
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
    }
    // ,
    // autoZoom: {
    //   selected: false,
    //   label: 'auto zoom'
    // }
  }

  // when forward or back is used
  emitter.on('navigate', () => {
    loadFromParams()
  })

  function loadFromParams() {
    console.log(state.query)
    // populate initial state based on query params
    Object.entries(state.query).forEach(([key, value]) => {
      if(state.plotSettings[key]) {
        if(key === 'type') {
          const selectedIndex = Object.keys(plots.plotTypes).indexOf(value)
          if(selectedIndex > -1) state.plotSettings[key].selected = selectedIndex
        } else if (key === 'scale'){
          const selectedIndex = scaleTypes.indexOf(value)
          if(selectedIndex > -1) state.plotSettings[key].selected = selectedIndex
        }
        else {
          const bool = String(value).toLowerCase() === "true" ? true : false
          state.plotSettings[key].selected = bool
        }
      }
    })

    updatePlot()
  }
  loadFromParams()

  state.selected = null

  let updateInterval = setInterval(incrementDate, state.updateInterval)

  emitter.on('update settings', (key, index) => {
    if(key) state.plotSettings[key].selected = index
    setUrl()
    if(key === 'scale' || key === 'type') updatePlot()
    emitter.emit('render')
  })



  // update url to reflect current parameters
  function setUrl() {
    const getValue = (value) => value.options ? value.options[value.selected].key : value.selected
    const queryString = `${Object.entries(state.plotSettings).map(([key, value]) => `${key}=${getValue(value)}`).join('&')}`
  //  var pageUrl = '?' + queryString;
//  console.log('')
  //  window.history.pushState('', '', `?${queryString}`)
    emitter.emit('pushState', `?${queryString}`)
  }

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

  emitter.on('setTooltip', (d, e) => {
  //  console.log(point)
    state.tooltip.content = Object.assign({}, d)
    state.tooltip.point = [e.pageX, e.pageY]
    emitter.emit('render')
  })

  emitter.on('clearTooltip', (d) => {
  //  state.tooltip = null
    emitter.emit('render')
  })

  let z = d3.zoomIdentity;

  function updatePlot() {
    state.plot = plots.setPlot({
      log: state.plotSettings.scale.selected == 0 ? false: true,
      type: Object.keys(plots.plotTypes)[state.plotSettings.type.selected]
    })
  //  if(state.animatedGraph) state.animatedGraph.graph.resetZoom()
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
    // if(state.plotSettings.autoZoom.selected === true) {
    //   const plot = state.plot
    //   updateExtent(
    //     plot.x.dailyExtent[state.dateIndex]*plot.x.scaleBy,
    //     plot.y.dailyExtent[state.dateIndex]*plot.y.scaleBy
    //   )
    // }
    emitter.emit('render')
  }

}
