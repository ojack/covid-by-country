const html = require('choo/html')
const Component = require('choo/component')
const AnimatedScatter = require('./animated-scatter.js')



module.exports = class AnimatedGraph extends Component {
  constructor (id, state, emit) {
    super(id)
    this.data = state.data
    this.dateIndex = state.dateIndex
  //  this.dimensions = Object.assign({}, state.layout.graph)
    this.local = state.components[id] = {}
    this.state = state
    this.emit = emit
    this.plot = state.plot
    state.animatedGraph = this
    this.plotSettings = Object.assign({}, state.plotSettings)
  }

  load (element) {
    this.graph = AnimatedScatter(this.state, this.emit)
    window.graph = this.graph
    element.appendChild(this.graph.node)
  }

  update ({ dateIndex, dimensions, plot, plotSettings }) {
    this.graph.toggleLabels(plotSettings.labels.selected)
    if(dateIndex != this.dateIndex) {
      this.graph.update(dateIndex, this.state.updateInterval, plot)
    }
  //  console.log(layout.graph, this.layout.graph)
    if(dimensions.width !== this.dimensions.width || dimensions.height !== this.dimensions.height) {
      console.log(this.dimensions, dimensions)
      this.graph.resize(dimensions.width, dimensions.height, plot)
      this.dimensions = Object.assign({}, dimensions)
    }
    if(this.plot !== plot) {
        console.log('plot', this.plot, plot)
      this.graph.resize(dimensions.width, dimensions.height, plot)
      this.plot = plot
    }
  //   console.log(this.plotSettings.labels, plotSettings.labels)
  //   if(this.plotSettings.labels.selected !== plotSettings.labels.selected) {
  // //    this.plotSettings = Object.assign({}, plotSettings)
  //     this.graph.toggleLabels(plotSettings.labels.selected)
  //   }
    // if (center.join() !== this.local.center.join()) {
    //   this.map.setCenter(center)
    // }

    return false
  }

  createElement ({ dateIndex, dimensions }) {
    this.dateIndex = dateIndex
    this.dimensions = Object.assign({}, dimensions)
    //this.local.center = center
    return html`<div></div>`
  }
}
