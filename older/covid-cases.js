const csv = require('csv-parse')
const resl = require('resl')
const d3 = require('d3')


const cases = require('./data/data-processing/covid-cases.json')

// const parse = (data) => {
//   //console.log(data.cases)
//   csv(data.cases, { columns: false }, (err, parsed) => {
//     console.log(parsed)
//   })
// }

module.exports = (state) => {
  const radiusMult = 4000


  const nodes = cases.countries
    .filter((country) => country.id != "OWID_WRL")
    .filter((country) => country.name != "World")
    .filter((country) => country.population > 1000000)
    .map((country) => ({
      id: country.iso,
      name: country.name,
      cases: country.cases,
      continent: country.continent,
      population: country.population,
    }))



//  console.log(incidenceByDay)

  nodes.sort(function (a, b) { return b.cases[200]/b.population - a.cases[200]/a.population; });

  console.log('nodes', nodes)

  const continents = ['Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania']
  const color = (d) => {
    const i = continents.indexOf(d.continent)
  //  if(i >= 0) return d3.interpolateTurbo(i/continents.length)
      if(i >= 0) return d3.schemeSet2[i]
    //console.log(d)
    return 'blue'
  }

  const incidenceByDay = cases.dates
    .map((date, i) => Object.values(nodes).map((country) => ({
          name: country.name,
          color: color(country),
          incidence: 1000000 * country.cases[i]/country.population
        }))
      .sort((a, b) => b.incidence - a.incidence))

  const radiusScale = d3.scaleSqrt().domain([0, 0.1]).range([0, 200])

  const radius = (margin=0, dateIndex = 0) => (d) => {
    const cases = d.cases[dateIndex]
    if(cases < 1) return 0
  //  return margin + radiusMult* d.cases[dateIndex]/d.population
    return margin + radiusScale(d.cases[dateIndex]/d.population)
  }

  return {
    nodes: nodes,
    color: color,
    radius: radius,
  //  forceStrength: (dateIndex = 0) => (d) => 0.003 + 15 * d.cases[dateIndex]/d.population,
    forceStrength: (dateIndex = 0) => (d) => 0.03 + 0.001* radiusScale(d.cases[dateIndex]/d.population),
    dateArray: cases.dates,
    incidenceArrays: incidenceByDay
  }
}
