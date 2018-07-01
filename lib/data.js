// This file can be used to perform CRUD operations on a file

const fs = require('fs');
const path = require('path');

const helpers = require('./helpers');

const data = {};
data.baseDir = path.join(__dirname, '/../.data');

// function for writing data to file
data.write = function(dir, filename, _data, callback) {
    fs.open(data.baseDir + '/' + dir + '/' + filename + '.json', 'wx', function(err, fileDescriptor) {
        if(err)
        {
            callback('Error opening the file');
            return false;
        }
        else
        {
            console.log(_data);
            const content = JSON.stringify(_data);
            console.log(content);
            console.log(fileDescriptor);
            fs.writeFile(fileDescriptor, content, function(err) {
                if(err)
                {
                    callback('Error writing to file');
                    return false;
                }
                else
                {
                    fs.close(fileDescriptor, function(err) {
                        if(err)
                        {
                            callback('Error closing the file');
                            return false;
                        }
                        else
                        {
                            callback(false);
                        }
                    });
                }
            });
        }
    });
};

// function for reading data from a file
data.read = function(dir, filename, callback) {
    fs.readFile(data.baseDir + '/' + dir + '/' + filename + '.json', 'utf-8', function(err, _data) {
        if(err)
        {
            callback(err, 'Error reading the data from the file');
            return false;
        }
        else
        {
            const content = helpers.parseJSON(_data);
            callback(false, content);
        }
    });
};

// function for updating data in a file
data.update = function(dir, filename, _data, callback) {
    fs.open(data.baseDir + '/' + dir + '/' + filename + '.json', 'r+', function(err, fileDescriptor) {
        if(err)
        {
            callback('Error opening the file');
            return false;
        }
        else
        {
            const content = JSON.stringify(_data);
            console.log(fileDescriptor);
            fs.ftruncate(fileDescriptor, function(err) {
                if(err)
                {
                    callback("Couldn't truncate the data of file");
                    return false;
                }
            });
            fs.writeFile(fileDescriptor, content, function(err) {
                if(err)
                {
                    callback('Error updating the file');
                    return false;
                }
                else
                {
                    fs.close(fileDescriptor, function(err) {
                        if(err)
                        {
                            callback('Error closing the file');
                            return false;
                        }
                        else
                        {
                            callback(false);
                        }
                    });
                }
            });
        }
    });
};

// function for deleting a file
data.delete = function(dir, filename, callback) {
    fs.unlink(data.baseDir + '/' + dir + '/' + filename + '.json', function(err) {
        if(err)
        {
            callback('Error deleting the file');
            return false;
        }
        else
        {
            callback(false);
        }
    });
};

module.exports = data;