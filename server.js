require('dotenv').config()
/*
  Loading the Node modules that are used within this file
*/
var path = require('path')
var express = require('express')
var nunjucks = require('nunjucks')
var browserSync = require('browser-sync')
/*
  Loading scripts we've added ourselves.
*/
var routes = require('./app/routes.js')
var utils = require('./lib/utils.js')
/*
  Environment variable.
*/
var env = process.env.NODE_ENV || 'development'; env = env.toLowerCase()
/*
  This bits says we're using Express. 'app' will be used a lot later.
*/
var app = express()
/*
  Tell get ready to  where the views are going to live.
*/
var appViews = [path.join(__dirname, '/app/views/'), path.join(__dirname, '/lib/')]
var nunjucksAppEnv = nunjucks.configure(appViews, {
  autoescape: true,
  express: app,
  noCache: true,
  watch: true
})

// Use a utils function to tell Nunjucks to include certain filters.
utils.addNunjucksFilters(nunjucksAppEnv)

// Set views engine
app.set('view engine', 'html')

// Middleware to serve static assets
app.use('/public', express.static(path.join(__dirname, '/public')))

// routes (found in app/routes.js)
app.use('/', routes)

// Strip .html and .htm if provided
app.get(/\.html?$/i, function (req, res) {
  var path = req.path
  var parts = path.split('.')
  parts.pop()
  path = parts.join('.')
  res.redirect(path)
})

// Auto render any view that exists
// App folder routes get priority
app.get(/^\/([^.]+)$/, function (req, res) {
  utils.matchRoutes(req, res)
})

console.log("\x1b[37m"+'\nGOV.UK Prototype kit '+"\x1b[0m")

// start the app
utils.findAvailablePort(app, function (port) {
  console.log('Listening on port ' + port + '   url: ' + "\x1b[36m" + 'http://localhost:' + port + "\x1b[0m")
  app.listen(port - 50, function () {
    browserSync({
      proxy: 'localhost:' + (port - 50),
      port: port,
      ui: false,
      files: ['public/**/*.*', 'app/views/**/*.*'],
      ghostmode: false,
      open: false,
      notify: false,
      logLevel: 'error'
    })
  })
})

module.exports = app
