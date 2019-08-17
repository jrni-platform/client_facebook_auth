
const bbCore = require('sdk');

module.exports = function(event, callback) {
  
  // load the sso value
  let data = bbCore.getTempValue(event.token)
  
  if (!data){
      callback(null, {found: false, status: 'failed'})
      return;
  }
  
  data = JSON.parse(data)

  // load the client data
  const client = {
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    ref: data.id
  }

  callback(null, {found: true, status: 'success', data: client})

}

