var html = require('choo/html')
var devtools = require('choo-devtools')
var choo = require('choo')
const Plot = require('./bubble-plot.js')
const cases = require('./covid-cases.js')()
const ranking = require('./ranking.js')

var app = choo()
app.use(devtools())
app.use(nodesStore)
app.route('/', mainView)
app.mount('body')


function mainView (state, emit) {
  const info = (node) => html`
    <h3>${node.name}</h3>
    <p> ${Math.round(100 * 1000000 * node.cases[state.dateIndex]/node.population)/100} cases per million people</p>
  `
    // ${ranking(state, emit)}
  return html`
    <body class="w-100 h-100 courier ">
      ${ranking(state, emit)}
      <div class="fixed bottom-0 right-0 w-6 pa4 tr">
        ${state.detail !== null ? info(state.detail) : ''}
          <div>${state.dateArray[state.dateIndex]}</div>
      </div>
       ${state.cache(Plot, 'bubble-plot', {
         nodes: cases.nodes,
         mouseover: (d) => {emit('showDetail', d)},
         mouseout: () => {emit('hideDetail')},
         color: cases.color,
         radius: cases.radius,
         forceStrength: cases.forceStrength
       }).render({
        dateIndex: state.dateIndex
       })}
    </body>
  `

  function onclick () {
    emit('increment', 1)
  }
}

function nodesStore (state, emitter) {
  state.dateIndex = 0
  state.dateArray = cases.dateArray
  state.detail = null
  state.rankings = cases.incidenceArrays

const updateDate = () => {
  state.dateIndex ++
  if (state.dateIndex >= state.dateArray.length) state.dateIndex = 0
  emitter.emit('render')
}
  emitter.on('showDetail', (node) => {
    state.detail = node
    emitter.emit('render')
    // state.count += count
    // emitter.emit('render')
  })

  emitter.on('hideDetail', (node) => {
    // state.detail = null
    // emitter.emit('render')
    // state.count += count
    // emitter.emit('render')
  })

  setInterval(() => {
    updateDate()
  }, 400)
}
