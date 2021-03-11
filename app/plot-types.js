// functions for plotting x and y as a function of time and value
// usage: x(dateIndex)(value)
const d3 = require('d3')

const x = (dateIndex) => d3.scaleLog([1, 45000], [0, state.layout.graph.width]).clamp(true)
const y = (dateIndex) => d3.scaleLog([0.1, Math.max(1000, state.data.max['new_cases_smoothed_per_million'])], [state.layout.graph.height,0]).clamp(true)

module.exports = (state) => {
  const color = d3.scaleOrdinal(state.data.countries.map(d => d.continent), d3.schemeCategory10).unknown("black")

  // functions rather than fixed so that will update as graph is updated
  const xRange = () => [0, state.layout.graph.width]
  const yRange = () => [state.layout.graph.height, 0]

  const dataSets = {
    '7-day 100' : {
      label: 'new cases (last 7 days) per 100,000',
      scaleBy: 0.1,
      logMin: 0.1,
      key: '7_day_incidence_per_million'
    },
    'time': {
      value: (d, i) => i,
      label: 'time',
      extent: [0, state.data.dates.length]
    },
    'total cases 100': {
      scaleBy: 0.1,
      label: 'cases since start of epidemic per 100,000',
      logMin: 1,
      key: 'total_cases_per_million'
    },
    'dx': {
      label: 'change in 7-day incidence',
      scaleBy: 0.1,
      key: 'dx2',
    },
    'percent change': {
      label: 'percent change in cases',
      key: 'dx2percent',
      scaleBy: 1
    }
  }

  Object.values(dataSets).forEach((obj) => {
    if(!obj.value) {
      obj.value = (d, i) => d[obj.key][i]*obj.scaleBy
    }
    obj.dailyExtent = state.data.dailyExtent[obj.key]
    obj.extent = state.data.extent[obj.key]
  })

  const plotTypes = {
    // {
    //   label: 'new cases over time',
    //   x: 'time',
    //   y: '7-day 100'
    // },
    'incidence': {
      label: '7-day incidence',
      x: 'total cases 100',
      y: '7-day 100',
      key: 'incidence'
    },
    'incidencechange': {
      label: 'change in incidence',
      x: '7-day 100',
      y: 'dx',
      key: 'incidencechange'
    },
    // {
    //   label: 'change in incidence (%)',
    //   x: '7-day 100',
    //   y: 'percent change'
    // }
  }

  const getAxis = ({ log = false, data, range}) => {
    let scale = () => d3.scaleLinear([data.extent[0]*data.scaleBy, data.extent[1]*data.scaleBy], range())
    if(log === true && data.logMin) {
      // different minumum domain for log plot, because cannot be zero
      scale = () => d3.scaleLog([data.logMin, data.extent[1]*data.scaleBy], range()).clamp(true)
    }
    console.log('scale', scale)
    return Object.assign({}, data, {
      scale: scale
    })
  }

  let currentPlot = null

  const setPlot = ({ type, log = false}) => {
    const plot = Object.assign({}, plotTypes[type])
  //  console.log('setting plot', index, plot, log, plotTypes)
    plot.x = getAxis({ data: dataSets[plot.x], range: xRange, log: log })
    plot.y = getAxis({ data: dataSets[plot.y], range: yRange, log: log})
    // plot.zx = state.layout.graph.transformX.rescaleX(plot.x.scale()).interpolate(d3.interpolateRound)
    // plot.zy = state.layout.graph.transformY.rescaleY(plot.y.scale()).interpolate(d3.interpolateRound)
    plot.color = color
    console.log(' got plot', plot)
    currentPlot = plot
    return plot
  }

  setPlot({ type: 'incidence', log: false })

  return {
    plotTypes: plotTypes,
    currentPlot: currentPlot,
    setPlot: setPlot
  }

}

