# Endpoint Docs

* Where possible use JSON bodies for POST requests, urlencoded bodies will work as well
* A query parameter is one that should be passed in the URL, e.g. http://host/?key=value
* Please note that all endpoints can return a generic 500 INTERNAL SERVER ERROR in exceptional cases. This should be handled. It generally indicates a server malfunction.

POST /user/register
------------------------------
**Body:**
```json
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
```json
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
```json
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
```json
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
```json
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
```json
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
```json
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

POST /user/pubkey/generate
------------------------------
**Body:**
```json
{
    "email": "jackpharley@gmail.com",
    "password": "correcthorsebatterystaple"
}
```

Generates a fresh private key on the server, stores the public key on the server, returns the private key to the client, then discards the private key on the server side.

**Responses:**

* If a key is generated successfully, 201 CREATED with a body containing the private key:
```json
{
    "private_key": "--- BEGIN RSA PRIVATE KEY ---\n[...]\n--- END RSA PRIVATE KEY ---"
}
```
* If any of the body parameters are missing, 400 BAD REQUEST.
* If the provided email is not valid, the provided password is incorrect, or the account is not verified, 403 FORBIDDEN.

GET /user/pubkey?email=jackpharley@gmail.com
------------------------------
**Query Parameters:**

* email: Email address to fetch public key for.

Fetch a public key for a specified email address.

**Responses:**

* If a public key is found, 200 OK:
```json
{
    "email": "jackpharley@gmail.com",
    "public_key": "BIGFATRESAPRIVATEKEYTHINGYMAJIG",
    "date_key_updated": "2018-03-06T19:34:25.908Z"
}
```

* If no email address is provided, or an invalid email address, 400 BAD REQUEST.
* If an email address is provided but does not exist in the system/is not activated/does not have a public key on file, 404 NOT FOUND.

POST /challenge/begin
------------------------------
**Body:**
```json
{
    "email": "jackpharley@gmail.com"
}
```

Begin a challenge against the specified recipient's email.

**Responses:**

* If the email address exists and a challenge is successfully initiated, return 201 CREATED and the details of the challenge:

```json
{
    "challenge_id": "2882630291078996",
    "pin": 9018
}
```

* If no email address is provided, or an invalid email address, 400 BAD REQUEST.
* If an email address is provided but does not exist in the system/is not activated, 404 NOT FOUND.

GET /challenge/lookup
------------------------------
**Query Parameters:**

* email: Email address to look up awaiting challenge for
* pin: PIN of expected challenge

Check for a waiting challenge for the specified email address with the specified PIN.

**Responses:**

* If a challenge is found, 200 OK with challenge info:
```json
{
    "challenge_id": "2882630291078996",
    "blob": "y6oks2qi2wwhdv3cny3m5brecbji4q9ol9m45klb8fkvsmdf93ycpdfskgwpbvzru8ntg7chew4pa23qmha6q8nkzcw4i6l1f7uytgyrw15nulwb1dii43r23ijt84vkopcrthhjx4reyz9gug1t2fwmtwqs5oygnerdqeq5hvc8wljjeolkzopuyw914643tqy0fl6iq6z9gyecxnkyaa7ehn65jbgcg559zyxh7u21l80uo88dg3lnwzu2mfwr"
}
```

* If any query parameters are not provided, 400 BAD REQUEST.
* If a matching challenge could not be found, 404 NOT FOUND.

GET /challenge/9386727543489512?pin=1798
------------------------------
**Query Parameters:**

* pin: PIN of challenge

**URL Parameters:**

* challengeId: e.g. /challenge/{challengeId}?pin=x

Look up the status of a challenge.

**Responses:**

* If a challenge is found, 200 OK with challenge status code:
```json
{
    "status": 1
}
```

* If any query/url parameters are not provided, 400 BAD REQUEST.
* If a matching challenge could not be found, 404 NOT FOUND.

**Challenge Status Codes:**

* 1 - Challenge complete and verified.
* 0 - Not yet completed.
* -1 - Challenge failed (expired with no valid responses).

POST /challenge/9386727543489512/complete
------------------------------
**URL Parameters:**

* challengeId: e.g. /challenge/{challengeId}/complete

**Body:**
```json
{
    "pin": 9018,
    "signature": "cl0dgbh93usfqct16l8oax0z05dwne24arsdlnl6olkqqu2wapamxzcwyjbc0v6ix4vhxbha4ado8ttmxsmv7zga5jdyv3r6s8v2mmgpi0q7m49xf0zz2pl0hi"
}
```

Complete/respond to a challenge by sending back the decrypted blob data (i.e. the signature).

**Responses:**

* If the signature is verified and the challenge marked as completed successfully, 200 OK.
* If any query/body parameters are not provided, 400 BAD REQUEST.
* If the provided signature is invalid, 403 FORBIDDEN.
* If an email address is provided but does not exist in the system/is not activated, 404 NOT FOUND.