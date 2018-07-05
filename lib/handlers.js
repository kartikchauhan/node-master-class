const _data = require('./data');
const helpers = require('./helpers');
const config = require('./../config');

const handler = {};

// user handler

handler.user = function(data, callback) {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1)
    {
        handler._user[data.method](data, callback);
    }
    else
    {
        callback(403);
    }
};

handler._user = {};

handler._user.get = function(data, callback) {
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    const id = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
    if(id && phone)
    {
        handler._token.verifyToken(id, phone, function(tokenMatch) {
            if(!tokenMatch)
            {
                callback(403, {'error': 'phone and token do not match'});
            }
            else
            {
                _data.read('users', phone, function(err, data) {
                    if(err)
                    {
                        callback(500, {'error': "Coudn't fetch the data"});
                    }
                    else
                    {
                        console.log('reached here');
                        delete data.password;
                        delete data.tosAgreement;
                        callback(200, data);
                    }
                });
            }
        });
    }
    else
    {
        callback(403, {'error': 'missing token or phone'});
    }
};

handler._user.post = function(data, callback) {
    let firstname = typeof(data.payload.firstname) == 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false;
    let lastname = typeof(data.payload.lastname) == 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false;
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 1 ? data.payload.password.trim() : false;
    let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
    if(firstname && lastname && phone && password && tosAgreement)    
    {
        _data.read('users', phone, function(err, data) {
            // err means that there doesn't any user with phone number = payload.phone
            if(err)
            {
                const hashedPassword = helpers.hash(password);

                if(hashedPassword)
                {
                    var userObj = {
                        firstname,
                        lastname,
                        phone,
                        'password': hashedPassword,
                        'tosAgreement': true
                    };

                    _data.write('users', phone, userObj, function(err) {
                        if(err)
                        {
                            console.log('Error writing data to file');
                            callback(500, {'Error': "Couldn't create a new user"});
                        }
                        else
                        {
                            callback(200, {'Message': 'User successfully registered'});
                        }

                    });
                }
                else
                {
                    callback(500, {'Error': "Couldn't create a new user"});
                }
            }
            else
            {
                callback(400, {'error': 'User already exists'});
            }

        });
    }
    else
    {
        callback(400, {'error': 'You must provide full information'});
    }

};

handler._user.put = function(data, callback) {
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const id = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
    if(!phone)
    {
        callback(403, {'error': 'Not a registered user'});
    }
    else
    {
        let firstname = typeof(data.payload.firstname) == 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false;
        let lastname = typeof(data.payload.lastname) == 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false;
        let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 1 ? data.payload.password.trim() : false;

        _data.read('users', phone, function(err, data) {
            if(err)
            {
                callback(500, {'error': "Couldn't fetch your data"});
            }
            else
            {
                

                handler._token.verifyToken(id, phone, function(tokenMatch) {
                    if(!tokenMatch)
                    {
                        callback(403, {'error': 'phone and token do not match'});
                    }
                    else
                    {
                        if(firstname)
                            data.firstname = firstname;
                        if(lastname)
                            data.lastname = lastname;
                        if(password)
                            data.password = helpers.hash(password);
        
                        _data.update('users', phone, data, function(err) {
                            if(err)
                            {
                                callback(500, {'error': "Couldnl't update your data"});                        
                            }
                            else
                            {
                                callback(200, 'Information updated successfully');
                            }
                        });                        
                    }
                });
            }
        });
    }
};

handler._user.delete = function(data, callback) {
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(!phone)
    {
        callback(403, {'error': 'Not a registered user'});
    }
    else
    {
        const id = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

        handler._token.verifyToken(id, phone, function(tokenMatch) {
            if(!tokenMatch)
            {
                callback(403, {'error': 'phone and token do not match'});
            }
            else
            {
                _data.read('users', phone, function(err, data) {
                    if(err)
                    {
                        callback(500, {'error': "Couldn't fetch your data"});
                    }
                    else
                    {
                        _data.delete('users', phone, function(err) {
                            if(err)
                            {
                                callback(500, {'error': "Trouble deleting your account"});
                            }
                            else
                            {
                                callback(200);
                            }
                        });
                    }
                });ffffff
            }
        });
    }
};

handler.token = function(data, callback) {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1)
    {
        handler._token[data.method](data, callback);
    }
    else
    {
        callback(403);
    }
};

handler._token = {};

handler._token.get = function(data, callback) {
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id)
    {
        _data.read('tokens', id, function(err, tokenData) {
            if(err)
            {
                callback(400, {'error': 'You must set a token first'});
            }
            else
            {
                callback(200, tokenData);
            }
        });
    }
    else
    {
        callback(400, {'error': 'Missing tokenId'});
    }
};

