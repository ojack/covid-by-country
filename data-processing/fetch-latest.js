const filepath = "https://covid.ourworldindata.org/data/owid-covid-data.csv"
const fs = require('fs')
const https = require("https");

const localDataPath = __dirname + '/owid-covid-data.csv'

// write to file
const file = fs.createWriteStream(localDataPath)
https.get(filepath, response => {
  response.pipe(file)
});
