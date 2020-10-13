const html = require('choo/html')

// const select = (options = [], selected = null, onClick) => {
//   return options.map(({ label }, index) => html`
//     <div class="dib pa2 pointer dim ${index===selected? "ba": ""}" onclick=${()=> onClick(index)}>${label}</div>
//   `)
// }
//   ${key}: ${select(config.options, config.selected, (i) => emit('update settings', key, i))}

const options = (options = [], selected = null) => html `
  ${options.map(({ label}, index) => html`
  <option value=${index} ${index===selected?"selected":""}>${label}</option>
`)}
`



module.exports = (settings, emit) => {
  const dropdown = (key, config) => html`
    <div class="ma1">
      <label for="${key}" class="pa1"> ${key}</label>
      <select name="${key}" id="key" onchange=${(e) => emit('update settings', key, parseFloat(e.target.value))}>
        ${options(config.options, config.selected)}
      </select>
    </div>`

  const toggle = (key, config) => html`
    <label for="${key}" class="pa1"> ${key}</label>
    <input type="checkbox" id="${key}-check" name="${key}" checked=${config.selected} onchange=${(e) => emit('update settings', key, !config.selected)}>
  `
  return html`<div class="" style="">
      ${Object.entries(settings).map(([key, config]) => config.options ? dropdown(key, config) : toggle(key, config))
      }
  </div>`
}
