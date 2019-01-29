// roles-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const blockedSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    roles: [{ type: Schema.Types.ObjectId, ref: 'roles' }],
    blockAll: Boolean
  }, {
    timestamps: true
  });

  const roles = new Schema({
    name: {
      type: String,
      required: true
    },
    description: String,
    type: {
      type: String,
      enum:['private', 'public', 'blocked'],
      // public role is rule that applies to everyone
      // private role is rule that applies only on user with pointer to this role
      // blocked is special that help us block user from specific roles or for all roles,
      // we need this because JWT come from client with user roles
      required: true,
      default: 'private'
    },
    blocked: blockedSchema,
    actions: [{type: String, enum:['create', 'read', 'update', 'delete','manage'], required: true}],
    subject: [{
      type: String
    }],
    fields: [],
    conditions: {
      type: Object
    },
    active: {
      type: Boolean,
      default: true
    }
  }, {
    timestamps: true
  });

  return mongooseClient.model('roles', roles);
};