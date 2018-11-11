module.exports = {
  login: ()=>`<a href="/login/twitter">Log In with Twitter</a>`,
  home: (user) => (!user) ? `Welcome! Please <a href="/login">log in</a>.</p>` :
    `<p>Hello, ${user.screen_name}. View your <a href="/profile">profile</a>.</p>`,
  profile: (user) => `<p>
  ID: ${user.user_id}<br/>
  Username: @${user.screen_name}<br/>
  ` + ((user.emails) ? `Email:  ${user.emails[0].value}<br/></p>`:'')
  + user.directMessages.map((m) => `<div>${JSON.stringify(m.message_create.message_data)}</div>`) 
  + `<br/><a href="/logout">Log out</a>`
}