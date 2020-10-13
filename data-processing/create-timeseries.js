module.exports = (data, _dates) => {
  const dates = _dates.sort()
  console.log(dates)

  const timeSeries = (prop, casesByDate) => dates.map((date) => {
    const val = casesByDate[date] ? (casesByDate[date][prop] ? casesByDate[date][prop] : null): null
    if(val=== undefined) console.log('undef!', date, casesByDate[date])
    return val
  })

  // filling holes, extrapolateValues = true => [null, 1, 5, null, null, 8, 9, null] => [ 0, 1, 5, 6, 7, 8, 9, 9]
  // filling holes, extrapolateValues = false => [null, 1, 5, null, null, 8, 9, null] => [ 0, 1, 5, 0, 0, 8, 9, 9]
  const fillHoles = (_series, extrapolateValues = false) => {
    const series = [..._series]
    let prevValue = null
    let prevIndex = 0
    //  if(series[i]== undefined) console.log('undefined!', series, i)
    for(var i = 0; i < series.length; i++) {
      if(series[i] === null) {
        // if first in series, set to 0
        if(prevValue === null || !extrapolateValues) {
        //  console.log('setting to zero')
          series[i] = 0
        // interpolate data to array
        } else {
          let nextValue = null
          let nextIndex = i
          for(var j = i; j < series.length; j ++) {
            if(series[j] !== null) {
              nextValue = parseFloat(series[j])
              nextIndex = j
              break
            }
          }
          // if no more non-null values, assign to last number
          if(nextValue === null) {
            series[i] = parseFloat(prevValue)
          } else {
            const inc = (nextValue - prevValue) / (nextIndex - prevIndex)
            const newVal = parseFloat(prevValue) + inc * (i - prevIndex)
        //    console.log(newVal, prevValue, prevIndex, i)
            series[i] = parseFloat(newVal.toFixed(3))
          }
        }
      } else {
        prevValue = parseFloat(series[i])
        prevIndex = i
        series[i] = parseFloat(series[i])
      }

    }
    if(series.indexOf(null) >= 0) console.log('NULL', series)
    return series
  }

  const rollingAvg = (series, interval = 7) => {
    const h = Math.floor(interval/2)
    return series.map((val, i, a) => {
      if(i >= h && i < series.length - h) {
        const arr = a.slice(i - h, i + h + 1)
        const avg = arr.reduce((p, c) => p + c, 0) / arr.length
      //  console.log(arr, avg)
        return parseFloat(avg.toFixed(3))
      }
      return null
    })
  }

  // calculate number of cases in the last 7 days for each day
  const sevenDayIncidence = (series, interval = 7) => {
    return series.map((val, i, a) => {
      if(i >= interval) {
        const arr = a.slice(i - interval, i + 1)
        const sum = arr.reduce((p, c) => p + c, 0)
        // arr.length
      //  console.log(arr, avg)
        return parseFloat(sum.toFixed(3))
      }
      return null
    })
  }

  return Object.entries(data).map(([key, obj]) => {
    const countryObj = {
      iso: key,
      continent: obj.continent,
      population: obj.population,
      name: obj.location,
      "population_density": obj["population_density"]
    }

    const casesByDate = {}
    obj.data.forEach((dataObj) => { casesByDate[dataObj.date] = dataObj})

    //console.log(obj.location)
    countryObj['total_cases'] = fillHoles(timeSeries('total_cases', casesByDate), true)
    countryObj['total_cases_per_million'] = fillHoles(timeSeries('total_cases_per_million', casesByDate), true)
    countryObj['new_cases_per_million'] = fillHoles(timeSeries('new_cases_per_million', casesByDate), false)
    countryObj['7_day_incidence_per_million'] = sevenDayIncidence(countryObj['new_cases_per_million'], 7)
  //  countryObj['new_cases_smoothed'] = rollingAvg(countryObj['new_cases_per_million'], 7)
    countryObj['new_cases_smoothed_per_million'] = fillHoles(timeSeries('new_cases_smoothed_per_million', casesByDate), false)
    if(countryObj['new_cases_per_million'].indexOf(null) >= 0) console.log('NULL', countryObj['new_cases_per_million'])
    return countryObj
  })
}
