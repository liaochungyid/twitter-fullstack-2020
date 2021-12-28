if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const PORT = process.env.PORT || 3000

const helpers = require('./_helpers')
const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('./config/passport')
const flash = require('connect-flash')
const moment = require('moment')
moment.locale('zh-tw')

const app = express()

app.engine(
  'hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: require('./utils/handlebars-helpers')
  })
)
app.set('view engine', 'hbs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.loginUser = helpers.getUser(req)
  res.locals.isAuthenticated = helpers.ensureAuthenticated(req)
  res.locals.successMessage = req.flash('successMessage')
  res.locals.errorMessage = req.flash('errorMessage')
  next()
})

const { Server } = require('socket.io')
const server = require('http').createServer(app)
const io = new Server(server)

require('./sockets/socketioSockets')(io)

server.listen(PORT, () =>
  console.log(`App listening on http://localhost:${PORT}`)
)

require('./routes')(app)

module.exports = app
