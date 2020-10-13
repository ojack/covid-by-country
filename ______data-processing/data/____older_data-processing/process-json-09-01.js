// read in file from owid and extract usable information.
// resulting data structure is an array with each country as an entry,
// https://github.com/owid/covid-19-data

const fs = require('fs')
const csv = require('csv')


// var stringifier = csv.stringify()
const data =  require('./09_01/owid-covid-data.json')
//console.log(data)

const datesObj = {}
Object.values(data).forEach((country) => country.data.forEach((data) => datesObj[data.date] = 1))

const dates = Object.keys(datesObj)
//console.log(dates)


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
            nextValue = series[j]
            nextIndex = j
            break
          }
        }
        // if no more non-null values, assign to last number
        if(nextValue === null) {
          series[i] = prevValue
        } else {
          const inc = (nextValue - prevValue) / (nextIndex - prevIndex)
          const newVal = prevValue + inc * (i - prevIndex)
          series[i] = parseFloat(newVal.toFixed(3))
        }
      }
    } else {
      prevValue = series[i]
      prevIndex = i
    }
  }
  if(series.indexOf(null) >= 0) console.log('NULL', series)
  return series
}

const arr = [null, null, 1, 5, null, null, 2, 9, null, null]

const testArr = fillHoles(arr)
console.log(testArr)

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

// const a = rollingAvg([ 0, 1, 2, 4, 9, 2, 9, 100, 2 , 8, 23, 20], 7)
//
// console.log(a)

const countries = Object.entries(data).map(([key, obj]) => {
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
  countryObj['new_cases_smoothed'] = rollingAvg(countryObj['new_cases_per_million'], 7)

  if(countryObj['new_cases_per_million'].indexOf(null) >= 0) console.log('NULL', countryObj['new_cases_per_million'])
  return countryObj
})

//console.log(countries)

const processed = JSON.stringify({ dates: dates, countries: countries}, null, 3)
//const test = countries[0]['new_cases_per_million']
//console.log(test)
const country = JSON.stringify(countries[0])
//const processed = JSON.stringify({ dates: dates, countries: countries}, null, 3)
//   //const processed = JSON.stringify(countries, null, 0)
//     //  convertDatesToArrays()
      fs.writeFileSync('./covid-cases-09-01-a.json', processed)
      //  fs.writeFileSync('./covid-cases-09-01.json', country)
        // handle end of CSV
      //  console.log(data)
      //  createCSV(columns, trips)
  //  })

//
// const countries = {}
// const dates = {}
// const processRow = (data) => {
//   if(data[0].length > 0) {
//     if(!countries[data[0]]) countries[data[0]] = {
//       name: data[2],
//       iso: data[0],
//       continent: data[1],
//       population: parseFloat(data[20]),
//       cases: {}
//     }
//     dates[data[3]] = 1
//     countries[data[0]].cases[data[3]] = parseFloat(data[4])
//   }
//
// //  countries[data[1]]
// //  console.log(data)
// }
//
// const datesToArrays = () => {
//   const dateArray = Object.keys(dates)
//   console.log(dateArray)
//   const countryArray = Object.values(countries).map((country) => {
//     const countryCasesByDate = dateArray.map((date) => country.cases[date] ? country.cases[date] : 0)
//     return Object.assign({}, country, { cases: countryCasesByDate})
//   })
//   return {
//     dates: dateArray,
//     countries: countryArray
//   }
// }
//
// fs.createReadStream(filepath)
//     .on('error', () => {
//         // handle error
//     })
//
//     .pipe(csv.parse({
//        from_line: 2
//     }))
//     .on('data', (row) => {
//         // use row data
//       //  console.log(row)
//         processRow(row)
//     })
//
//     .on('end', () => {
//       const processed = JSON.stringify(datesToArrays(), null, 0)
//   //const processed = JSON.stringify(countries, null, 0)
//     //  convertDatesToArrays()
//       fs.writeFileSync('./covid-cases.json', processed)
//         // handle end of CSV
//       //  console.log(data)
//       //  createCSV(columns, trips)
//     })
