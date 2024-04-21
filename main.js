const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwaggered = require('hapi-swaggered');
const HapiSwaggeredUI = require('hapi-swaggered-ui');
const Jwt = require('jsonwebtoken');
const JwtSecret = 'muftailun2006';
const JwtAuth = require('hapi-auth-jwt2');

const validate = async (decoded, request) => {
    // Check if the token is valid and user is authorized
    // You can perform database lookup, etc. here
    return { isValid: true };
};

const init = async () => {
    const server = Hapi.Server({
        port: 4545,
        host: 'localhost',
        "routes": {
            "cors": {
                "origin": ["*"],
                "headers": ["Accept", "Content-Type"],
                "additionalHeaders": ["X-Requested-With"]
            }
        }
    });

    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response.isBoom) {
            // Error response, add CORS headers
            response.output.headers['Access-Control-Allow-Origin'] = '*';
            response.output.headers['Access-Control-Allow-Header'] = '*';
        } else {
            // Non-error response, add CORS headers
            response.headers['Access-Control-Allow-Origin'] = '*';
            response.headers['Access-Control-Allow-Headers'] = '*';
        }
        return h.continue;
    });

    await server.register([
      require('./poems/create'),
      require('./poems/read'), 
      require('./poems/delete'),
      require('./poems/update')
    ]);

    await server.register([
        JwtAuth,
        Inert,
        Vision,
        {
            plugin: HapiSwaggered,
            options: {
                info: {
                    title: 'Mavlono.tj API documentation',
                    version: '1.0.0',
                },
            },
        },
        {
            plugin: HapiSwaggeredUI,
            options: {
                title: 'Swagger UI',
                path: '/docs',
            },
        },
    ]);

    server.auth.strategy('jwt', 'jwt', {
        key: "muftailun2006",
        validate,
        verifyOptions: { algorithms: ['HS256'] }
    });

    server.auth.default('jwt')

    server.route([
        {
            method: 'POST',
            path: '/register',
            config: {
                handler: async (request, h) => {
                  try {
                    const { username, password } = request.payload;
                    const payload = {
                        username,
                        role: 'user' // Assuming all registered users have the 'user' role
                    };
                    const token = Jwt.sign(payload, JwtSecret, { expiresIn: '14d' });

                    
                    return { token };
                  } catch (error) {
                      console.error('Error registering user:', error);
                      return h.response('Internal Server Error').code(500);
                  }
                },
                tags: ['api'],
                description: 'Registration route',
                auth: false
            },
        },
        {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                const headers = request.headers;
                console.log('Request Headers:', headers);
                return 'Hello, World!';
            }
        }
    ]);

    await server.start();
    console.log('Server started on port 4545!');
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
