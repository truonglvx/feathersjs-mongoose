// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const profileSchema = new mongooseClient.Schema(
    {
      'displayName': String,
      'first_name': String,
      'last_name': String,
      'email': String,
      'gender': String,
      'profileUrl': String,
      'birthday': String,
      'picture': String,
    }
  );
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
      roles: [{ type: Schema.Types.ObjectId, ref: 'roles' }],
      profile: profileSchema
    },
    { timestamps: true }
  );

  return mongooseClient.model('users', users);
};
