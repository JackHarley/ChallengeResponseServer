'use strict';

const assert = require('assert');
const randomString = require('randomstring');

module.exports.postBegin = async function(req, res) {
    const email = req.body.email;

    if (email == null) {
        res.status(400).send('You must provide an email').end();
        return;
    }

    try {
        // check email exists and is verified
        const users = await db.collection('users').find({email: email, verified: true}).toArray();
        if (users.length < 1) {
            res.status(404).send('Email address does not exist.').end();
            return;
        }

        // insert new record
        const challengeId = randomString.generate({length: 16, charset: 'numeric'});
        const pin = randomString.generate({length: 4, charset: 'numeric'});

        const r = await db.collection('challenges').insertOne({
            challenge_id: challengeId,
            recipient_email: email,
            pin: pin,
            blob: randomString.generate({length: 256, charset: 'alphanumeric', capitalization: 'lowercase'}),
            verified: false,
            date: new Date()
        });

        // verify
        assert.equal(r.insertedCount, 1);

        // return new data
        res.status(201).json({
            'challenge_id': challengeId,
            'pin': pin
        }).send();
    } catch(err) {
        res.status(500).send('Failed to initiate challenge, please try again later..').end();
        logger.error('Failed to initiate challenge.');
    }
};

module.exports.getLookup = async function(req, res) {
    const email = req.query.email;
    const pin = req.query.pin;

    if ((email == null) || (pin == null)) {
        res.status(400).send('You must provide an email and PIN.').end();
        return;
    }

    try {
        // try find a challenge
        const challenges = await db.collection('challenges').find({
            recipient_email: email,
            pin: String(pin),
            verified: false,
            date: {$gte: new Date(new Date() - (300 * 1000))} // only challenges < 5 minutes old are valid
        }).toArray();
        if (challenges.length < 1) {
            res.status(404).send('No challenges awaiting this user with the specified PIN.').end();
            return;
        }

        // return data
        res.status(200).json({
            challenge_id: challenges[0].challenge_id,
            blob: challenges[0].blob
        }).send();
    } catch(err) {
        res.status(500).send('Failed to lookup challenge, please try again later..').end();
        logger.error('Failed to lookup challenge.');
    }
};

module.exports.get = async function(req, res) {
    const challengeId = req.params.challengeId;
    const pin = req.query.pin;

    if ((challengeId == null) || (pin == null)) {
        res.status(400).send('You must provide a challenge ID and PIN.').end();
        return;
    }

    try {
        // try find a challenge
        const challenges = await db.collection('challenges').find({challenge_id: challengeId, pin: String(pin)}).toArray();
        if (challenges.length < 1) {
            res.status(404).send('No challenges matching your query.').end();
            return;
        }

        // determine status
        let status = 0;
        if (challenges[0].verified === true)                                            status = 1;
        else if (new Date(challenges[0].date) < new Date(new Date() - (300 * 1000)))    status = -1;

        res.status(200).json({
            status: status
        }).send();
    } catch(err) {
        res.status(500).send('Failed to query challenge, please try again later.').end();
        logger.error('Failed to query challenge.');
    }
};

module.exports.postComplete = async function(req, res) {
    const challengeId = req.params.challengeId;
    const pin = req.body.pin;
    const signature = req.body.signature;

    if ((challengeId == null) || (pin == null) || (signature == null)) {
        res.status(400).send('You must provide a challenge ID, pin and signature.').end();
        return;
    }

    try {
        // pull the challenge
        const challenges = await db.collection('challenges').find({
            challenge_id: challengeId,
            pin: String(pin),
            verified: false,
            date: {$gte: new Date(new Date() - (300 * 1000))} // only challenges < 5 minutes old are valid
        }).toArray();
        if (challenges.length < 1) {
            res.status(404).send('No valid challenge as specified, awaiting response.').end();
            return;
        }

        // verify sig
        if (signature !== challenges[0].blob) {
            res.status(403).send('Invalid signature.').end();
            return;
        }

        // mark verified
        let r = await db.collection('challenges').updateOne({
            challenge_id: challengeId,
            pin: String(pin),
            verified: false,
        }, {$set: {
            verified: true
        }});

        // verify
        assert.equal(r.matchedCount, 1);
        assert.equal(r.modifiedCount, 1);

        res.status(200).send();
    } catch(err) {
        res.status(500).send('Failed to complete challenge, please try again later.').end();
        logger.error('Failed to complete challenge.');
    }
};