# Endpoint Docs

* Where possible use JSON bodies for POST requests, urlencoded bodies will work as well
* A query parameter is one that should be passed in the URL, e.g. http://host/?key=value

POST /user/register
------------------------------
Body:
```js
{
	"email": "jackpharley@gmail.com",
	"password": "qwertyuiop123"
}
```

Registers a new user account and sends a verification email to the specified email address with the verification link that must be clicked to complete registration.

PUT /user/verify?key=x
------------------------------
Query Parameters:
    * 'key': Verification key from email

Completes a user registration by verification key.

POST /user/reverify
------------------------------
Body:
```js
{
	"email": "jackpharley@gmail.com"
}
```

Resends the verification email for the account belonging to the specified email address.

POST /user/password
------------------------------
Body:
```js
{
	"email": "jackpharley@gmail.com",
	"password": "qwertyuiop123",
	"new_password": "correcthorsebatterystaple"
}
```

Change the password for a user account.

POST /user/pubkey
------------------------------
Body:
```js
{
	"email": "jackpharley@gmail.com",
	"password": "correcthorsebatterystaple",
	"public_key": "BIGFATRESAPRIVATEKEYTHINGYMAJIG"
}
```

Upload a public key to be held on file.

GET /user/pubkey?email=jackpharley@gmail.com
------------------------------
Query Parameters:
    * 'email': Email address to fetch public key for.

Fetch a public key for a specified email address.

Response, if a public key is found, 200 OK:
```js
{
	"email": "jackpharley@gmail.com",
	"public_key": "BIGFATRESAPRIVATEKEYTHINGYMAJIG",
	"date_key_updated": "2018-03-06T19:34:25.908Z"
}
```