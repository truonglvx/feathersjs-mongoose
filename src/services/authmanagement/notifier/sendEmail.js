module.exports =  function sendEmail(options, email) {
  const {app} = options;
  return app.service('mailer').create(email).then(function (result) {
    console.log('Sent email', result)
  }).catch(err => {
    console.log('Error sending email', err)
  })
};