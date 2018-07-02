const _data = require('./data');
const helpers = require('./helpers');

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
    if(!phone)
    {
        callback(400, {'error': "You must provide your phone number"});            
    }
    else
    {
        console.log('reached here');
        _data.read('users', phone, function(err, data) {
            if(err)
            {
                callback(500, {'error': "Coudn't fetch the data"});
            }
            else
            {
                console.log(data);
                delete data.password;
                delete data.tosAgreement;
                callback(200, data);
            }
        });
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
};

handler._user.delete = function(data, callback) {
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(!phone)
    {
        callback(403, {'error': 'Not a registered user'});
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

handler.ping = function(data, callback) {
    callback(200);
}

handler.notFound = function(data, callback) {
    callback(404, {});
}

module.exports = handler;