
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
  'https://api.github.com/',
  null,
  'oauth2/token',
  null
)

const express = require('express')
const errorHandler = require('errorhandler')
const passport = require('passport')
const Strategy = require('passport-github2').Strategy

passport.use(new Strategy({
  // TODO
}, (accessToken, refreshToken, profile, callback) => {
  // TODO
}))

passport.serializeUser((user, callback) => {
  // TODO
})

passport.deserializeUser((obj, callback) => {
  // TODO
})

const app = express()

const {login, home, profile} = require('./templates.js')
const auth = (req, res, next) => {
  // TODO
}

app.use(require('morgan')('dev'))
app.use(require('body-parser').urlencoded({extended: true}))
app.use(require('express-session')(
  // TODO
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

app.get('/login/github',
  passport.authenticate('github', {scope: ['user:email', 'repo']}))

app.get('/login/github/return',
  passport.authenticate('github', {failureRedirect: '/login'}),
  (req, res) => {
    res.redirect('/')
  })

app.get('/profile',
  auth,
  (req, res, next) => {
    console.log(`Profile page has access token ${req.user.accessToken}`)
    oauth2.get('https://api.github.com/user/repos', // GitHub API v3 by default. If not, then add header Accept: application/vnd.github.v3+json
    // TODO
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
       // TODO
       return next()
     })
  },
  (req, res) => {
    res.send(profile(req.user))
  })

app.get('/logout', (req, res) => {
  // TODO
})

app.use(errorHandler())
app.listen(3000)
