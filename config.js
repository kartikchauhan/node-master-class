// setting environment variables

const environments = {};

environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'env_name': 'staging',
    'secretKey': 'stagingSecretKey'
};

environments.production = {
    'httpPort': 8080,
    'httpsPort': 8081,
    'env_name': 'production',
    'secretKey': 'productionSecretKey'
};

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

const env_to_export = typeof(environments[currentEnvironment]) != 'undefined' ? environments[currentEnvironment] : environments['staging'];

module.exports = env_to_export;



