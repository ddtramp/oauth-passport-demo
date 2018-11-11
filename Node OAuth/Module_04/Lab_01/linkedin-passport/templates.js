module.exports = {
  login: ()=>`<a href="/login/linkedin">Log In with LinkedIn</a>`,
  home: (user) => (!user) ? `Welcome! Please <a href="/login">log in</a>.</p>` :
    `<p>Hello, ${user.displayName}. View your <a href="/profile">profile</a>.</p>
    <a href="/logout">Log out</a>`,
  profile: (user) => {
    console.log(user)
    return `<p>
  ID: <span title="${user.id}">******* (hover to see)</span><br/>
  Headline: ${user.headline}<br/>
  Profile request: <a href="${user.siteStandardProfileRequest.url}">link to profile</a><br/>
  Photo: <img src="${user.photos[0].value}"/></<br/>`
  }
}