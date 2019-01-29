const mongoose = require('mongoose');
const { accessibleRecordsPlugin } = require('@casl/mongoose');


module.exports = function (app) {
  mongoose.connect(
    app.get('mongodb'),
    { useCreateIndex: true, useNewUrlParser: true }
  );
  mongoose.plugin(accessibleRecordsPlugin);
  
  mongoose.Promise = global.Promise;

  app.set('mongooseClient', mongoose);
};
