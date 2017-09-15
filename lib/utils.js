var fs = require('fs')
var marked = require('marked')
var path = require('path')
var portScanner = require('portscanner')

/*
  require core filters and filters you've written
  then merge them both to one object
  then add the methods to nunjucks environment object
*/
exports.addNunjucksFilters = function (env) {
  var coreFilters = require('./core_filters.js')(env)
  var customFilters = require('../app/filters.js')(env)
  var filters = Object.assign(coreFilters, customFilters)
  Object.keys(filters).forEach(function (filterName) {
    env.addFilter(filterName, filters[filterName])
  })
}

exports.findAvailablePort = function (app, callback) {
  var port = null
  try {
    port = Number(fs.readFileSync(path.join(__dirname, '/../.port.tmp')))
  } catch (e) {
    port = Number(process.env.PORT || 3000 )
  }
  console.log('')
  // Check that default port is free, else offer to change
  portScanner.findAPortNotInUse(port, port + 50, '127.0.0.1', function (error,availablePort) {
    if (error) { throw error }
    port = availablePort
    fs.writeFileSync(path.join(__dirname, '/../.port.tmp'), port)
    callback(port)
  })
}

// Matches routes
exports.matchRoutes = function (req, res) {
  var path = (req.params[0])
  res.render(path, function (err, html) {
    if (err) {
      res.render(path + '/index', function (err2, html) {
        if (err2) {
          res.status(404).send(err + '<br>' + err2)
        } else {
          res.end(html)
        }
      })
    } else {
      res.end(html)
    }
  })
}
