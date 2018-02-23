# Challenge Response Server
![version 0.0.1](https://img.shields.io/badge/version-0.0.1-red.svg)

This is a simple web application which provides a RESTful API service with the following capabilities:
* User registration with a public key, including email verification
* Public key retrieval by any party who has a valid email address

It is used to support the Challenge Response Mobile Application developed in tandem with the application.

Installation
-----------------------------------
1. Place the application on your web server
2. Run `npm install` to install dependencies
3. Copy .env.example to .env and edit, you will need a MongoDB database
4. Run `node server.js` to start the server

License
-----------------------------------
Distributed under the MIT license, see LICENSE for a copy of the MIT license