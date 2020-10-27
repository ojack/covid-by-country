const d3 = require('d3')

module.exports = (data) => {
  // filter data by countries with population over 10000
  const countries = data.countries.filter((d) => d.population > 1000000).filter((d) => d.name !== "World")
      .sort((a, b) => d3.descending(a.population, b.population))

  // change in 7-day incidence per day
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

  // Percent change in the number of newly confirmed cases per million in past seven days, compared to seven days prior.
  // change in 7-day incidence per day
  // calculated similarly to: https://www.who.int/docs/default-source/coronaviruse/situation-reports/20201012-weekly-epi-update-9.pdf
  countries.forEach((country, i) => {
  //  d.color = d3.hsl(355*i/countries.length, 0.9, 0.3)
    const dx2 = []
    const dx2percent = []
  //  dx2.push(0)
    const newCases = country['7_day_incidence_per_million']
    newCases.forEach((dailyNew, i) => {
      if(i > 14) {
        const prevCases = newCases[i-7]
        if(prevCases === 0) {
            dx2.push(0)
            dx2percent.push(0)
        } else {
          const change = dailyNew - newCases[i-7]
          //const percentChange = change/Math.abs(newCases[i-7])
          const percentChange = change/Math.abs(newCases[i-7])
          dx2.push(change)
          dx2percent.push(percentChange)
        //  console.log(dailyNew, newCases[i-7], percentChange)
        }
      } else {
        dx2.push(0)
        dx2percent.push(0)
      }
    })
    country.dx2 = dx2
    country.dx2percent = dx2percent
  })

  console.log('COUNTRIES', countries)

  // calculate daily and overall maximum
  const keys = ['total_cases', 'new_cases_smoothed_per_million', 'total_cases_per_million', '7_day_incidence_per_million', 'dx2', 'dx2percent']
  const extent = {}

  keys.forEach((key) => {
    extent[key] = [1000, 0] // default 'min' and 'max' values to compare ro
  })

  //const dailyExtentObj = data.dates.map((date, dateIndex) => {
    const dailyExtentObj = {}
    Object.keys(extent).forEach((key) => {
      const extentByDay = data.dates.map((date, dateIndex) => {
        const dailyExtent = [1000, 0]
        Object.values(countries).forEach((country) => {
          if(country[key][dateIndex] > dailyExtent[1]){
            // update daily max
            dailyExtent[1] = country[key][dateIndex]
            if(country[key][dateIndex] > extent[key][1]){
              extent[key][1] = country[key][dateIndex]
            }
          }
          if(country[key][dateIndex] < dailyExtent[0]){
            // update daily min
            dailyExtent[0] = country[key][dateIndex]
            if(country[key][dateIndex] < extent[key][0]){
              extent[key][0] = country[key][dateIndex]
            }
          }
        })
        return dailyExtent
      })
      dailyExtentObj[key] = extentByDay
    })


    // Object.values(countries).forEach((country) => {
    //   Object.keys(extent).forEach((key) => {
    //     // if max is greater than this mac
    //     if(country[key][dateIndex] > dailyExtent[1]){
    //       // update daily max
    //       dailyExtent[key][1] = country[key][dateIndex]
    //       if(country[key][dateIndex] > extent[key][1]){
    //         extent[key][1] = country[key][dateIndex]
    //       }
    //     }
    //     if(country[key][dateIndex] < dailyExtent[key][0]){
    //       // update daily min
    //       dailyExtent[key][0] = country[key][dateIndex]
    //       if(country[key][dateIndex] < extent[key][0]){
    //         extent[key][0] = country[key][dateIndex]
    //       }
    //     }
    //   })
    // })
  //  return dailyExtent
//  })

  let minRange = {'new_cases_smoothed_per_million': 10,    'total_cases_per_million': 6}

//  const MAX_Y = 450
  // let dx = minRange['new_cases_smoothed_per_million']
  // let y = minRange[ 'total_cases_per_million']
  // filter max values so that there is a minimum value, and the axes are always increasing
//   const maxPerDay = dailyMax.map((daily) => {
//     const newDaily = daily
//     if(daily['new_cases_smoothed_per_million'] < minRange['new_cases_smoothed_per_million']) {
//       newDaily['new_cases_smoothed_per_million'] = minRange['new_cases_smoothed_per_million']
//     }
//     if(daily['total_cases_per_million'] < minRange['total_cases_per_million']) {
//       newDaily['total_cases_per_million'] = minRange['total_cases_per_million']
//     }
//     minRange = Object.assign({}, newDaily)
// //    if(newDaily['new_cases_smoothed_per_million'] > MAX_Y) newDaily['new_cases_smoothed_per_million'] = MAX_Y
//     return newDaily
//   })
 console.log(dailyExtentObj)

  return {
    countries: countries,
    dailyExtent: dailyExtentObj,
    dates: data.dates,
    extent: extent
  }

}
