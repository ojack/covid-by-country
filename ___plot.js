// const cases = require('./load-data.js')()
const cases = require('./data/data-processing/covid-cases.json')
const d3 = require('d3')
const tooltip = require('./tooltip.js')('tooltip', 200)

const radiusMult = 4000
console.log(cases.dates.length)
let dateIndex = 100

const getRadius = (margin=2) => (d) => margin + radiusMult* d.cases[dateIndex]/d.population

const bubbleChart = ({ parent, data, width = window.innerWidth, height = window.innerHeight}) => {
  // the default phyllotaxis arrangement is centered on <0,0> with a distance between nodes of ~10 pixels
  // we will scale & translate it to fit the canvas
  const scale = 0.7;
  const center = {x: width / 2, y: height / 2}
  const forceStrength = 0.002

  const groupBubbles = (sim) => sim.force('x', d3.forceX().strength(forceStrength).x(center.x))

  const nodes = cases.countries.filter((country) => country.id != "OWID_WRLD").filter((country) => country.population > 1000000).map((country) => ({
    id: country.iso,
    name: country.name,
    cases: country.cases,
    continent: country.continent,
    population: country.population,
  }))

  const continents = ['Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania']
  const color = (d) => {
    const i = continents.indexOf(d.continent)
    if(i >= 0) return d3.interpolateTurbo(i/continents.length)
    console.log(d)
    return 'blue'
  }

  const svg = d3.select(parent)
  .append('svg')
  .attr('width', width)
  .attr('height', height)

  // sort them to prevent occlusion of smaller nodes.
  nodes.sort(function (a, b) { return b.value - a.value; });
  // console.log('nodes', nodes)
  var bubbles = svg.selectAll('.bubble').data(nodes,  (d) => { return d.id; })
  var bubblesE = bubbles.enter().append('circle')
  .classed('bubble', true)
  .attr('r', 4)
  .attr('cx', (d) => d.x)
  .attr('cy', (d) => d.y)
  .attr('fill', (d, i) => color(d))
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
  .attr('r', getRadius());

  const simulation = d3.forceSimulation()
  //  .nodes(nodes)
  //  .velocityDecay(0.2)
  .on('tick', () =>  {
    bubbles.attr('cx', (d) => d.x).attr('cy', (d) =>  d.y)
  })
  //.force("collide", d3.forceCollide().radius(getRadius(5)))
  .force('x', d3.forceX(center.x).strength(forceStrength))
  .force('y', d3.forceY(center.y).strength(forceStrength))
  .stop()

  //  .force('charge', d3.forceManyBody().strength(  (d) => -forceStrength * Math.pow(radiusMult*d.cases[dateIndex]/d.population, 2.0)))


  const updateData = () => {
    console.log('updating', dateIndex)
    dateIndex++
    if(dateIndex >= cases.dates.length) dateIndex = 0
    bubbles.transition()
      .duration(1000)
      .attr('r', getRadius())
    simulation.force("collide", d3.forceCollide().radius(getRadius(4)))
    simulation.alpha(1).restart()
  }

  //  simulation.stop()

  //  console.log('nodes', nodes)
  simulation.nodes(nodes)
  for (const node of nodes) {
    node.x = node.x * scale + center.x
    node.y = node.y * scale + center.y
  }
  simulation.restart()

  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');
    tooltip.showTooltip(`
        ${d.name}
        cases: ${d.cases[dateIndex]}
        pop: ${d.population}
      `, d3.event);
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

  setInterval(updateData, 500)
}


const container = document.createElement('div')
document.body.appendChild(container)
bubbleChart({ parent: container })
