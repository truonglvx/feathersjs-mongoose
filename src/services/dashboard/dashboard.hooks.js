
const abilities = require('../../hooks/abilities');
const pick = require('../../utils/pick');
const cloneDeep = require('lodash.clonedeep');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const pickFromArr = function toObject(arr = [], fields) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    if (arr[i] !== undefined) rv[arr[i]] = arr[i];
  const _rv =  pick(rv, fields);
  return Object.keys(_rv);
};

const isPassAbilityCheck = function (request){
  return request && request.params && request.params.abilityTestCheckRun && request.params.abilityTestCheckResult
};

const getJsonSchemaWithAbilityFields = function(request, schema){
  if(request.params.abilityFields && request.params.abilityFields.length){
    let _schema = cloneDeep(schema);
    const properties = pick(
      _schema.properties,
      request.params.abilityFields
    );
    _schema.properties = properties;
    const required = pickFromArr(_schema.required, request.params.abilityFields);
    _schema.required = required;
    return _schema;
  }else{
    return schema;
  }
};

const getAbilityFieldsAsArr = function(readCheck, schema){
  return Object.keys(getJsonSchemaWithAbilityFields(readCheck, schema).properties);
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
    find: [async function(hook){
      console.log(hook.params)
      const abilityData = [];
      await asyncForEach(hook.result.data, async (service) => {
        const {name, schema} = service;
        const result = {
          name,
          canRead: false,
          jsonSchema: null,

          canCreate: false,
          createFields: null,
          canUpdate: false,
          updateFields: null,
          canDelete: false,
          
        };
        if(name !== 'dashboard') {
          let readCheck;
          let createCheck;
          let updateCheck;
          let deleteCheck;
          // Check read
          readCheck = await abilities.test(hook, name, 'read');
          if(isPassAbilityCheck(readCheck)){
            result.canRead = true;
            // If we get this step then user can read the collection, lets check for the other methods
            createCheck = await abilities.test(hook, name, 'create');
            result.canCreate = isPassAbilityCheck(createCheck);
            result.createFields = result.canCreate  ? getAbilityFieldsAsArr(createCheck, schema) : null;
            
            updateCheck = await abilities.test(hook, name, 'update');
            result.canUpdate = isPassAbilityCheck(updateCheck);
            result.updateFields = result.canCreate  ? getAbilityFieldsAsArr(updateCheck, schema) : null;

            deleteCheck = await abilities.test(hook, name, 'remove');
            result.canDelete = isPassAbilityCheck(deleteCheck);
            
            result.jsonSchema = getJsonSchemaWithAbilityFields(readCheck, schema);
            
          }
        }
        if(result.canRead){
          abilityData.push(result);
        }
      });
      hook.result = {
        data: abilityData,
        total:  abilityData.length
      };
      return hook;
    }],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
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
