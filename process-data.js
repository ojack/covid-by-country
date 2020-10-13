const d3 = require('d3')

module.exports = (data) => {
  // filter data by countries with population over 10000
  const countries = data.countries.filter((d) => d.population > 1000000).filter((d) => d.name !== "World")
      .sort((a, b) => d3.descending(a.population, b.population))

  countries.forEach((country, i) => {
  //  d.color = d3.hsl(355*i/countries.length, 0.9, 0.3)
    const dx = []
    dx.push(0)
    const newCases = country['7_day_incidence_per_million']
    newCases.forEach((dailyNew, i) => {
      if(i !== 0) {
        const change = dailyNew - newCases[i-1]
        dx.push(change)
      }
    })
    country.dx = dx
  })

  console.log('COUNTRIES', countries)

  // calculate daily and overall maximum
  const max = {
    'total_cases': 0,
    'new_cases_smoothed_per_million': 0,
    'total_cases_per_million': 0,
    '7_day_incidence_per_million': 0
  }
  const dailyMax = data.dates.map((date, dateIndex) => {
    const dailyMax = {}
    Object.keys(max).forEach((key) => { dailyMax[key] = 0})
    Object.values(countries).forEach((country) => {
      Object.keys(max).forEach((key) => {
        if(country[key][dateIndex] > dailyMax[key]){
          dailyMax[key] = country[key][dateIndex]
          if(country[key][dateIndex] > max[key]){
            max[key] = country[key][dateIndex]
          //  console.log(country.name, key, country[key][dateIndex], dateIndex)
          }
        }
      })
    })
    return dailyMax
  })

  let minRange = {'new_cases_smoothed_per_million': 10,    'total_cases_per_million': 6}

//  const MAX_Y = 450
  // let dx = minRange['new_cases_smoothed_per_million']
  // let y = minRange[ 'total_cases_per_million']
  // filter max values so that there is a minimum value, and the axes are always increasing
  const maxPerDay = dailyMax.map((daily) => {
    const newDaily = daily
    if(daily['new_cases_smoothed_per_million'] < minRange['new_cases_smoothed_per_million']) {
      newDaily['new_cases_smoothed_per_million'] = minRange['new_cases_smoothed_per_million']
    }
    if(daily['total_cases_per_million'] < minRange['total_cases_per_million']) {
      newDaily['total_cases_per_million'] = minRange['total_cases_per_million']
    }
    minRange = Object.assign({}, newDaily)
//    if(newDaily['new_cases_smoothed_per_million'] > MAX_Y) newDaily['new_cases_smoothed_per_million'] = MAX_Y
    return newDaily
  })

  return {
    countries: countries,
    maxPerDay: maxPerDay,
    dates: data.dates,
    max: max
  }

}
