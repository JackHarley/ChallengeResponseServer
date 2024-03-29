'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;
const assert = require('assert');
const randomString = require('randomstring');
const userHelper = require('./../../helpers/userHelper');

module.exports.postRegisterUser = async function(req, res) {
    let email = req.body.email;
    let password = req.body.password;

    if ((email == null) || (password == null)) {
        res.status(400).send('You must provide an email and password').end();
        return;
    }

    try {
        // check for duplicate email
        let users = await db.collection('users').find({'email': email}).toArray();
        if (users.length > 0) {
            res.status(400).send('Email address is already used.').end();
            return;
        }

        // insert new record
        let key = randomString.generate({
            length: 32,
            charset: 'alphanumeric',
            capitalization: 'lowercase'
        });

        let r = await db.collection('users').insertOne({
            email: email,
            password_hash: await bcrypt.hash(password, saltRounds),
            verified: false,
            verification_key: key,
            date_registered: new Date()
        });

        // verify
        assert.equal(r.insertedCount, 1);

        // send verification email
        userHelper.sendVerificationEmail(email, key);

        res.status(201).send();
    } catch(err) {
        res.status(500).send('Failed to register user, please try again later.').end();
        logger.error('Failed to register user.');
    }
};

module.exports.getVerifyUser = async function(req, res) {
    let key = req.query.key;

    if (key == null) {
        res.status(400).sendFile('user/verification_failed.html', { root: __dirname + '/../../views' });
        return;
    }

    try {
        // search for user
        let users = await db.collection('users').find({
            verified: false,
            verification_key: key
        }).toArray();
        if (users.length === 0) {
            res.status(404).sendFile('user/verification_failed.html', { root: __dirname + '/../../views' });
            return;
        }

        // mark as verified
        let r = await db.collection('users').updateOne({
            verified: false,
            verification_key: key
        }, {$set: {
            verified: true
        }});

        // verify
        assert.equal(r.matchedCount, 1);
        assert.equal(r.modifiedCount, 1);

        res.status(200).sendFile('user/verification_complete.html', { root: __dirname + '/../../views' });
    } catch(err) {
        res.status(500).sendFile('user/verification_failed.html', { root: __dirname + '/../../views' });
        logger.error('Failed to verify user, please try again later.');
        console.log(err);
    }
};

module.exports.postResendVerificationEmail = async function(req, res) {
    let email = req.body.email;

    if (email == null) {
        res.status(400).send('You must provide an email.').end();
        return;
    }

    try {
        let users = await db.collection('users').find({
            email: email,
            verified: false
        }).toArray();

        if (users.length !== 1) {
            res.status(404).send('No such email address requiring verification found.').end();
            return;
        }

        // send verification email
        userHelper.sendVerificationEmail(email, users[0].verification_key);

        res.status(204).send();
    } catch(err) {
        res.status(500).send().end();
        logger.error('Failed to resend verification email, please try again later.');
        console.log(err);
    }
};

module.exports.postSetPassword = async function(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let newPassword = req.body.new_password;

    if ((newPassword == null) || (email == null) || (password == null)) {
        res.status(400).send('You must provide an email, password and new password').end();
        return;
    }

    try {
        let user = await userHelper.checkUser(email, password);
        if (user === false) {
            res.status(403).send('No such user exists, password incorrect, or not email verified.').end();
            return;
        }

        // set new password
        let r = await db.collection('users').updateOne({
            email: email
        }, {$set: {
            password_hash: await bcrypt.hash(newPassword, saltRounds)
        }});

        // verify
        assert.equal(r.matchedCount, 1);

        res.status(204).send();
    } catch(err) {
        res.status(500).send('Failed to change password, please try again later.').end();
        logger.error('Failed to change password.');
    }
};

module.exports.postForgotPassword = async function(req, res) {
    let email = req.body.email;

    if ((email == null) || (password == null)) {
        res.status(400).send('You must provide an email.').end();
        return;
    }

    try {
        // check for email existence
        let users = await db.collection('users').find({'email': email}).toArray();
        if (users.length === 0) {
            res.status(404).send('Email address is not found.').end();
            return;
        }

        // generate password reset key
        let key = randomString.generate({
            length: 32,
            charset: 'alphanumeric',
            capitalization: 'lowercase'
        });

        let r = await db.collection('users').updateOne({
            email: email
        }, {$set: {
            forgot_password_key: key,
            forgot_password_initiation: new Date()
        }});

        // verify
        assert.equal(r.updatedCount, 1);

        // send email
        userHelper.sendForgotPasswordEmail(email, key);

        res.status(201).send();
    } catch(err) {
        res.status(500).send('Failed to initiate password reset, please try again later.').end();
    }
};

module.exports.getForgotPassword = async function(req, res) {
    let key = req.query.key;

    if (key == null) {
        res.status(400).sendFile('user/password_reset_failed.html', { root: __dirname + '/../../views' });
        return;
    }

    try {
        // search for user
        let users = await db.collection('users').find({
            forgot_password_key: key
        }).toArray();
        if (users.length === 0) {
            res.status(404).sendFile('user/password_reset_failed.html', { root: __dirname + '/../../views' });
            return;
        }
        if (new Date(users[0].forgot_password_initiation) + 1000*60*60*24 < new Date()) {
            res.status(403).sendFile('user/password_reset_failed.html', { root: __dirname + '/../../views' });
            return;
        }

        // show form
        res.status(200).sendFile('user/password_reset.html', { root: __dirname + '/../../views' });
    } catch(err) {
        res.status(500).sendFile('user/password_reset_failed.html', { root: __dirname + '/../../views' });
    }
};

module.exports.postForgotPasswordComplete = async function(req, res) {
    let key = req.query.key;
    let password = req.body.new_password;
    let confirm_password = req.body.confirm_new_password;

    if ((key == null) || (password == null) || (confirm_password == null) || (password !== confirm_password)) {
        res.status(400).sendFile('user/password_reset_failed.html', { root: __dirname + '/../../views' });
        return;
    }

    try {
        // search for user
        let users = await db.collection('users').find({
            forgot_password_key: key
        }).toArray();
        if (users.length === 0) {
            res.status(404).sendFile('user/password_reset_failed.html', { root: __dirname + '/../../views' });
            return;
        }
        if (new Date(users[0].forgot_password_initiation) + 1000*60*60*24 < new Date()) {
            res.status(403).sendFile('user/password_reset_failed.html', { root: __dirname + '/../../views' });
            return;
        }

        // set new password
        let r = await db.collection('users').updateOne({
            forgot_password_key: key
        }, {$set: {
            password_hash: await bcrypt.hash(newPassword, saltRounds),
            forgot_password_key: undefined,
            forgot_password_initiation: undefined
        }});

        // verify
        assert.equal(r.matchedCount, 1);

        res.status(200).sendFile('user/password_reset_complete.html', { root: __dirname + '/../../views' });
    } catch(err) {
        res.status(500).sendFile('user/password_reset_failed.html', { root: __dirname + '/../../views' });
    }
};

module.exports.postCheckCredentials = async function(req, res) {
    let email = req.body.email;
    let password = req.body.password;

    if ((email == null) || (password == null)) {
        res.status(400).send('You must provide an email and password').end();
        return;
    }

    try {
        let user = await userHelper.checkUser(email, password);
        if (user === false) {
            res.status(200).send(false).end();
        } else {
            res.status(200).send(true).end();
        }
    } catch(err) {
        res.status(500).send('Failed to check credentials, please try again later.').end();
        logger.error('Failed to check credentials.');
    }
};