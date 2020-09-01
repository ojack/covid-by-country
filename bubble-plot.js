const html = require('choo/html')
const Component = require('choo/component')
const d3 = require('d3')

module.exports = class Plot extends Component {
  constructor (id, state, emit, _opts = {}) {
    super(id)
    const opts = Object.assign({},  {width: window.innerWidth,  height: window.innerHeight}, _opts)
    console.log('opts are', opts)
    this.props = state.components[id] = opts
    this.state = { dateIndex: 0}
  //  this.local = state.components[id] = {}
  }

  load (element) {
    // this.map = new mapboxgl.Map({
    //   container: element,
    //   center: this.local.center
    // })
    const svg = d3.select(element)
    .append('svg')
    .attr('width', this.props.width)
    .attr('height', this.props.height)

    this.svg = svg

    this.generateSVG()
  }

  generateSVG () {
    const self = this
    const forceStrength = 0.002
    const scale = 0.7
    var bubbles = this.svg.selectAll('.bubble').data(this.props.nodes,  (d) => { return d.id; })
    var bubblesE = bubbles.enter().append('circle')
    .classed('bubble', true)
    .attr('r', this.props.radius(4))
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('fill', (d, i) => this.props.color(d))
    // .attr('stroke', function (d) { return d3.rgb(fillColor(d.group)).darker(); })
    // .attr('stroke-width', 2)
    .on('mouseover', function (d) {
      d3.select(this).attr('stroke', 'gray').attr("stroke-width", "3px")
      self.props.mouseover(d)
  })
    .on('mouseout', function (d) {
      d3.select(this).attr('stroke', 'none');
      self.props.mouseout(d)
    })

    bubbles = bubbles.merge(bubblesE)

    const simulation = d3.forceSimulation()
    //  .nodes(nodes)
    //  .velocityDecay(0.2)
    .on('tick', () =>  {
      bubbles.attr('cx', (d) => d.x).attr('cy', (d) =>  d.y)
    })
    .force("collide", d3.forceCollide().radius(this.props.radius(5)))
    .force('x', d3.forceX(this.props.width/2).strength(0.003))
    .force('y', d3.forceY(this.props.height/2).strength(0.003))
    // .force('x', d3.forceX(this.props.width/2).strength(this.props.forceStrength(100)))
    // .force('y', d3.forceY(this.props.height/2).strength(this.props.forceStrength(100)))
    .stop()

    simulation.nodes(this.props.nodes)

    for (const node of this.props.nodes) {
      node.x = node.x * scale + this.props.width/2
      node.y = node.y * scale + this.props.height/2
    }

      simulation.restart()

      this.bubbles = bubbles
      this.simulation = simulation
  }

  update ({ dateIndex = 0 } = {}) {
    // if(this.state.nodes !== nodes) {
    //   this.state.nodes = nodes
    // //  generateSVG()
    // }
    if(dateIndex !== this.state.dateIndex) {
      this.state.dateIndex = dateIndex
      this.bubbles.transition()
        .duration(200)
        .attr('r', this.props.radius(4, dateIndex))
      this.simulation
      .force("collide", d3.forceCollide().radius(this.props.radius(8, dateIndex)))
      // .force('x', d3.forceX(this.props.width/2).strength(this.props.forceStrength(100)))
      // .force('y', d3.forceY(this.props.height/2).strength(this.props.forceStrength(100)))
      // .force('x', d3.forceX(this.props.width/2).strength(this.props.forceStrength(dateIndex)))
      // .force('y', d3.forceY(this.props.height/2).strength(this.props.forceStrength(dateIndex)))
      this.simulation.alpha(1).restart()
    }
    // if (center.join() !== this.local.center.join()) {
    //   this.map.setCenter(center)
    // }
    // return false
    return false
  }

  createElement (center) {
  //  this.local.center = center
    return html`<div class="fixed w-100 h-100 top-0 left-0"></div>`
  }
}
