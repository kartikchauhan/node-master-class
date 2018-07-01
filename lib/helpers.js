const crypto = require('crypto');

const config = require('./../config');

const helpers = {};

helpers.hash = function(password) {
    const hashedPassword = crypto.createHmac('sha256', config.secretKey).update(password).digest('hex');
    return hashedPassword;
};

helpers.parseJSON = function(stringifiedJSON) {
    try
    {
        const obj = JSON.parse(stringifiedJSON);
        return obj;
    }
    catch(err)
    {
        return {};
    }
};

module.exports = helpers;