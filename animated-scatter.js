const d3 = require('d3')



module.exports = ({ layout, data, plot}, emit) => {
  let width= layout.graph.width
  let height = layout.graph.height
  const startingTransform = d3.zoomIdentity
  //.translate(width / 2, height / 2).scale(1.2).translate(-width / 2, -height / 2)

  let dataIndex = 20
  let animationInterval = 500
  let showLabels = true

  const countries = data.countries

  const zoom = d3.zoom()
  .scaleExtent([0.25, 32]).on("zoom", zoomed)
  const color = plot.color ? plot.color : d3.scaleOrdinal(countries.map(d => d.continent), d3.schemeSet1).unknown("black")

  const outer = d3.create("svg")
  .attr("viewBox", [0, 0, width, height])
  .style('width', width)
  .style('height', height)
  .style('overflow', 'visible')

  // create elements
  const svg = outer.append("svg")
  .attr("viewBox", [0, 0, width, height])
  .style('width', width)
  .style('height', height)
  .on('mouseleave', function() {
    d3.selectAll(".circle").attr("stroke", d => color(d.continent))
    emit('clearTooltip')
  })

  const gx = outer.append("g");
  const gy = outer.append("g");

  const yAxis = (g, y) => g
  //   .attr("transform", "translate(0,30)")
  .call( d3.axisLeft(y).ticks(4, ",.0f"))

  const xAxis = (g, x) => g
  .attr('class', 'x-axis')
    .attr('stroke', 'rgba(255, 255, 255, 0.5)')
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x).ticks(4, ",.0f"))


  gy.call(yAxis, plot.zy)
  gx.call(xAxis, plot.zx)

  const xLabel = outer.append('text')
    .attr("text-anchor", "end")
    .attr('fill', 'rgba(255, 255, 255, 0.5)')
    .attr("transform", `translate(${width},${height + 40})`)
    .text(`${plot.x.label} →`)

    const yLabel = outer.append('text')
      .attr("text-anchor", "start")
      .attr('fill', 'rgba(255, 255, 255, 0.5)')
      .attr("transform", `translate(10,20)`)
      .text(`↑ ${plot.y.label}`)



  //  console.log('AXIS', ticks)

  const radius = d3.scaleSqrt([0, 4e5], [4, 12])
  //  const radius = () => 5
  const opacity = (val) => val < 0.1 ? 0 : 1

  const {x, y} = plot


  const circles = svg.append("g")
  .attr("stroke", "black")
  .selectAll("points")
  .data(countries, d => d.name)
  .join("svg")
  .attr("class", "circle")
  //  .attr("x", d => x(d[plot.xKey][dataIndex]))
  //  .attr("x", d => plot.x.plot(d, dataIndex))
  // .attr("y", d => plot.y.plot(d, dataIndex))
  .attr("x", d => plot.zx(x.value(d, dataIndex)))
  .attr("y", d => plot.zy(y.value(d, dataIndex)))
  .attr("overflow", "visible")
  .attr("stroke", d => color(d.continent))
  .on('mouseover', function(d, i, arr, el) {
    d3.selectAll(".circle").attr("stroke", d => color(d.continent))
    d3.select(this).attr("stroke", "white")
    emit('setTooltip', d)
  })
  // .on('mouseout', function(d) {
  //   emit('clearTooltip')
  // })
  .style("overflow", "visible")

  const inner = circles.append("circle")
  .attr("r", d => radius(d['total_cases'][dataIndex]))
  .attr("fill", d => color(d.continent))
  //.attr("stroke", d => color(d.continent))
  .attr("stroke-width", 1)


  const text = circles.append("text").text(d => d.name).attr('x', 10).attr("opacity", 1).attr('fill', 'rgba(255, 255, 255, 0.5)')
  const cases = circles.append("text").text(d => plot.x.value(d, dataIndex)).attr('x', 10).attr('y', 15).attr('fill', 'rgba(255, 255, 255, 0.5)')
  //.attr('fill', d => color(d.continent))

  const toggleLabels = (isShowing) => {
  //  console.log('updating text', text)
    text.style('display', isShowing? 'block':'none')
    cases.style('display', isShowing? 'block':'none')
    //  text.attr('opacity', 0)
  }

  const update = (_dataIndex, _animationInterval = 500, _plot) => {
    plot = _plot
    dataIndex = _dataIndex
    animationInterval = _animationInterval
    const {x, y} = _plot

    circles
    .transition()
    .ease(d3.easeLinear)
    .duration(animationInterval)
    .attr("opacity", d => opacity(d['total_cases_per_million'][dataIndex]))
    .attr("x", d => plot.zx(x.value(d, dataIndex)))
    .attr("y", d => plot.zy(y.value(d, dataIndex)))

    // text.transition()
    // .ease(d3.easeLinear)
    // .duration(animationInterval)
    // .attr("opacity", d => d['dx'] > 0.1? 1: 0)
    //> 5 ? 1 : 0))

    inner.transition()
    .ease(d3.easeLinear)
    .duration(animationInterval)
    .attr("r", d => radius(d['total_cases'][dataIndex]))

    cases .text(d => `${Math.round(plot.x.value(d, dataIndex))} (+${Math.round(plot.y.value(d, dataIndex))})`)

    //.attr("stroke-width", d => 5*radius(d['total_cases'][dataIndex])/4)
    //  .attr("fill", d => d3.interpolateRdYlGn(1 - (d['dx'][dataIndex]/5 + 0.5)))
  }

  function zoomed() {
    emit('update zoom', d3.event.transform)
    gx.call(xAxis, plot.zx);
    gy.call(yAxis, plot.zy);
    update(dataIndex, animationInterval, plot)
  }

  function resize(_width, _height, _plot) {
    width = _width
    height = _height
    svg.attr("viewBox", [0, 0, width, height])
    .style('width', width)
    .style('height', height)

    outer.attr("viewBox", [0, 0, width, height])
    .style('width', width)
    .style('height', height)

    gy.call(yAxis, plot.zy)
    gx.call(xAxis, plot.zx)

    xLabel.attr("transform", `translate(${width},${height + 40})`)
      .text(`${plot.x.label} →`)

    yLabel.attr("transform", `translate(10,20)`)
        .text(`↑ ${plot.y.label}`)
  }

  outer.call(zoom).call(zoom.transform, startingTransform)

  const resetZoom = () => {
      outer.call(zoom).call(zoom.transform, startingTransform)
  }

  window.testZoom = (scale=1, x=0, y=0, x1=0, y1=0) => {
    outer.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(x*width, y*height).scale(scale).translate(x1*width, y1*height))
  }

  return {
    node: outer.node(),
    update: update,
    resize: resize,
    toggleLabels: toggleLabels,
    resetZoom: resetZoom
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
