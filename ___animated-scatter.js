const d3 = require('d3')

const animationInterval = 500

module.exports = ({ width= window.innerWidth, height = window.innerHeight, margin, data}) => {
  const countries = data.countries
  let dataIndex = 20

  // log scale
  const getX = (dateIndex) => d3.scaleLog([1, 40000], [margin.left, width - margin.right]).clamp(true)
  const getY = (dateIndex) => d3.scaleLog([0.1, 1000], [height - margin.bottom, margin.top]).clamp(true)

  let x = getX(dataIndex)
  let y = getY(dataIndex)
//  const radius = d3.scaleSqrt([0, 4e5], [6, 40])
  const radius = () => 10
  const opacity = (val) => val < 0.1 ? 0 : 1

  // create parent element
  const svg = d3.create("svg")
  .attr("viewBox", [0, 0, width, height])
  .style('width', width)
  .style('height', height)
  .style('overflow', 'visible')

  // create circles
  const circles = svg.append("g")
  .attr("stroke", "black")
  .selectAll("points")
  .data(countries, d => d.name)
  .join("svg")
  //  .sort((a, b) => d3.descending(a.population, b.population))
  .attr("x", d => x(d['total_cases_per_million'][dataIndex]))
  .attr("y", d => y(d['new_cases_smoothed_per_million'][dataIndex]))
  .attr("overflow", "visible")
  .on('mouseover', (d, i, arr, el) => console.log(d, arr[i].getAttribute('x'), arr[i].y))
  .style("overflow", "visible")

  const inner = circles.append("circle")
  .attr("r", d => radius(d['total_cases'][dataIndex]))
  .attr("fill", (d) => d.color)

  circles.append("text").text(d => d.name)



  // svg.append("g")
  // .attr('class', 'x-axis')
  // .call(xAxis());
  // //
  // svg.append("g")
  // .attr('class', 'y-axis')
  // .call(yAxis);

  const label = svg.append("text")
  .attr("x", width - margin.right)
  .attr("y", height - margin.bottom - 20)
  .attr("fill", "currentColor")
  .attr("text-anchor", "end")
  .text("Incidence (total cases per million ppl)")
  //
  // svg.append("g")
  // .attr("class", "grid")
  // .call(grid());



  const update = (dataIndex, animationInterval = 500) => {
    circles
    .transition()
    .ease(d3.easeLinear)
    .duration(animationInterval)
    .attr("opacity", d => opacity(d['total_cases_per_million'][dataIndex]))
    .attr("x", d => x(d['total_cases_per_million'][dataIndex]))
    .attr("y", d => y(d['new_cases_smoothed_per_million'][dataIndex]))

    inner.transition()
    .ease(d3.easeLinear)
    .duration(animationInterval).attr("r", d => radius(d['total_cases'][dataIndex]))
  }

  function resize(_width, _height) {
    width = _width
    height = _height
    svg.attr("viewBox", [0, 0, width, height])
    .style('width', width)
    .style('height', height)

  //  svg.select('.x-axis').attr("transform", `translate(0,${height - margin.bottom})`)

    label.attr("x", width - margin.right)
    .attr("y", height - margin.bottom - 20)
  }

  return {
    node: svg.node(),
    update: update,
    resize: resize
  }
}

// older


// const xAxis = () => g => {
//
// const axis = d3.axisBottom(getX(dataIndex)).ticks()
// //.ticks(width / 80, ",")
// //console.log('generating axis', getX(dataIndex))
// return  g
// .attr("transform", `translate(0,${height - margin.bottom})`)
// .call(axis)
// .call(g => g.select(".domain").remove())
// }
//
// const yAxis = g => g
// .attr("transform", `translate(${margin.left},0)`)
// .call(d3.axisLeft(y))
// .call(g => g.select(".domain").remove())
// .call(g => g.append("text")
// .attr("x", margin.left/2 - 10)
// .attr("y", margin.top + 10)
// .attr("fill", "currentColor")
// .attr("text-anchor", "start")
// .text("↑ New cases per million people (7-day rolling avg)"))

// const grid = () => g => g
// .attr("stroke", "currentColor")
// .attr("stroke-opacity", 0.1)
// .call(g => g.append("g")
// .selectAll("line")
// .data(x.ticks())
// .join("line")
// .attr("x1", d => 0.5 + x(d))
// .attr("x2", d => 0.5 + x(d))
// .attr("y1", margin.top)
// .attr("y2", height - margin.bottom))
// .call(g => g.append("g")
// .selectAll("line")
// .data(y.ticks())
// .join("line")
// .attr("y1", d => 0.5 + y(d))
// .attr("y2", d => 0.5 + y(d))
// .attr("x1", margin.left)
// .attr("x2", width - margin.right));

//const color = d3.scaleOrdinal(countries.map(d => d.continent), d3.schemeCategory10).unknown("black")
//const color = (i) => d3.interpolateSpectral(i/data.countries.length)
// svg.selectAll(".x-grid")
// .call(grid())
//  xAxis.call(d3.axisBottom(x).ticks(width / 80, ","))
//  if(dataIndex >= data.dates.length - 3) dataIndex = 0
//const color = (i) => d3.hsl(i/data.countries.length, 50, 50)
//  const dateLabel = svg.append('text').text(data.dates[dataIndex]).attr('y',30).attr('x', width - margin.right).attr('text-anchor', 'end')
//  .call(xAxis());
  // xAxis()
  // yAxis()
//  setInterval(update, animationInterval)

//    console.log(data.dates[dataIndex])
  //  dateLabel.text(data.dates[dataIndex])
