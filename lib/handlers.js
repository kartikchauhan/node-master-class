const _data = require('./data');
const helpers = require('./helpers');

const handler = {};

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

handler._user.get = function() {

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

handler.ping = function(data, callback) {
    callback(200);
}

handler.notFound = function(data, callback) {
    callback(404, {});
}

module.exports = handler;