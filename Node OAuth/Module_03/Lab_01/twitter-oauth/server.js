
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
  'http://localhost:3000/login/twitter/return',
  'HMAC-SHA1'
)

const express = require('express')
const errorHandler = require('errorhandler')
const util = require('util')

const app = express()

const {login, home, profile} = require('./templates.js')
const auth = (req, res, next) => {
  if (req.session && req.session.user && req.session.oauthAccessToken)  {    
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
  res.send(home(req.session.user))
})

app.get('/login', (req, res) => {
  res.send(login())
})

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

app.get('/login/twitter',
  (req, res, next) => {
    oauth.getOAuthRequestToken((error, oauthToken, oauthTokenSecret, results) => {
      if (error) {
        next(new Error('Error getting OAuth request token : ' + util.inspect(error)))
      } else {  
        req.session.oauthRequestToken = oauthToken
        req.session.oauthRequestTokenSecret = oauthTokenSecret
        res.redirect(`https://twitter.com/oauth/authorize?oauth_token=${req.session.oauthRequestToken}`)
      }
    })
  })

app.get('/login/twitter/return',
  (req, res, next) => {
    console.log(req.session.oauthRequestToken)
    console.log(req.session.oauthRequestTokenSecret)
    console.log(req.query.oauth_verifier)
    oauth.getOAuthAccessToken(req.session.oauthRequestToken, 
      req.session.oauthRequestTokenSecret, 
      req.query.oauth_verifier, (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
      if (error) return next(new Error('Error getting OAuth access token : ' + util.inspect(error) + '['+oauthAccessToken+']'+ '['+oauthAccessTokenSecret+']'+ '['+util.inspect(results)+']'))      
      console.log('results', results)
      req.session.user = results
      req.session.oauthAccessToken = oauthAccessToken
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret        
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
    oauth.get('https://api.twitter.com/1.1/direct_messages/events/list.json', 
    req.session.oauthAccessToken, 
    req.session.oauthAccessTokenSecret,
     (error2, data, response) => {      
      if (error2) return next(error2)
      if (response.statusCode !== 200) return next(new Error(`OAuth2 request failed: ${response.statusCode}`))
      console.log('Response', data)
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        }
        catch (error3){
          return next(error3)
        }
      }
      req.session.user.directMessages = data.events
      return next()
    })

  },
  (req, res) => {    
    console.log('Direct messages ', JSON.stringify(req.session.user.directMessages))
    res.send(profile(req.session.user))
})

app.use(errorHandler())
app.listen(3000)
