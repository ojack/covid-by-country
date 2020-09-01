const fs = require('fs')
const csv = require('csv')
const writeStream = fs.createWriteStream('trips-states-columns.csv')
const _idLookup = require('./../data/stateid_nuts.json')

const idLookup = {}
_idLookup.forEach((obj) => idLookup[obj.stateid] = obj.geo_id.slice(0, 3)) // lookup table to get nuts 3 id from state id
// seems that id lookup is missing 11, or berlin, so add that here
idLookup[11] = 'DE3'

// writeStream.write(`aef35ghhjdk74hja83ksnfjk888sfsf\nsdkfjlkj`);

// the finish event is emitted when all data has been flushed from the stream
writeStream.on('finish', () => {
    console.log('wrote all data to file');
});

// close the stream
//writeStream.end();

// var stringifier = csv.stringify()
const filepath =  './../data/trips-states.csv'

const trips = {}

// object containing column headins to includ
const columns = {}
// columns['src_stateid'] = 1
// columns['trg_stateid'] = 1

const processRow = (row) => {
  if(!trips[row[1]]) trips[row[1]] = {}
  if(!trips[row[1]][row[2]]) trips[row[1]][row[2]] = {}
  trips[row[1]][row[2]][row[0]] = row[3]
  columns[row[0]] = 1 // add date to column heading
}

const createCSV = (colHeadings, data) => {
  const header = ['src_stateid', 'trg_stateid'].concat(Object.keys(colHeadings).sort())
  writeStream.write(header.join(','))
  writeStream.write('\n')
  Object.entries(data).forEach(([src, destObj]) => {
    Object.entries(destObj).forEach(([dest, datesObj]) => {
      const dateCount = Object.keys(colHeadings).map((date) => datesObj[date] ? datesObj[date] : 0) // counts at each date
      // const row = [idLookup[src], idLookup[dest]].concat(dateCount)
      if(src !== dest) {
        const row = [src, dest].concat(dateCount)

        writeStream.write(row.join(','))
        writeStream.write('\n')
      }
      // console.log('date', date)
    })
  })
  writeStream.end()
}

// generate file where each column is a different date, each row is a start and end location

fs.createReadStream(filepath)
    .on('error', () => {
        // handle error
    })

    .pipe(csv.parse({ from_line: 2}))
    .on('data', (row) => {
        // use row data
      //  console.log(row)
        processRow(row)
    })

    .on('end', () => {
        // handle end of CSV
        console.log(columns)
        createCSV(columns, trips)
    })


//
// const assert = require('assert')
// const output = []
// // Create the parser
// const parser = parse({
//   delimiter: ':'
// })
// // Use the readable stream api
// parser.on('readable', function(){
//   let record
//   while (record = parser.read()) {
//     output.push(record)
//   }
// })
// // Catch any error
// parser.on('error', function(err){
//   console.error(err.message)
// })
// // When we are done, test that the parsed output matched what expected
// parser.on('end', function(){
//   assert.deepEqual(
//     output,
//     [
//       [ 'root','x','0','0','root','/root','/bin/bash' ],
//       [ 'someone','x','1022','1022','','/home/someone','/bin/bash' ]
//     ]
//   )
// })
// // Write data to the stream
// parser.write("root:x:0:0:root:/root:/bin/bash\n")
// parser.write("someone:x:1022:1022::/home/someone:/bin/bash\n")
// // Close the readable stream
// parser.end()
