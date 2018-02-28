# Challenge Response Server
![version 0.0.1](https://img.shields.io/badge/version-0.0.1-red.svg)

This is a simple web application which provides a RESTful API service with the following capabilities:
* User registration, including email verification
* User change password/recover password if forgotten
* Public key upload
* Public key retrieval by any party for a specified email address

It is used to support the Challenge Response Mobile Application developed in tandem with the application.

Installation
-----------------------------------
1. Place the application on your web server
2. Run `npm install` to install dependencies
3. Copy .env.example to .env and edit, you will need a MongoDB database
4. Install pm2 (Node Process Manager, this will keep your process running even when you exit command line): `npm install pm2@latest -g`
5. Run `pm2 start server.js` to start the server, you can run `pm2 monit` to monitor the server. More pm2 info here: http://pm2.keymetrics.io/docs/usage/quick-start/

License
-----------------------------------
Distributed under the MIT license, see LICENSE for a copy of the MIT license