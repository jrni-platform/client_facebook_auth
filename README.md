## Facebook OAuth 2 Connector for Clients

This app adds the ability to use your own Facebook OAuth process for createing a single sign on for clients
It connects to the clients, decodes their profile data, and the creates a JRNI SSO process via a client journey to authenticate the client


### Config Values

Key | Use 
--- | ---
client_id | The OAuth2 Client id
consumer_secret | The Oauth secret
redirect_url | The customer journey end point to redirect to i.e. https://customer.bookingbug.com?client=xxx


### Calling the SSO

You will need to call the configured script at:  https://{url}/app/client_facebook_auth/login
You will also need to approve that end point with your Facebook App as a valid OAuth endpoint


### Extra params

If needed you can also pass in a ?passthrough=xxx value - that will eventaully be passed all of the way into the client journey if you need to preseist a session value

