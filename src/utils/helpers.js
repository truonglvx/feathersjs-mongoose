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


const joinIfArray = value => Array.isArray(value) ? value.join(',') : value;

function packRules(rules) { // Copy from @casl , changed the fields handle to keep as array 
  return rules.map(({ actions, subject, conditions, inverted, fields, reason }) => {
    // eslint-disable-line
    const rule = [joinIfArray(actions), joinIfArray(subject), conditions || 0, inverted ? 1 : 0, fields || 0, reason || 0];

    while (!rule[rule.length - 1]) rule.pop();

    return rule;
  });
}

function unpackRules(rules) {
  return rules.map(([actions, subject, conditions, inverted, fields, reason]) => {
    const value = {
      actions: actions.split(','),
      subject: subject.split(','),
      inverted: !!inverted,
    };
    if(conditions) value.conditions = conditions;
    if(fields) value.fields = fields;
    if(reason) value.reason = reason;
    return value;
  });
}

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
  packRules,
  unpackRules,
  swaggerAuthenticationCookie
};