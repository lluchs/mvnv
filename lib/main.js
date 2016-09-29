// Styles
import 'purecss/build/pure.css!'
import 'react-select/dist/react-select.css!'
import './main.css!'
// Application
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, IndexRoute, Link, IndexLink, browserHistory } from 'react-router'

import { ScorePage } from './scores'
import { LoginPage } from './login'

import { couchURL } from './db'

const App = React.createClass({
  getInitialState() {
    return {loggedIn: false}
  },
  componentDidMount() {
    // Check login status
    fetch(couchURL + '/_session', {
      credentials: 'include',
    }).then(res => res.json())
    .then(session => {
      this.setState({loggedIn: session.ok && session.userCtx.name})
    })
  },
  logout() {
    fetch(couchURL + '/_session', {
      method: 'DELETE',
      credentials: 'include',
      // This is necessary to get a non-empty Access-Control-Request-Headers
      // header in the CORS preflight request. See COUCHDB-3090
      headers: new Headers({'Content-Type': 'application/json'}),
    }).then((res) => {
      if (res.ok)
        this.setState({loggedIn: false})
    })
  },
  render() {
    return (
      <div>
        <header>
          <div className="pure-menu pure-menu-horizontal">
            <IndexLink className="pure-menu-heading" to="/">MVNV 2</IndexLink>
            <ul className="pure-menu-list">
              {this.state.loggedIn
                ? <li className="pure-menu-item"><a onClick={this.logout} className="pure-menu-link">Logout</a></li>
                : <li className="pure-menu-item"><Link to="/login" className="pure-menu-link">Login</Link></li>}
            </ul>
          </div>
        </header>

        <main>
          {this.props.children}
        </main>
      </div>
    )
  }
})

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={ScorePage} />
      <Route path="login" component={LoginPage} />
    </Route>
  </Router>
), document.getElementById('app'))
