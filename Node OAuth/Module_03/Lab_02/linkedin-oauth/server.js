
if (!process.env.CLIENT_SECRET ||
  !process.env.CLIENT_ID ||
  !process.env.SESSION_SECRET) {
  console.error('Please set the env vars CLIENT_ID, CLIENT_SECRET and SESSION_SECRET')
  process.exit(1)
}

const STATE = process.env.STATE
const OAuth = require('oauth')
var oauth2 = new OAuth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET ,
  'https://www.linkedin.com/',
  'oauth/v2/authorization',
  'oauth/v2/accessToken',
  null
)
oauth2.useAuthorizationHeaderforGET(true)

const express = require('express')
const errorHandler = require('errorhandler')
const util = require('util')
const app = express()

const {login, home, profile} = require('./templates.js')
const auth = (req, res, next) => {
  if (req.session && req.session.oauthAccessToken)  {    
    return next()
  }
  return res.redirect('/login')
}

app.use(require('morgan')('dev'))
app.use(require('body-parser').urlencoded({extended: true}))
app.use(require('express-session')({secret: process.env.SESSION_SECRET, 
  resave: true, 
  saveUninitialized: true
}))

app.get('/',(req, res) => {
  res.set('Content-Type', 'text/html')
  res.send(home(!!req.session.oauthAccessToken))
})

app.get('/login', (req, res) => {
  res.send(login())
})

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

app.get('/login/linkedin',
  (req, res, next) => {
    let authURL = oauth2.getAuthorizeUrl({
      redirect_uri: 'http://localhost:3000/login/linkedin/return',
      scope: ['r_basicprofile'],
      state: STATE, 
      response_type:'code'
    })
    res.redirect(authURL)
  })

app.get('/login/linkedin/return',
  (req, res, next) => {
    if (req.query.state !== STATE) return next(new Error('States do not match'))
    oauth2.getOAuthAccessToken(req.query.code, 
      {grant_type: 'authorization_code', redirect_uri: 'http://localhost:3000/login/linkedin/return'}, 
      (error, oauthAccessToken, oauthRefreshToken, results) => {
        console.log('results', results)
        if (error) return next(error)      
        req.session.oauthAccessToken = oauthAccessToken
        req.session.oauthRefreshToken = oauthRefreshToken        
        next()    
    })
  },
  (req, res) => {
    res.redirect('/')
})

app.get('/profile',
  auth,
  (req, res, next) => {
    console.log(`Profile page has access token ${req.session.oauthAccessToken}`)
    oauth2.get('https://api.linkedin.com/v1/people/~?format=json', 
    req.session.oauthAccessToken,
     (error2, data, response) => {
       if (error2) return next(error2)
       if (response.statusCode !== 200) return next(new Error(`OAuth2 request failed: ${response.statusCode}`))
       console.log(data)
       if (typeof data === 'string') {
         try {
           data = JSON.parse(data)
         } catch (error3) {
           return next(error3)
         }
       }
       console.log(data)
       req.session.user = data
       return next()
     })
  },
  (req, res) => {
    res.send(profile(req.session.user))
  }
)

app.use(errorHandler())
app.listen(3000)
