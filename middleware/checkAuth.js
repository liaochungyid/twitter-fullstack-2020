const helpers = require('../_helpers')

module.exports = {
  authenticated: (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    req.flash('error_messages', '請先登入才能使用！')
    return res.redirect('/signin')
  },

  authenticatedAdmin: (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).role === 'admin') {
        return next()
      }
      return res.redirect('/tweets')
    }
    req.flash('error_messages', '請先登入才能使用！')
    return res.redirect('/admin/signin')
  }
}
