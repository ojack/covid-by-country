const html = require('choo/html')

module.exports = (state, emit) => {
  if(state.tooltip.content!==null) {
    const t = state.tooltip.content
    const {x, y} = state.plot
    return html`<div class="absolute pa2 ba f6 w5" style="top:40px;left:420px">
      <div class="flex justify-between"><span>${t.name} </span><span class="f7">${state.data.dates[state.dateIndex]}</span></div>
      <div>${Math.round(y.value(t, state.dateIndex)*10)/10} ${y.label}</div>
      <div>${Math.round(x.value(t, state.dateIndex)*10)/10} ${x.label}</div>
    </div>`
  } else {
    return ''
  }
}
