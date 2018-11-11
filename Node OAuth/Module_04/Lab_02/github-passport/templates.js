module.exports = {
  login: ()=>`<a href="/login/github">Log In with GitHub</a>`,
  home: (user) => (!user) ? `Welcome! Please <a href="/login">log in</a>.</p>` :
    `<p>Hello, ${user.username}. View your <a href="/profile">profile</a>.</p>
    <a href="/logout">Log out</a>`,
  profile: (user) => {
    return `<p>
  ID: ${user.id}<br/>
  Username: ${user.username}<br/>
  Name: ${user.displayName}<br/>
  List of private (hidden) repositories:` + user.repos.filter((r)=>r.private).map((r)=>`<div>${r.name}</div>`).join('')
  }
}