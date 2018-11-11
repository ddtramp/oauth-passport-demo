module.exports = {
  login: ()=>`<a href="/login/linkedin">Log In with LinkedIn</a>`,
  home: (isLoggedin) => (!isLoggedin) ? `Welcome! Please <a href="/login">log in</a>.</p>` :
    `<p>Hello, you are logged in. View your <a href="/profile">profile</a>.</p>`,
    profile: (user) => {
      console.log(user)
      return `<p>
    ID: <span title="${user.id}">******* (hover to see)</span><br/>
    First name: ${user.firstName}<br/>
    Last name: ${user.lastName}<br/>
    Headline: ${user.headline}<br/>
    Profile request: <a href="${user.siteStandardProfileRequest.url}">link to profile</a><br/>`
    }
}