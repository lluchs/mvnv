import React from 'react'

import * as Auth from './auth'

export const LoginPage = React.createClass({
  contextTypes: {
    router: React.PropTypes.object,
  },
  componentWillMount() {
    // This page will not actually render anything but just redirect.
    if (location.hash) {
      Auth.setLoginToken(location.hash.substr(1))
    } else {
      Auth.login()
    }
  },
  render() {
    return <p>Redirecting to login page…</p>
  },
})
