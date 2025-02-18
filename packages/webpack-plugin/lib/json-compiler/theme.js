const JSON5 = require('json5')
const loaderUtils = require('loader-utils')
const isUrlRequestRaw = require('../utils/is-url-request')
const addQuery = require('../utils/add-query')

function isFile (request) {
  return /\.(png|jpe?g|gif|svg)$/.test(request)
}

module.exports = function (raw) {
  const mpx = this.getMpx()
  const root = mpx.projectRoot
  const externals = mpx.externals
  const isUrlRequest = r => isUrlRequestRaw(r, root, externals)
  const urlToRequest = r => loaderUtils.urlToRequest(r, root)

  const json = JSON5.parse(raw)
  let output = `var json = ${JSON.stringify(json, null, 2)};\n`

  'light,dark'.split(',').forEach(theme => {
    if (json[theme]) {
      Object.keys(json[theme]).forEach(key => {
        const value = json[theme][key]
        if (isFile(value) && isUrlRequest(value)) {
          output += `json.${theme}.${key} = require("${addQuery(urlToRequest(value), { useLocal: true })}");\n`
        }
      })
    }
  })

  output += `module.exports = JSON.stringify(json, null, 2);\n`
  return output
}
