const fs = require('fs')
const csv = require('csv')
// const writeStream = fs.createWriteStream('trips-states-columns.csv')
// const _idLookup = require('./../data/stateid_nuts.json')

// const idLookup = {}
// _idLookup.forEach((obj) => idLookup[obj.stateid] = obj.geo_id.slice(0, 3)) // lookup table to get nuts 3 id from state id
// // seems that id lookup is missing 11, or berlin, so add that here
// idLookup[11] = 'DE3'
//
// // writeStream.write(`aef35ghhjdk74hja83ksnfjk888sfsf\nsdkfjlkj`);

// the finish event is emitted when all data has been flushed from the stream
// writeStream.on('finish', () => {
//     console.log('wrote all data to file');
// });

// close the stream
//writeStream.end();

// var stringifier = csv.stringify()
const filepath =  './../owid-covid-data.csv'

const countries = {}
const dates = {}
const processRow = (data) => {
  if(data[0].length > 0) {
    if(!countries[data[0]]) countries[data[0]] = {
      name: data[2],
      iso: data[0],
      continent: data[1],
      population: parseFloat(data[20]),
      cases: {}
    }
    dates[data[3]] = 1
    countries[data[0]].cases[data[3]] = parseFloat(data[4])
  }

//  countries[data[1]]
//  console.log(data)
}

const datesToArrays = () => {
  const dateArray = Object.keys(dates)
  console.log(dateArray)
  const countryArray = Object.values(countries).map((country) => {
    const countryCasesByDate = dateArray.map((date) => country.cases[date] ? country.cases[date] : 0)
    return Object.assign({}, country, { cases: countryCasesByDate})
  })
  return {
    dates: dateArray,
    countries: countryArray
  }
}

fs.createReadStream(filepath)
    .on('error', () => {
        // handle error
    })

    .pipe(csv.parse({
       from_line: 2
    }))
    .on('data', (row) => {
        // use row data
      //  console.log(row)
        processRow(row)
    })

    .on('end', () => {
      const processed = JSON.stringify(datesToArrays(), null, 0)
  //const processed = JSON.stringify(countries, null, 0)
    //  convertDatesToArrays()
      fs.writeFileSync('./covid-cases.json', processed)
        // handle end of CSV
      //  console.log(data)
      //  createCSV(columns, trips)
    })

// const trips = {}
//
// // object containing column headins to includ
// const columns = {}
// // columns['src_stateid'] = 1
// // columns['trg_stateid'] = 1

// const processRow = (row) => {
//   if(!trips[row[1]]) trips[row[1]] = {}
//   if(!trips[row[1]][row[2]]) trips[row[1]][row[2]] = {}
//   trips[row[1]][row[2]][row[0]] = row[3]
//   columns[row[0]] = 1 // add date to column heading
// }
//
// const createCSV = (colHeadings, data) => {
//   const header = ['src_stateid', 'trg_stateid'].concat(Object.keys(colHeadings).sort())
//   writeStream.write(header.join(','))
//   writeStream.write('\n')
//   Object.entries(data).forEach(([src, destObj]) => {
//     Object.entries(destObj).forEach(([dest, datesObj]) => {
//       const dateCount = Object.keys(colHeadings).map((date) => datesObj[date] ? datesObj[date] : 0) // counts at each date
//       // const row = [idLookup[src], idLookup[dest]].concat(dateCount)
//       if(src !== dest) {
//         const row = [src, dest].concat(dateCount)
//
//         writeStream.write(row.join(','))
//         writeStream.write('\n')
//       }
//       // console.log('date', date)
//     })
//   })
//   writeStream.end()
// }
//
// // generate file where each column is a different date, each row is a start and end location
//
//
//
//
// //
// // const assert = require('assert')
// // const output = []
// // // Create the parser
// // const parser = parse({
// //   delimiter: ':'
// // })
// // // Use the readable stream api
// // parser.on('readable', function(){
// //   let record
// //   while (record = parser.read()) {
// //     output.push(record)
// //   }
// // })
// // // Catch any error
// // parser.on('error', function(err){
// //   console.error(err.message)
// // })
// // // When we are done, test that the parsed output matched what expected
// // parser.on('end', function(){
// //   assert.deepEqual(
// //     output,
// //     [
// //       [ 'root','x','0','0','root','/root','/bin/bash' ],
// //       [ 'someone','x','1022','1022','','/home/someone','/bin/bash' ]
// //     ]
// //   )
// // })
// // // Write data to the stream
// // parser.write("root:x:0:0:root:/root:/bin/bash\n")
// // parser.write("someone:x:1022:1022::/home/someone:/bin/bash\n")
// // // Close the readable stream
// // parser.end()
