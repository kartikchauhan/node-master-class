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

helpers.createRandomString = function(strLength)
{
    strLength = typeof(strLength) == 'number' && strLength == 20 ? strLength : 20;
    const acceptableCharacters = "qwertyuioplkjhgfdsazxcvbnm0897645312";
    let str = "";
    for(let i=0; i<20; i++)
    {   
        const randomCharacter = acceptableCharacters.charAt(Math.floor(Math.random() * acceptableCharacters.length));
        str += randomCharacter;
    }
    return str;
}

module.exports = helpers;