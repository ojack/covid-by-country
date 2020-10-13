const html = require('choo/html')
const devtools = require('choo-devtools')
const choo = require('choo')
const dataStore = require('./data-store.js')
//const Scatterplot = require('./scatter-plot.js')
const Scatterplot = require('./scatter-plot.js')
const tooltip = require('./tooltip.js')
const Canvas = require('./canvas-renderer.js')
const controls = require('./control-panel.js')

const app = choo()
app.use(devtools())
app.use(dataStore)
app.route('/', mainView)
app.mount('body')



//  ${state.cache(Scatterplot, 'scatterplot').render(state)}
function mainView (state, emit) {
  const graph = state.layout.graph
  const width = graph.width + graph.margin.left + graph.margin.right
  const height = graph.height + graph.margin.top + graph.margin.bottom

  const graphContainer = (contents) => html`<div class="absolute top-0 left-0" style="left:${graph.margin.left}px;top:${graph.margin.top}px">
    ${contents}
  </div>`

  return html`
  <body class="w-100 h-100 mw-100 avenir bg-dark-gray near-white">
    <div class="flex flex-row-reverse h-100">
      <div class="flex-auto pa2">
        <div class="relative" style="width:${width}px;height:${height}px">
          ${graphContainer(state.cache(Canvas, 'canvas-base').render({
          dimensions: graph, dateIndex: state.dateIndex, plot: state.plot, tooltip: state.tooltip, plotSettings: state.plotSettings }))}
          ${graphContainer(state.cache(Scatterplot, 'scatterplot').render({
            dimensions: graph, dateIndex: state.dateIndex, plot: state.plot, plotSettings: state.plotSettings }))}
          <div class="pa2 pb4 flex items-center absolute bottom-0 w-100">
            <div class="mr2 tc w3 pointer ba dim pa2" onclick=${() => emit('togglePlay')}>${state.isPlaying ? 'Pause': 'Play'}</div>
            <input class="flex-auto" oninput=${(e)=>emit('setDate', parseFloat(e.target.value))} type="range" id="date" name="date" min="0" max=${state.data.dates.length-3} value=${state.dateIndex}>
            <div class="mr2 pa2">${state.data.dates[state.dateIndex]}</div>
          </div>
        </div>
        ${tooltip(state, emit)}
      </div>
      <div class="flex flex-column pa4 br" style="width:${state.layout.panel.width}px;border-color:gray">
        <div class="f4 mv1"> COVID-19 cases per 100,000 people</div>
        ${controls(state.plotSettings, emit)}
        <!-- <div class="mv1 flex items-center">
        <div class="mr2 tc w3 pointer ba dim pa2" onclick=${() => emit('togglePlay')}>${state.isPlaying ? 'Pause': 'Play'}</div>
        <input oninput=${(e)=>emit('setDate', parseFloat(e.target.value))} type="range" id="date" name="date" min="0" max=${state.data.dates.length-3} value=${state.dateIndex}>
        <div class="mr2 pa2">${state.data.dates[state.dateIndex]}</div>
        </div> -->
      </div>
    </div>
  </body>
  `
    }

    const insertCss = require('insert-css')

    //const data = require('./data-processing/covid-cases-processed.json')
    // const graph = require('./animated-graph.js')({
    //   data: data,
    //   margin: margin,
    //   width: 1000,
    //   height: 800
    // })

    const style = insertCss(`
      /*html, body {
        background: #242323;
        color: white;
        display: flex;
        justify-content: center;
        height: 100%;
        align-items: center;
      }*/

      html {
        height: 100%;
      }

      svg {
      /*  overflow: visible; */
      }

      text {
        stroke: none;
      /*  font-family: monospace;*/
      }
      `)

      // document.body.appendChild(graph.node)
