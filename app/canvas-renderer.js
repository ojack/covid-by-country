const html = require('choo/html')
const Component = require('choo/component')

module.exports = class CanvasRenderer extends Component {
  constructor (id, state, emit) {
    super(id)
    this.plot = state.plot
    this.data = state.data
    this.tooltip = state.tooltip
    this.plotSettings = state.plotSettings
    state.canvas = this
  //  this.dimensions = state.layout.graph
  }

  load(element) {
    const ctx = element.getContext('2d')
    ctx.strokeRect(75, 140, 150, 110)
    this.ctx = ctx
  //  if(this.plot.zx)
    this.drawPlot(this.plotSettings.trajectories.selected)
  }

  drawPlot(draw = true) {
    console.log('drawing', draw)
    this.ctx.strokeStyle = `rgba(200, 200, 200, 0.4)`
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.globalCompositeOperation = 'lighter'
    if(draw) {
    this.data.countries.forEach((country) => {
     const color = this.plot.color(country.continent)
    //  console.log(color)
      this.ctx.strokeStyle = color
      this.ctx.globalAlpha = 0.2
      plotTrajectory({
        // y: country[this.plot.yKey],
        // x: country[this.plot.xKey],
        dateArray: this.data.dates,
        d: country,
        plot: this.plot,
        ctx: this.ctx
      })
    })
  }
    if(this.tooltip !== null) {
        this.ctx.strokeStyle = `rgba(255, 255, 255, 1)`
        this.ctx.globalAlpha = 1
      //  console.log('tooltip', this.tooltip)
        plotTrajectory({
          plot: this.plot,
          ctx: this.ctx,
          d: this.tooltip,
          dateArray: this.data.dates
          // y: this.tooltip[this.plot.yKey],
          // x: this.tooltip[this.plot.xKey]
        })
    }
  }

  update({ dimensions, tooltip, plot, plotSettings}) {
//    this.plot = plot

//  console.log(dimensions.transform.x)
    if(dimensions.width !== this.dimensions.width ||
      dimensions.height !== this.dimensions.height ||
      this.tooltip !== tooltip || this.plot !== plot
      || this.plotSettings.trajectories.selected !== plotSettings.trajectories.selected
  ) {
      console.log('resizing canvas')
      this.canvas.width = dimensions.width
      this.canvas.height = dimensions.height
      this.dimensions = Object.assign({}, dimensions)
      this.plot = plot
      this.tooltip = tooltip
      this.plotSettings = plotSettings
      this.drawPlot(plotSettings.trajectories.selected)

    }
    return false
  }

  createElement({dimensions, tooltip}) {
    this.dimensions = Object.assign({}, dimensions)
    this.tooltip = tooltip
    const canvas = html`<canvas></canvas`
    canvas.width = dimensions.width
    canvas.height = dimensions.height
    this.canvas = canvas
    return canvas
  }
}

function plotTrajectory({ d, plot, ctx, dateArray}) {
  const {x, y} = plot
  ctx.beginPath()
  const xPlot = plot.zx(x.value(d, 0))
//  console.log(d, y)
  const yPlot = plot.zy(y.value(d, 0))
  ctx.moveTo(xPlot, yPlot)
  dateArray.forEach((date, dateIndex) => {
  //  const yVal = y[dateIndex]
    const xPlot = plot.zx(x.value(d, dateIndex))
    const yPlot = plot.zy(y.value(d, dateIndex))
    ctx.lineTo(xPlot, yPlot)
  })
  ctx.stroke()
}
