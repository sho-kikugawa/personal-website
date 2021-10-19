# personal-website
It's my personal website! Made with a MEAN stack to put my experience and knowledge of it from my side project to use.

## Requirements
This web site requires the following to run. It may run on older versions but this is no guarantee
- Node.js version 16.11.1
	- Node.js package dependencies are described in the package.json file
- MongoDB 5.0.3
- This site was developed on Ubuntu 20.04 LTS based distro

## How to run
- This is assuming you're using a terminal
- Install the Node.js dependencies by going into the ```backend``` folder by running ```npm install```
- Rename or copy the ```.env.base``` file to just ```.env```
- Open the ```.env``` file with a text editor and populate the following:
	- NODE_ENV: Can be blank, but use "development" to enable debug logging and verbose error printing on the web site
	- PORT: Port the server should listen on
	- COOKIE_NAME: Name of the session cookie
	- COOKIE_SECRET: Secret for the session cookie
	- COOKIE_TTL: Cookie time-to-live (seconds)
	- DB_TYPE: ```monngodb``
	- DB_IP: IP address or hostname where the database server is
	- DB_PORT: Port that the database server is listening on
	- DB_NAME: Name of the database to store collections
	- DB_USERNAME: Username to log into the database
	- DB_PASSWORD: Password to log into the database
- Start the server with ```npm start```
- If you want to start with nodemon, use ```npm run dev``` (though NODE_ENV needs to be set to ```development``` as well)