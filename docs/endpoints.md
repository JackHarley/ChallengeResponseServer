# Endpoint Docs

* Where possible use JSON bodies for POST requests, urlencoded bodies will work as well
* A query parameter is one that should be passed in the URL, e.g. http://host/?key=value
* Please note that all endpoints can return a generic 500 INTERNAL SERVER ERROR in exceptional cases. This should be handled. It generally indicates a server malfunction.

POST /user/register
------------------------------
**Body:**
```js
{
	"email": "jackpharley@gmail.com",
	"password": "qwertyuiop123"
}
```

Registers a new user account and sends a verification email to the specified email address with the verification link that must be clicked to complete registration.

**Responses:**

* If registration is successful, 201 CREATED.
* If an email address/password is not provided, 400 BAD REQUEST.
* If the email address is already taken, 400 BAD REQUEST.

POST /user/login
------------------------------
**Body:**
```js
{
	"email": "jackpharley@gmail.com",
	"password": "qwertyuiop123"
}
```

Checks the credentials against the database and returns whether they are valid or not.

**Responses:**

* If the user exists, is valid and is email verified, 200 OK with a body containing the string true
* Otherwise, 200 OK with a body containing the string false.
* If an email address/password is not provided, 400 BAD REQUEST.

GET /user/verify?key=x
------------------------------
**Query Parameters:**

* key: Verification key from email

Completes a user registration by verification key. This is a browser facing endpoint, it returns nicely formatted HTML.

**Responses:**

* If verification is successful, 200 OK and a verification complete message.
* If no key is provided, 400 BAD REQUEST and a verification failed message.
* If the provided key is not valid/already used, 404 NOT FOUND and a verification failed message.

POST /user/reverify
------------------------------
**Body:**
```js
{
	"email": "jackpharley@gmail.com"
}
```

Resends the verification email for the account belonging to the specified email address.

**Responses:**

* If resending is successful, 204 NO CONTENT.
* If no email is provided, 400 BAD REQUEST.
* If the provided email is not valid or is already verified, 404 NOT FOUND.

POST /user/password
------------------------------
**Body:**
```js
{
	"email": "jackpharley@gmail.com",
	"password": "qwertyuiop123",
	"new_password": "correcthorsebatterystaple"
}
```

Change the password for a user account.

**Responses:**

* If the password change is successful, 204 NO CONTENT.
* If any of the body parameters are missing, 400 BAD REQUEST.
* If the provided email is not valid, the provided password is incorrect, or the account is not verified, 403 FORBIDDEN.

POST /user/forgotpassword
------------------------------
**Body:**
```js
{
	"email": "jackpharley@gmail.com"
}
```

Begin the password reset process for an account. An email with instructions will be sent to the email address.

**Responses:**

* If the password reset process has been initiated successfully, 201 CREATED.
* If an email address is not provided, 400 BAD REQUEST.
* If the provided email does not exist in the system, 404 NOT FOUND

GET /user/forgotpassword?key=x
------------------------------
**Query Parameters:**

* key: Forgot password key from email

Shows the form for resetting your password for the account associated with the given key. This is a browser facing endpoint, it returns nicely formatted HTML.

**Responses:**

* If the key is valid and useable, 200 OK and shows the change password form.
* If key is not provided, 400 BAD REQUEST.
* If key does not exist, 404 NOT FOUND.
* If key is expired, 403 FORBIDDEN

POST /user/forgotpassword/complete?key=x
------------------------------
**Query Parameters:**

* key: Forgot password key from email

**Body:**
```js
{
	"new_password": "password123",
	"confirm_new_password": "password123",
}
```

Attempts to change the password for the account associated with the given forgot password key. This is a browser facing endpoint, it returns nicely formatted HTML.

**Responses:**

* If the password reset process has been completed successfully, 200 OK.
* If any query/body parameters are not provided, 400 BAD REQUEST.
* If key does not exist, 404 NOT FOUND.
* If key is expired, 403 FORBIDDEN

POST /user/pubkey
------------------------------
**Body:**
```js
{
	"email": "jackpharley@gmail.com",
	"password": "correcthorsebatterystaple",
	"public_key": "BIGFATRESAPRIVATEKEYTHINGYMAJIG"
}
```

Upload a public key to be held on file.

**Responses:**

* If the public key is updated successfully, 204 NO CONTENT.
* if the provided public key is the same as the one currently in the database, and therefore no change will occur, 200 OK.
* If any of the body parameters are missing, 400 BAD REQUEST.
* If the provided email is not valid, the provided password is incorrect, or the account is not verified, 403 FORBIDDEN.

GET /user/pubkey?email=jackpharley@gmail.com
------------------------------
**Query Parameters:**

* email: Email address to fetch public key for.

Fetch a public key for a specified email address.

**Responses:**

* If a public key is found, 200 OK:
```js
{
	"email": "jackpharley@gmail.com",
	"public_key": "BIGFATRESAPRIVATEKEYTHINGYMAJIG",
	"date_key_updated": "2018-03-06T19:34:25.908Z"
}
```

* If no email address is provided, or an invalid email address, 400 BAD REQUEST.
* If an email address is provided but does not exist in the system/is not activated/does not have a public key on file, 404 NOT FOUND.