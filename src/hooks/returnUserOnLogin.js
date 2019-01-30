const pick = require('../utils/pick');

module.exports = function returnUserOnLogin() {
  return async function(hook) {
    if(hook.result && hook.result.accessToken){
      const USER_PROTECTED_FIELDS = [...hook.app.get('enums').USER_PROTECTED_FIELDS.map(field => `-${field}`)];
      hook.result.user = pick(hook.params.user, USER_PROTECTED_FIELDS);
    }
    return hook;
  };
};