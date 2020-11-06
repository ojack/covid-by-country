const html = require('choo/html')

module.exports = (state, emit) => {
  if(state.tooltip.content!==null) {
    const t = state.tooltip.content
    const point = state.tooltip.point
    const yOff = point[1] > 300 ? point[1] - 200 : point[1] + 100
    const xOff = point[0] > window.innerWidth - 300 ? window.innerWidth - 300: point[0]
    const {x, y} = state.plot
    return html`<div class="absolute pa2 f6 w5" style="top:${yOff}px;left:${xOff}px;pointer-events:none;background:rgba(100, 100, 100, 0.9);transition:top 0.4s, left 0.4s">
      <div class="flex justify-between"><span>${t.name} </span><span class="f7">${state.data.dates[state.dateIndex]}</span></div>
      <div>${Math.round(y.value(t, state.dateIndex)*10)/10} ${y.label}</div>
      <div>${Math.round(x.value(t, state.dateIndex)*10)/10} ${x.label}</div>
    </div>`
  } else {
    return ''
  }
}
