if (!process.env.ACCESS_TOKEN
  || !process.env.ACCESS_TOKEN_SECRET
  || !process.env.CONSUMER_KEY
  || !process.env.CONSUMER_SECRET) {
  console.error('Please set the env vars CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN and ACCESS_TOKEN_SECRET')
  process.exit(1)
}

const twitterKey = process.env.CONSUMER_KEY // Your Twitter application consumer key
const twitterSecret = process.env.CONSUMER_SECRET // Your Twitter application secret
const token =  process.env.ACCESS_TOKEN // Your user token for this app. you can get it at dev.twitter.com for your own apps.
const secret = process.env.ACCESS_TOKEN_SECRET // Your user secret for this app. You can get it at dev.twitter.com for your own apps.

const OAuth = require('oauth')

const oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  twitterKey,
  twitterSecret,
  '1.0A',
  null,
  'HMAC-SHA1'
)

oauth.get(
  'https://api.twitter.com/1.1/trends/place.json?id=23424977',
  token,
  secret,
  (error, data, response) => {
    if (error) return console.error(error)
    data = JSON.parse(data)
    console.log(JSON.stringify(data, 0, 2))
    // console.log(data)
  })
