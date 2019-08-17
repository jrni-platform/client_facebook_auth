const bbCore = require('sdk');

var OAuth2 = require('oauth2').OAuth2;
var querystring= require('querystring')
var crypto = require("crypto");
const URL= require('url');


// redirect over to facebook auth
function call_facebook_auth(event, callback, client_id, callbackURI){
  // generate a random state
  const state = crypto.randomBytes(20).toString('hex');
  // write it out for 5 minutes as an accepted random state - also supporting a passthrough param
  if (!event.passthrough)
    event.passthrough = true;
  bbCore.setTempValue(state, event.passthrough, 60*5);
  
  // redirect and ask for email and profile
  let prms = querystring.stringify({
    response_type: 'code',
    client_id:  client_id,
    redirect_uri: callbackURI,
    scope: 'email',
    state: state
  })
  
  // callback
  callback(null, {
    proxy:true,
    status_code: 302,
    headers: {
      'Location':  'https://www.facebook.com/dialog/oauth?' + prms
    },
    response: "Redirect"
  });
}

module.exports = async function(event, callback) {
    var config;

    // load the config       
    const client_id = bbCore.getConfigValue("client_id");
    const consumer_secret = bbCore.getConfigValue("consumer_secret");
    const redirect_url = bbCore.getConfigValue("redirect_url");
 
     // get the url of this script!
    const callbackURI = "https://" + URL.parse(bbCore.context.apiUrl).host + "/app/client_facebook_auth/login";

    // if we recieved an oauth callback
    if (event.code) {
      var oauth2 = new OAuth2(client_id,
         consumer_secret, 
         'https://graph.facebook.com/', 
         'dialog/oauth',
         'v3.2/oauth/access_token', 
         null);    

      oauth2.useAuthorizationHeaderforGET(true);
      
      // get the state
      const passthrough = bbCore.getTempValue(event.state);
      if (!passthrough){
        // if you got an invalid state - try again - just in case it just expired
        return call_facebook_auth(event, callback, client_id, callbackURI);
      }
     
      // look up the access token
      oauth2.getOAuthAccessToken( event.code, {grant_type:'authorization_code', redirect_uri: callbackURI },
        (e, access_token, refresh_token, results) => {
             
          // use it to get the user info
          oauth2.get("https://graph.facebook.com/v3.2/me?fields=id,name,email,first_name,last_name", access_token, (error, data, response) => {
              // now we start a customer journey using a custom sso
              // use a slightly different temp variable as a nonce for the bookingbug custom sso section
              const sso_nonce = event.state + "s";
              // store the data in  a temp variable
              bbCore.setTempValue(sso_nonce, data, 60);

              const host = redirect_url + "&passthrough=" + passthrough + "&sso=" + sso_nonce

              // callback with a redirect
              callback(null, {
                proxy:true,
                status_code: 302,
                headers: {
                  'Location':  host
                },
                response: "Redirect"
              });
         });
      });

    }
    else {
       call_facebook_auth(event, callback, client_id, callbackURI);
    }
};


