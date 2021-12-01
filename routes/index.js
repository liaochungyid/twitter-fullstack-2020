const userController = require('../controllers/userController')
const tweetController = require('../controllers/tweetController')

module.exports = (app, passport) => {
  app.get('/', (req, res) => res.render('index'))

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)

  app.get('/tweets', tweetController.getTweets)
}
