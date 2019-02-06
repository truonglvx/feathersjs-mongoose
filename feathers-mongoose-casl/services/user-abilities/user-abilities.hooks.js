


const abilities = require('../../hooks/abilities/abilities.hook')
const pick = require('../../utils/pick');
const cloneDeep = require('lodash.clonedeep');

const isPassAbilityCheck = function (request){
  return request && request.params && request.params.abilityTestCheckRun && request.params.abilityTestCheckResult;
};

const getAbilityFields = function(request){
  return request.params.abilityFields || [];
};

const pickFromArr = function toObject(arr = [], fields) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    if (arr[i] !== undefined) rv[arr[i]] = arr[i];
  const _rv =  pick(rv, fields);
  return Object.keys(_rv);
};

const getJsonSchemaWithAbilityFields = function(request, schema){
  if(request.params.abilityFields && request.params.abilityFields.length){
    let _schema = cloneDeep(schema);
    const abilityFields = [];
    request.params.abilityFields.forEach(fieldName => {
      if(!fieldName.includes('.')){
        abilityFields.push(fieldName);
      }else{ // for deep fields we need to add properties between because the object keys in scheme will be inside properties object 
        const [objName, keyName] = fieldName.split('.');
        abilityFields.push(`${objName}.properties.${keyName}`);
        if(!abilityFields.includes(`${objName}.type`)) abilityFields.push(`${objName}.type`);
      }
    });
    const properties = pick(
      _schema.properties,
      abilityFields
    );
    _schema.properties = properties;
    const required = pickFromArr(_schema.required, request.params.abilityFields);
    _schema.required = required;
    return _schema;
  }else{
    return schema;
  }
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [async (hook) => {
      const {userId, serviceName} = hook.result.data;

      const result = {
        name: serviceName,
        canRead: false,
        readFields: null,
        canCreate: false,
        createFields: null,
        canUpdate: false,
        updateFields: null,
        canDelete: false,
        
      };
      if(!hook.app.service(serviceName)){
        hook.result.error = 'Not found';
        hook.result.result = result;
        return;
      }

      let readCheck;
      let createCheck;
      let updateCheck;
      let deleteCheck;

      // Check read
      readCheck = await abilities.test(hook, serviceName, 'read', userId);
      result.canRead = isPassAbilityCheck(readCheck);
      result.readFields = result.canRead  ? getAbilityFields(readCheck) : null;
      
      if(hook.result.schema){
        hook.result.schema = getJsonSchemaWithAbilityFields(readCheck, hook.result.schema);
      }

      // If we get this step then user can read the collection, lets check for the other methods
      createCheck = await abilities.test(hook, serviceName, 'create', userId);
      result.canCreate = isPassAbilityCheck(createCheck);
      result.createFields = result.canCreate  ? getAbilityFields(createCheck) : null;
          
      updateCheck = await abilities.test(hook, serviceName, 'update', userId);
      result.canUpdate = isPassAbilityCheck(updateCheck);
      result.updateFields = result.canCreate  ? getAbilityFields(updateCheck) : null;

      deleteCheck = await abilities.test(hook, serviceName, 'remove', userId);
      result.canDelete = isPassAbilityCheck(deleteCheck);
              
      hook.result.result = result;

      return hook;
    }],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
