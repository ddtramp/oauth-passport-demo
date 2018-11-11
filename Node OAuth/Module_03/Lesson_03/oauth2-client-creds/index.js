if (!process.env.CONSUMER_KEY ||
  !process.env.CONSUMER_SECRET) {
  console.error('Please set the env vars CONSUMER_KEY, and CONSUMER_SECRET')
  process.exit(1)
}

const twitterKey = process.env.CONSUMER_KEY // your Twitter application consumer key
const twitterSecret = process.env.CONSUMER_SECRET // your Twitter application secret

const OAuth = require('oauth')
const OAuth2 = OAuth.OAuth2

const oauth2 = new OAuth2(
  twitterKey,
  twitterSecret,
  'https://api.twitter.com/',
  null,
  'oauth2/token',
  null
)

oauth2.useAuthorizationHeaderforGET(true)

const url = 'https://api.twitter.com/1.1/application/rate_limit_status.json?resources=help,users,search,statuses'

const callback = (error, data) => {
  if (error) return console.error(error)
  console.log(JSON.stringify(data, null, 2))
}

oauth2.getOAuthAccessToken('',
  { 'response_type': 'token', 'grant_type': 'client_credentials' },
  (error, access_token, refresh_token, results) => {
    if (error) return console.error(error)
    console.log('Bearer: ', access_token)
    oauth2.get(url, access_token, function (error2, data, response) {
      if (error2) return callback(error2, null)
      if (response.statusCode != 200) return callback(new Error(`OAuth2 request failed: ${response.statusCode}`), null)
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (error3) {
          return callback(error3, null)
        }
      }
      return callback(null, data)
    })
  })