handler._token.put = function(data, callback) {
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id : false;
    const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if(id && extend)
    {
        _data.read('tokens', id, function(err, tokenData) {
            if(err)
            {
                callback(400, {'error': 'Could not fetch your data'});
            }
            else
            {
                const expiry = Date.now() + 1000 * 60 * 60;
                tokenData.expiry = expiry;
                _data.update('tokens', id, tokenData, function(err) {
                    if(err)
                    {
                        callback(500, {'error': 'Error extending the token expiration time'});
                    }
                    else
                    {
                        callback(200, {'message': 'token expiration time extended successfully'});
                    }
                });
            }
        });
    }
    else
    {
        callback(400, {'error': 'You can only extend the token expiration time'});
    }
};

handler._token.post = function(data, callback) {
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 1 ? data.payload.password.trim() : false;
    if(phone && password)
    {
        _data.read('users', phone, function(err, data) {
            if(err)
            {
                callback(400, {'error': 'user does not exists'});
            }
            else
            {
                const hashedPassword = helpers.hash(password);
                if(hashedPassword == data.password)
                {
                    const tokenId = helpers.createRandomString(20);
                    const expiry = Date.now() + 1000 * 60 * 60;
                    const tokenObj = {
                        tokenId,
                        phone,
                        expiry
                    };
                    _data.write('tokens', tokenId, tokenObj, function(err) {
                        if(err)
                        {
                            callback(500, {'error': 'Error writing to the file'});
                        }
                        else
                        {
                            callback(200, tokenObj);
                        }
                    });
                }
                else
                {
                    callback(400, {'error': 'Passwords do not match'});
                }
            }
        });
    }
    else
    {
        callback(400, {'error': 'missing credentials'});
    }
};

handler._token.delete = function(data, callback) {
    let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(!id)
    {
        callback(403, {'error': 'Token doesn\'t exists'});
    }
    else
    {
        _data.read('tokens', id, function(err, data) {
            if(err)
            {
                callback(500, {'error': "Couldn't fetch your token data"});
            }
            else
            {
                _data.delete('tokens', id, function(err) {
                    if(err)
                    {
                        callback(500, {'error': "Trouble deleting your token"});
                    }
                    else
                    {
                        callback(200, {'error': 'logged out successfully'});
                    }
                });
            }
        });
    }
};

handler.check = function(data, callback) {
    const acceptableMethods = ['get', 'post', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1)
    {        
        handler._check[data.method](data, callback);
    }
    else
    {
        callback(403);
    }
};

handler._check = {};

handler._check.post = function(data, callback) {
    const protocol = typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds > 0 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
    const url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
    
    console.log(protocol, method, timeoutSeconds, url, successCodes);
    
    if(protocol && method && timeoutSeconds && url && successCodes)
    {
        const token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
        if(token)
        {
            _data.read('tokens', token, function(err, tokenData) {
                if(err)
                {
                    callback(500, {'error': 'Error fetching token information'});
                }
                else
                {
                    const phone = tokenData.phone;                    

                    _data.read('users', phone, function(err, userData) {
                        if(err)
                        {
                            callback(500, {'error': 'Error fetching your data'});
                        }
                        else
                        {
                            const checks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                            
                            if(checks.length < 5)
                            {
                                const checkId = helpers.createRandomString(20);
                                const checkObj = {
                                    protocol,
                                    method,
                                    url,
                                    successCodes,
                                    timeoutSeconds
                                };

                                _data.write('checks', checkId, checkObj, function(err) {
                                    if(err)
                                    {
                                        callback(500, {'error': 'Error creating new check'});
                                    }
                                    else
                                    {
                                        checks.push(checkId);
                                        userData.checks = checks;

                                        _data.update('users', phone, userData, function(err) {
                                            if(err)
                                            {
                                                callback(500, {'error': 'Error writing data to file'});
                                            }
                                            else
                                            {
                                                callback(200, checkObj);
                                            }
                                        });
                                    }
                                });
                            }
                            else
                            {
                                callback(400, {'error': `Can't create more checks. Maximum limit ${config.maxChecks}`});
                            }
                        }
                    });
                }
            });

        }
        else
        {
            callback(403, {'error': 'Unauthorized user'});
        }
    }
    else
    {
        callback(400, {'error': 'missing information'});
    }
};

handler._token.verifyToken = function(id, phone, callback) {

    _data.read('tokens', id, function(err, tokenData) {
        if(err)
        {
            callback(false);
        }
        else
        {
            if(tokenData.phone == phone && tokenData.expiry > Date.now())
            {
                callback(true);
            }
            else
            {
                callback(false);
            }
        }
    });        
};

handler.ping = function(data, callback) {
    callback(200);
}

handler.notFound = function(data, callback) {
    callback(404, {});
}

module.exports = handler;