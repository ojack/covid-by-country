// functions for plotting x and y as a function of time and value
// usage: x(dateIndex)(value)
const d3 = require('d3')

const x = (dateIndex) => d3.scaleLog([1, 45000], [0, state.layout.graph.width]).clamp(true)
const y = (dateIndex) => d3.scaleLog([0.1, Math.max(1000, state.data.max['new_cases_smoothed_per_million'])], [state.layout.graph.height,0]).clamp(true)

module.exports = (state) => {
  const color = d3.scaleOrdinal(state.data.countries.map(d => d.continent), d3.schemeSet1).unknown("black")

  // functions rather than fixed so that will update as graph is updated
  const xRange = () => [0, state.layout.graph.width]
  const yRange = () => [state.layout.graph.height, 0]

  const dataSets = {
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
    '7-day 100' : {
      label: 'new cases (last 7 days) per 100,000',
      value: (d, i) => d['7_day_incidence_per_million'][i]/10,
      domain: [0, state.data.extent['7_day_incidence_per_million'][1]/10],
      dailyExtent: state.data.dailyExtent['7_day_incidence_per_million'],
      extent: state.data.extent['7_day_incidence_per_million'],
      // domain: [0, 250],
      logMin: 0.1
      // min: 0,
      // minLog: 0.1,
      // max: Math.max(1000, state.data.extent['new_cases_smoothed_per_million'])
    },
    'time': {
      value: (d, i) => i,
      label: 'time',
      domain: [0, state.data.dates.length],
    },
    // 'total cases': {
    //   value: (d, i) => d['total_cases_per_million'][i],
    //   label: 'total cases per million',
    //   domain: [0, state.data.extent['total_cases_per_million'][1]],
    //   logMin: 1,
    //   dailyExtent: state.data.dailyExtent['total_cases_per_million'],
    //   extent: state.data.extent['total_cases_per_million']
    // },
    'total cases 100': {
      value: (d, i) =>d['total_cases_per_million'][i]/10,
      label: 'cases since start of epidemic per 100,000',
      // domain: [0, 2000],
      domain: [0, state.data.extent['total_cases_per_million'][1]/10],
      logMin: 1,
      dailyExtent: state.data.dailyExtent['total_cases_per_million'],
      extent: state.data.extent['total_cases_per_million']
    },
    'dx': {
      label: 'change in 7-day incidence',
      value: (d, i) => d['dx2'][i]/10,
      domain: [-20, 20],
      dailyExtent: state.data.dailyExtent['dx2'],
      extent: state.data.extent['dx2']
    },
    'percent change': {
      label: 'percent change in cases',
      value: (d, i) => d['dx2percent'][i],
      domain: [-1, 1],
      dailyExtent: state.data.dailyExtent['dx2percent'],
      extent: state.data.extent['dx2percent']
    }
  }

  const plotTypes = [
    {
      label: 'new cases over time',
      x: 'time',
      y: '7-day 100'
    },
    {
      label: '7-day incidence',
      x: 'total cases 100',
      y: '7-day 100',
      // baseTransform: {
      //   k: 4.897345569600865,
      //   x: 0.5584153203977849,
      //   y: -2518.799953362894
      // }
    },
    {
      label: 'change in incidence',
      x: '7-day 100',
      y: 'dx'
    },
    {
      label: 'change in incidence (%)',
      x: '7-day 100',
      y: 'percent change'
    }
  ]

  const getAxis = ({ log = false, data, range}) => {
    let scale = () => d3.scaleLinear(data.domain, range())
    if(log === true && data.logMin) {
      // different minumum domain for log plot, because cannot be zero
      scale = () => d3.scaleLog([data.logMin, data.domain[1]], range()).clamp(true)
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
    plot.zx = state.layout.graph.transform.x.rescaleX(plot.x.scale()).interpolate(d3.interpolateRound)
    plot.zy = state.layout.graph.transform.y.rescaleY(plot.y.scale()).interpolate(d3.interpolateRound)
    plot.color = color
    console.log(' got plot', plot)
    currentPlot = plot
    return plot
  }

  setPlot({ type: 1, log: false })

  return {
    plotTypes: plotTypes,
    currentPlot: currentPlot,
    setPlot: setPlot
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
}
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
