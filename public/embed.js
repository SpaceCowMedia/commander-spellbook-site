var currentSource = document.currentScript.src
var idFromQuery = currentSource.match(/id=([^&]+)/)
var id = idFromQuery ? idFromQuery[1] : null
if (!id) {
  throw new Error('No id found in query string')
}
var container = document.getElementById(id)
if (!container) {
  throw new Error('No container found for id ' + id)
}
fetch('http://localhost:3000/combo/' + id + '/embed/')
  .then(function (response) {
    return response.text()
  })
  .then(function (html) {
    console.log('setting html')
    container.innerHTML = html
  }
)
