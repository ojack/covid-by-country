const html = require('choo/html')
const devtools = require('choo-devtools')
const choo = require('choo')
const dataStore = require('./app/data-store.js')
const layoutStore = require('./app/layout-store.js')

//const Scatterplot = require('./scatter-plot.js')
const Scatterplot = require('./app/scatter-plot.js')
const tooltip = require('./app/tooltip.js')
const Canvas = require('./app/canvas-renderer.js')
const controls = require('./app/control-panel.js')

const app = choo()
app.use(devtools())
app.use(dataStore)
app.use(layoutStore)
app.route('/', mainView)
app.mount('body')


const panel = (state, emit) => state.layout.panel.isOpen ? html`<div class="flex flex-column pa4 bl" style="width:${state.layout.panel.width}px;border-color:gray">
  ${controls(state.plotSettings, emit)}
</div>` : ''



//  ${state.cache(Scatterplot, 'scatterplot').render(state)}
function mainView (state, emit) {
  const graph = state.layout.graph
  const width = graph.width + graph.margin.left + graph.margin.right
  const height = graph.height + graph.margin.top + graph.margin.bottom

  const graphContainer = (contents) => html`<div class="absolute top-0 left-0" style="left:${graph.margin.left}px;top:${graph.margin.top}px;cursor:crosshair">
    ${contents}
  </div>`

  return html`
  <body class="w-100 h-100 mw-100 avenir bg-dark-gray near-white">
    <div class="flex flex-row h-100">


      <div class="flex-auto relative">

        <div class="relative" style="width:${width}px;height:${height}px">
          ${graphContainer(state.cache(Canvas, 'canvas-base').render({
          dimensions: graph, dateIndex: state.dateIndex, plot: state.plot, tooltip: state.tooltip, plotSettings: state.plotSettings }))}
          ${graphContainer(state.cache(Scatterplot, 'scatterplot').render({
            dimensions: graph, dateIndex: state.dateIndex, plot: state.plot, plotSettings: state.plotSettings }))}
            <i class="fas fa-cogs dim absolute top-0 right-0 pointer pa2" title="show settings" onclick=${()=>emit('togglePanel')}></i>

          <div class="absolute bottom-0 w-100 pa4 ml2" style="height:${graph.margin.bottom}px">
            <div class=" pt4 flex items-center">
              <div class="mr2 tc w3 pointer ba dim pa2" onclick=${() => emit('togglePlay')}>${state.isPlaying ? 'Pause': 'Play'}</div>
              <input class="flex-auto" oninput=${(e)=>emit('setDate', parseFloat(e.target.value))} type="range" id="date" name="date" min="0" max=${state.data.dates.length-2} value=${state.dateIndex}>
              <div class="mr2 pa2">${state.data.dates[state.dateIndex]}</div>
            </div>
            <div class="f4 mv2 pt3"> COVID-19 cases by country</div>
            <div class="f6 absolute bottom-0 pb2 gray">*Data from <a class="gray dim" href="https://github.com/owid/covid-19-data/tree/master/public/data">Our World In Data </a>, last updated ${state.data.dates[state.data.dates.length-1]} </div>
          </div>
        </div>
        ${tooltip(state, emit)}
      </div>
      ${panel(state, emit)}
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
