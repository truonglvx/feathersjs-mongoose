// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const users = new mongooseClient.Schema(
    {
      email: { type: String, unique: true, lowercase: true },
      password: { type: String },
      auth0Id: { type: String },
      googleId: { type: String },
      facebookId: { type: String },
      githubId: { type: String },
      isVerified: { type: Boolean },
      verifyToken: { type: String },
      verifyExpires: { type: Date },
      verifyChanges: { type: Object },
      resetToken: { type: String },
      resetExpires: { type: Date },
      roles: [{ type: mongooseClient.Schema.Types.ObjectId, ref: 'roles' }]
    },
    { timestamps: true }
  );

  return mongooseClient.model('users', users);
};
