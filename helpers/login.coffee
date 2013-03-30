# Helper middleware managing login.

module.exports =
  # Checks whether the user is authenticated.
  check: (req, res, next) ->
    if req.session.login
      next()
    else
      url = ''
      if req.method is 'GET'
        # Save URL for redirecting back.
        url = '?return='+encodeURIComponent(req.originalUrl)
      res.redirect '/login'+url
