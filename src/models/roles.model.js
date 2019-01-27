// roles-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const roles = new Schema({
    actions: [{type: String, enum:['create', 'read', 'update', 'delete'], required: true}],
    subject: {
      type: String
    },
    fields: [],
    conditions: {
      type: Object
    },
    description: String
  }, {
    timestamps: true
  });

  return mongooseClient.model('roles', roles);
};

/* Role example
{
  "actions": ["create", "read", "update", "delete"],
  "subject": "Post",
  'fields': ['_id', {'title': {'author': '${user.id}'}}],
  "conditions": {
    "author": "${user.id}"
  }
}
*/