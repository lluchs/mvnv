function(newDoc, oldDoc, userCtx, secObj) {
  if (userCtx.roles.indexOf('mvnv') === -1)
    throw {unauthorized: 'not authorized, please log in'}
}
