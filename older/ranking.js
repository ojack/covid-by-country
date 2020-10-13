const html = require('choo/html')

module.exports = (state, emit) => {
//  console.log(state)
  const top = state.rankings[state.dateIndex].slice(0, 12).filter((d) => d.incidence > 0.01)
  return html`<div id="ranking list" class="fixed top-0 right-0 ma4 w5">
    ${top.map((country, i) => html`<div id="rank-${country.name}" class="flex pa2 absolute right-0 w5" style="top:${i*40}px;background-color:${country.color};transition: top 0.5s" >
      <div class="tl w4">${country.name}</div><div> ${Math.round(100*country.incidence)/100}</div>
      </div>
    `)}
  </div>`
}
