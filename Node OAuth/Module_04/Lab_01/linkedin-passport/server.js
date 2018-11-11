
if (!process.env.CLIENT_SECRET ||
  !process.env.CLIENT_ID ||
  !process.env.SESSION_SECRET) {
  console.error('Please set the env vars CLIENT_ID, CLIENT_SECRET and SESSION_SECRET')
  process.exit(1)
}

const OAuth = require('oauth')
const oauth2 = new OAuth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://www.linkedin.com/',
  'oauth/v2/authorization',
  'oauth/v2/accessToken',
  null
)
oauth2.useAuthorizationHeaderforGET(true) // LinkedIn needs header not just query string

const express = require('express')
const errorHandler = require('errorhandler')
const passport = require('passport')
const Strategy = require('passport-linkedin-oauth2').Strategy


passport.use(new Strategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/login/linkedin/return',
  state: true
}, (accessToken, refreshToken, profile, callback) => {
  console.log(`OAuth callback with access token ${accessToken} and refresh token: ${refreshToken}`)
  // You can store access token in the database and/or session for future use
  setTimeout(() => {
    console.log('Profile', profile)
    profile.accessToken = accessToken
    profile.refreshToken = refreshToken
    return callback(null, profile)    
  }, 0)
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
app.use(require('express-session')({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true}
))

app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html')
  res.send(home(req.user))
})

app.get('/login', (req, res) => {
  res.send(login())
})

app.get('/login/linkedin',
  passport.authenticate('linkedin', {scope: ['r_emailaddress', 'r_basicprofile']}))

app.get('/login/linkedin/return',
  passport.authenticate('linkedin', {failureRedirect: '/login'}),
  (req, res) => {
    res.redirect('/')
  })

app.get('/profile',
  auth,
  (req, res, next) => {
    console.log(`Profile page has access token ${req.user.accessToken}`)
    oauth2.get('https://api.linkedin.com/v1/people/~?format=json', // 
    req.user.accessToken,
     (error2, data, response) => {
       if (error2) return next(error2)
       if (response.statusCode !== 200) return next(new Error(`OAuth2 request failed: ${response.statusCode}`))
       if (typeof data === 'string') {
         try {
           data = JSON.parse(data)
         } catch (error3) {
           return next(error3)
         }
       }
       console.log(data)
       req.user = {
         ...req.user,
         ...data
       }
       return next()
     })
  },
  (req, res) => {
    res.send(profile(req.user))
  })

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})
app.use(errorHandler())
app.listen(3000)
