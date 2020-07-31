const cases = require('./load-data.js')()
const d3 = require('d3')
const tooltip = require('./tooltip.js')('tooltip', 200)



const bubbleChart = ({ parent, data, width = window.innerWidth, height = window.innerHeight}) => {

//  const nodes = [{name:'a'}, {name:'b'}, {name:'c'}]
  const center = {x: width / 2, y: height / 2}
  const forceStrength = 0.02

  const groupBubbles = (sim) => sim.force('x', d3.forceX().strength(forceStrength).x(center.x))

  const testNodes = new Array(100).fill(0).map((_, i) => ({
    id: i,
    radius: i/4,
    value: i,
    x: Math.random() * width,
    y: Math.random() * height
  }))

  const svg = d3.select(parent)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

    // sort them to prevent occlusion of smaller nodes.
  testNodes.sort(function (a, b) { return b.value - a.value; });
  var bubbles = svg.selectAll('.bubble').data(testNodes,  (d) => { return d.id; })
  var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('fill', (d) => `hsl(${d.id*10}, 100%, 50%)`)
      // .attr('stroke', function (d) { return d3.rgb(fillColor(d.group)).darker(); })
      // .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    // @v4 Merge the original empty selection and the enter selection
    bubbles = bubbles.merge(bubblesE);



    // Fancy transition to make bubbles appear, ending with the
// correct radius
bubbles.transition()
  .duration(2000)
  .attr('r', (d) => d.radius);


  // let svg = null
  // let bubbles = null
  // let nodes = []

  const charge = (d) => {
    return -forceStrength * Math.pow(d.radius, 2.0);
  }
  const ticked = () =>  {
    bubbles
      .attr('cx', (d) => d.x)
      .attr('cy', (d) =>  d.y)
  }

  const simulation = d3.forceSimulation()
  //  .nodes(testNodes)
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked)

  simulation.stop()

  console.log('nodes', testNodes)
  simulation.nodes(testNodes)
  simulation.restart()
  // simulation.force('center', d3.forceCenter(d3.width / 2, d3.height / 2))

  groupBubbles(simulation)

  function showDetail(d) {
  // change outline to indicate hover state.
  d3.select(this).attr('stroke', 'black');

  var content = '<span class="name">Title: </span><span class="value">' +
                d.value +
                '</span><br/>' +
                '<span class="name">Amount: </span><span class="value">$' +
                d.value +
                '</span><br/>' +
                '<span class="name">Year: </span><span class="value">' +
                d.value +
                '</span>';

  tooltip.showTooltip(content, d3.event);
}

/*
 * Hides tooltip
 */
function hideDetail(d) {
  // reset outline
  d3.select(this)
    .attr('stroke', '#fff');

  tooltip.hideTooltip();
}
}


const container = document.createElement('div')
document.body.appendChild(container)
bubbleChart({ parent: container })
