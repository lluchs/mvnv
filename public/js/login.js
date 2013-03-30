/* Hide the login or logout button. */

if (document.cookie.indexOf('login=1') == -1) {
  $('.logout').hide();
}
else {
  $('.login').hide();
}
