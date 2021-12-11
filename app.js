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

const app = express()
// const server = require('http').Server(app)
// const io = require('socket.io')(server) // 增加 /socket.io/socket.io.js 路由

app.engine(
  'hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: require('./config/handlebars-helpers')
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
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  next()
})

// const { generateMessage } = require('./utils/message')

// io.on('connection', (socket) => {
//   console.log('A new user just connected')

//   socket.emit('newMessage', generateMessage('Admin', 'Welcome to chat app!'))

//   socket.emit(
//     'newMessage',
//     generateMessage({
//       from: 'Admin',
//       text: 'Welcome to the chat app!',
//       createdAt: new Date().getTime()
//     })
//   )

//   socket.broadcast.emit('newMessage', generateMessage('Admin', 'New User Join'))

//   socket.on('createMessage', (message, callback) => {
//     console.log('createMessage', message)
//     io.emit('newMessage', generateMessage(message.from, message.text))
//     callback('This is the server!')
//   })

//   socket.on('disconnect', () => {
//     console.log('User was disconnected.')
//   })
// })

// server.listen(PORT, () =>
//   console.log(`App listening on http://localhost:${PORT}`)
// )

// 即時聊天
const { Server } = require('socket.io')
const server = require('http').createServer(app)
const io = new Server(server)

// app.set('socketio', io)

require('./config/sockio')(io)

server.listen(PORT, () =>
  console.log(`App listening on http://localhost:${PORT}`)
)

require('./routes')(app)

module.exports = app
