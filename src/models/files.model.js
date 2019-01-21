// files-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const files = new Schema({
    url: { type: String, required: true },
    fileId: { type: String, required: true },
    storage: { type: String, required: true, enum: ['s3', 'static'] },
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true }
  }, {
    timestamps: true
  });

  return mongooseClient.model('files', files);
};
