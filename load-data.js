const csv = require('csv-parse')
const resl = require('resl')

const cases = require('./data/data-processing/covid-cases.json')

// const parse = (data) => {
//   //console.log(data.cases)
//   csv(data.cases, { columns: false }, (err, parsed) => {
//     console.log(parsed)
//   })
// }

module.exports = () => {
  console.log(cases)
  const casesByDate = cases.dates.map((date, index) => {
    
  })
  // resl({
  //   manifest: {
  //     'cases': {
  //       type: 'text',
  //       src: 'data/owid-covid-data.csv',
  //     }
  //   },
  //   onDone: parse,
  //   onError: (err) => {
  //     console.log(err)
  //   }
  // })
}
