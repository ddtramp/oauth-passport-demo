
if (!process.env.CONSUMER_SECRET 
  || !process.env.CONSUMER_KEY
  || !process.env.SESSION_SECRET) {
  console.error('Please set the env vars CONSUMER_KEY, CONSUMER_SECRET and SESSION_SECRET')
  return process.exit(1)
}

const OAuth = require('oauth')
var oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  process.env.CONSUMER_KEY,
  process.env.CONSUMER_SECRET,
  '1.0A',
  null,
  'HMAC-SHA1'
)

const express = require('express')
const passport = require('passport')
const Strategy = require('passport-twitter').Strategy
const errorHandler = require('errorhandler')

passport.use(new Strategy({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  callbackURL: 'http://localhost:3000/login/twitter/return'
}, (token, tokenSecret, profile, callback) => {
  console.log(`Twitter OAuth callback with token ${token} and token secret ${tokenSecret}`)
  profile.token = token
  profile.tokenSecret = tokenSecret
  return callback(null, profile)
}))

passport.serializeUser((user, callback) => {
  callback(null, user)
})

passport.deserializeUser((obj, callback) => {
  callback(null, obj)
})

const app = express()

const {login, home, profile} = require('./templates.js')
const auth = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {    
    return res.redirect('/login')
  }
  next()
}

app.use(require('morgan')('dev'))
app.use(require('body-parser').urlencoded({extended: true}))
app.use(require('express-session')({secret: process.env.SESSION_SECRET, 
  resave: true, 
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.get('/',(req, res) => {
  res.set('Content-Type', 'text/html')
  res.send(home(req.user ))
})

app.get('/login', (req, res) => {
  res.send(login())
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.get('/login/twitter',
  passport.authenticate('twitter'))

app.get('/login/twitter/return',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/')
})

app.get('/profile',
  auth,
  (req, res, next) => {
    console.log(`Profile page has access token ${req.user.token}`)    
    oauth.get('https://api.twitter.com/1.1/direct_messages/events/list.json', 
    req.user.token, 
    req.user.tokenSecret,
     (error2, data, response) => {      
      if (error2) return next(error2)
      if (response.statusCode !== 200) return next(new Error(`OAuth2 request failed: ${response.statusCode}`))
      console.log('Response', data, response)
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        }
        catch (error3){
          return next(error3)
        }
      }
      req.user.directMessages = data.events
      return next()
    })

  },
  (req, res) => {    
    console.log('Direct messages ', JSON.stringify(req.user.directMessages))
    res.send(profile(req.user))
})

app.use(errorHandler())
app.listen(3000)
