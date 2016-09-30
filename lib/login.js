import React from 'react'

import * as Auth from './auth'

export const LoginPage = React.createClass({
  contextTypes: {
    router: React.PropTypes.object,
  },
  getInitialState() {
    return {
      username: '',
      password: '',
      error: '',
    }
  },
  handleChange(what) {
    return (e) => {
      this.setState({[what]: e.target.value})
    }
  },
  handleSubmit(e) {
    e.preventDefault()
    Auth.login(this.state.username, this.state.password).then(res => {
      // Redirect to score page
      this.context.router.push('/')
    }, res => {
      let error = `Error ${res.status} ${res.statusText}`
      if (res.status == 401)
        error = 'Falscher Username oder Passwort'
      this.setState({error: error})
    })
  },
  render() {
    return (
      <form onSubmit={this.handleSubmit} className="pure-form pure-form-aligned">
        <p><b>{this.state.error}</b></p>
        <fieldset>
          <div className="pure-control-group">
            <label>Username</label>
            <input required autoFocus type="text" value={this.state.username} onChange={this.handleChange('username')} />
          </div>
          <div className="pure-control-group">
            <label>Passwort</label>
            <input required type="password" value={this.state.password} onChange={this.handleChange('password')} />
          </div>
          <div className="pure-controls">
            <input type="submit" className="pure-button pure-button-primary" />
          </div>
        </fieldset>
      </form>
    )
  }
})
