const pick = require('./src/utils/pick');

const t = {
  name: { type: 'string', minLength: 5, meta: [] },
  description: { type: 'string', meta: [] },
  type:
   { enum: [ 'private', 'public', 'blocked' ],
     type: 'string',
     meta: [] },
  blocked:
   { type: 'object',
     properties: { user: [Object], roles: [Object], blockAll: [Object] },
     additionalProperties: false,
     patterns: [],
     meta: [] },
  actions:
   { type: 'array',
     items: { enum: [Array], type: 'string', meta: [] },
     meta: [] },
  subject:
   { type: 'array', items: { type: 'string', meta: [] }, meta: [] },
  fields: { type: 'array', meta: [] },
  conditions:
   { type: 'object',
     properties: {},
     additionalProperties: false,
     patterns: [],
     meta: [] },
  active: { type: 'boolean', meta: [] },
  from: { type: 'string', format: 'date-time', meta: [] },
  to: { type: 'string', format: 'date-time', meta: [] }
};

const p = pick(t, ['-name'])
console.log(p)