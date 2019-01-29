let nunjucks = require('nunjucks');

const deletePropertyPath = function (obj, path) {

  if (!obj || !path) {
    return;
  }
  
  if (typeof path === 'string') {
    path = path.split('.');
  }
  
  for (var i = 0; i < path.length - 1; i++) {
  
    obj = obj[path[i]];
  
    if (typeof obj === 'undefined') {
      return;
    }
  }
  delete obj[path.pop()];
};



const compiledRolesTemplate = function(roles, data){
  var rolesString = JSON.stringify(roles);
  var compiled = nunjucks.renderString(rolesString, data);
  var obj = JSON.parse(compiled);
  return obj;
};


function swaggerAuthenticationCookie(hook) {
  if(hook && hook.app.get('host') === 'localhost' &&  hook.params && hook.params.headers && hook.params.headers.referer && hook.params.headers.referer.startsWith('http://localhost:3030/docs')){
    // hook.params.headers.authorization = 
    var rc = hook.params.headers.cookie;
    var list = {};
    rc && rc.split(';').forEach(function( cookie ) {
      var parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    if(list['feathers-jwt']){
      hook.params.headers.authorization = list['feathers-jwt'];
    }
  }
}

module.exports = {
  deletePropertyPath,
  compiledRolesTemplate,
  swaggerAuthenticationCookie
};