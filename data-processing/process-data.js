//const filepath = "https://covid.ourworldindata.org/data/owid-covid-data.csv"

const timeseries = require('./create-timeseries.js')
const fs = require('fs')
const csv = require('csv')
//const parse = require('csv-parse/lib/sync')

// const https = require("https");


const localDataPath = __dirname + '/owid-covid-data.csv'

// write to file
// const file = fs.createWriteStream(localDataPath)
// https.get(filepath, response => {
//   response.pipe(file)
// });

const countries = {}

const datesObj = {}

const processDataPoint = (entry) => {
  if(!countries[entry['iso_code']]) {
    countries[entry['iso_code']] = {
      continent: entry.continent,
      location: entry.location,
      population: parseFloat(entry.population),
      population_density: parseFloat(entry.population_density),
      data: []
    }
  }
  countries[entry['iso_code']].data.push(entry)
  datesObj[entry.date] = 1
}


fs.createReadStream(localDataPath)
.on('error', () => {
    // handle error
})

.pipe(csv.parse({
   columns: true,
   // to_line: 60
}))
.on('data', (row) => {
  processDataPoint(row)
    // use row data
    //console.log(row)
//    processRow(row)
})

.on('end', () => {
  console.log(countries)
  const dates = Object.keys(datesObj)
  console.log(dates)
  const countriesJSON = timeseries(countries, dates)
//  console.log(countriesJSON)
  const processed = JSON.stringify({ dates: dates, countries: countriesJSON}, null, 0)
    fs.writeFileSync( __dirname + '/covid-cases-processed.json', processed)
//  const processed = JSON.stringify(datesToArrays(), null, 0)
//const processed = JSON.stringify(countries, null, 0)
//  convertDatesToArrays()
//  fs.writeFileSync('./covid-cases.json', processed)
    // handle end of CSV
  //  console.log(data)
  //  createCSV(columns, trips)
})
