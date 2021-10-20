# Programming notes

## Folder Structure

### backend
Contains the source for the backend application.

### backend/bin
Contains the entry point to launch the backend

### backend/components
Contains folders that features that the backend is handling. This includes the controllers, data access layer code, and schemas for the databases.

### backend/dbs
Contains code to connect to a database server and initialize it.

### backend/routes
Contains routes to handle incoming HTTP requests and call the correct controller code.

### backend/tests
Contains mocha/chai based test scripts.

### backend/utils
Contains utility functions that any part of the app may use.

### client
If this web app is meant to be dispalyed as a web page, this contains the HTML (or rendering source), CSS, and JavaScript code.

### client/public/css
Contains the CSS code.

### client/public/js
Contains the JavaScript code.

### client/views
Contains the HTML or rendering source code.

### docs
Contains documentation.

## NPM Packages
### argon2
Used to handle password hashing

### cookie-session
Allows for cookie-based sessions

### cookie-parser
Needed to parse cookies (if being used)

### debug
Colorizes console output

### dotenv-flow
Reads and encorporates a ```.env``` file into the global environment variables.

### express
HTTP middleware

### express-promise-router
Wraps promises around express

### helmet
Sets HTTP headers appropriate to help prevent various attacks.

### http-errors
Eases creation of HTTP errors

### lodash
Utilities package

### marked
Converts Markdown into HTML

### mongoose
MongoDB middleware

### morgan
HTTP request logger

### nodemon
Monitors changes in the backend application source and restarts it if changes are made. Useful for development.

### pug
Render engine

### sanitize-html
Sanitizes HTML

### uuid
Generates UUIDs

### winston
Feature rich logger for printing to the console and/or a logfile.

## NPM Development Packages
### chai
Assertion library for test-driven development

### mocha
Unit test framework