// return [{
//   label: 'new cases over time',
//   color:  d3.scaleOrdinal(state.data.countries.map(d => d.continent), d3.schemeSet1).unknown("black"),
//   x: {
//     label: 'time',
//     scale:  () => d3.scaleLinear([0, state.data.dates.length], [0, state.layout.graph.width]),
//     value: (d, i) => i
//   },
//   y: {
//     label: 'new cases per million',
//     value: (d, i) => d['new_cases_smoothed_per_million'][i],
//     scale: () => d3.scaleLog([0.1, Math.max(1000, state.data.extent['new_cases_smoothed_per_million'])], [state.layout.graph.height,0]).clamp(true)
//   }
// }]
// 'new cases' : {
//   label: 'new cases per million',
//   value: (d, i) => d['new_cases_smoothed_per_million'][i],
//   domain: [0, Math.max(1000, state.data.extent['new_cases_smoothed_per_million'][1])],
//   logMin: 0.1
//   // min: 0,
//   // minLog: 0.1,
//   // max: Math.max(1000, state.data.max['new_cases_smoothed_per_million'])
// },
// '7-day' : {
//   label: '7-day incidence per million',
//   value: (d, i) => d['7_day_incidence_per_million'][i],
//   domain: [0, state.data.extent['7_day_incidence_per_million'][1]],
//   logMin: 0.1
//   // min: 0,
//   // minLog: 0.1,
//   // max: Math.max(1000, state.data.extent['new_cases_smoothed_per_million'])
// },
// state.plot = {
//   x: {
//     label: 'total cases per million',
//     scale:  () => d3.scaleLinear([0, 30000], [0, state.layout.graph.width]),
//     value: (d, i) => d['total_cases_per_million'][i]
//   },
//   y: {
//     label: 'new cases per million',
//     value: (d, i) => d['new_cases_smoothed_per_million'][i],
//     scale: () => d3.scaleLinear([0, Math.max(400, state.data.extent['new_cases_smoothed_per_million'])], [state.layout.graph.height,0])
//   }
// }

// new cases over time, log
// state.plot = {
//   color:  d3.scaleOrdinal(state.data.countries.map(d => d.continent), d3.schemeSet1).unknown("black"),
//   x: {
//     label: 'time',
//     scale:  () => d3.scaleLinear([0, state.data.dates.length], [0, state.layout.graph.width]),
//     value: (d, i) => i
//   },
//   y: {
//     label: 'new cases per million',
//     value: (d, i) => d['new_cases_smoothed_per_million'][i],
//     scale: () => d3.scaleLog([0.1, Math.max(1000, state.data.extent['new_cases_smoothed_per_million'])], [state.layout.graph.height,0]).clamp(true)
//   }
// }

// // new cases over time
// state.plot = {
//   color:  d3.scaleOrdinal(state.data.countries.map(d => d.continent), d3.schemeSet1).unknown("black"),
//   x: {
//     label: 'time',
//     scale:  () => d3.scaleLinear([50, state.data.dates.length], [0, state.layout.graph.width]),
//     value: (d, i) => i
//   },
//   y: {
//     label: 'new cases per million',
//     value: (d, i) => d['new_cases_smoothed_per_million'][i],
//     scale: () => d3.scaleLinear([0, Math.max(400, state.data.extent['new_cases_smoothed_per_million'])], [state.layout.graph.height,0])
//   }
// }

// state.plot = {
//   x: {
//     label: 'time',
//     scale:  () => d3.scaleLinear([0, state.data.dates.length], [0, state.layout.graph.width]),
//     value: (d, i) => i
//   },
//     y: {
//       label: 'change in new cases',
//       value: (d, i) => d['dx'][i],
//       scale: () => d3.scaleLinear([-20, 20], [state.layout.graph.height, 0])
//     }
//
// }

// state.plot = {
//   color: color,
//   x: {
//     label: 'total cases per million',
//     scale:  () => d3.scaleLog([1, 45000], [0, state.layout.graph.width]).clamp(true),
//     value: (d, i) => d['total_cases_per_million'][i]
//   },
//   y: {
//     label: 'new cases per million',
//     value: (d, i) => d['new_cases_smoothed_per_million'][i],
//     scale: () => d3.scaleLog([0.1, Math.max(1000, state.data.max['new_cases_smoothed_per_million'])], [state.layout.graph.height,0]).clamp(true)
//   }
// }
//
// // linear plot dx
// state.plot = {
//   color: color,
//   x: {
//     label: 'new cases per million',
//     scale: () => d3.scaleLinear([0, 400], [0, state.layout.graph.width]),
//     value: (d, i) => d['new_cases_smoothed_per_million'][i]
//   },
//   y: {
//     label: 'change in new cases',
//     value: (d, i) => d['dx'][i],
//     scale: () => d3.scaleLinear([-20, 20], [state.layout.graph.height, 0])
//   }
// }

// // log plot dx
// state.plot = {
//   color: color,
//   x: {
//     label: 'new cases per million',
//     scale: () => d3.scaleLog([0.1, Math.max(1000, state.data.max['new_cases_smoothed_per_million'])], [0, state.layout.graph.width]).clamp(true),
//     value: (d, i) => d['new_cases_smoothed_per_million'][i]
//   },
//   y: {
//     label: 'change in new cases',
//     value: (d, i) => d['dx'][i],
//     scale: () => d3.scaleLinear([-20, 20], [state.layout.graph.height, 0])
//   }
// }
