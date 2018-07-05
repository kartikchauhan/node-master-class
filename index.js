// importing core modules
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const stringDecoder = require('string_decoder').StringDecoder;

// importing local modules
const config = require('./config');
const _data = require('./lib/data');
const helpers = require('./lib/helpers');
const handler = require('./lib/handlers');

const httpServer = http.createServer(function(req, res) {    
    unifiedServer(req, res);
});

httpServer.listen(config.httpPort, function(req, res) {
    console.log(`http server listening on port ${config.httpPort}`);
});

const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

const httpsServer = http.createServer(httpsServerOptions, function(req, res) {    
    unifiedServer(req, res);
});

httpsServer.listen(config.httpsPort, function(req, res) {
    console.log(`https server listening on port ${config.httpsPort}`);
});

const unifiedServer = function(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method.toLowerCase();
    const headers = req.headers;
    console.log(pathname);

    /* code for buffer/stream starts here */

    const decoder = new stringDecoder('utf-8');
    let buffer = '';

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    
    req.on('end', function() {
        buffer += decoder.end();
        const currentHandler = typeof(routes[pathname]) !== 'undefined' ? routes[pathname] : handler.notFound;
        const data = {
            pathname,
            'queryStringObject': parsedUrl.query,
            method,
            headers,
            'payload': helpers.parseJSON(buffer)
        };

        currentHandler(data, function(statusCode, payload) {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 403;
            payload = typeof(payload) == 'object' ? payload : {};
            const response = JSON.stringify(payload);
            console.log('statusCode ', statusCode);
            console.log('response ', response);
            res.setHeader('Content-Type', 'application/json');
            res.end(response);
        });
    });
    /* code for buffer/stream ends here */
    
    routes = {
        // /ping route for uptime monitoring 
        '/ping': handler.ping,        
        '/user': handler.user,
        '/token': handler.token,
        '/check': handler.check
    };
}
