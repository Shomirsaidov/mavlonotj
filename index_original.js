const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwaggered = require('hapi-swaggered');
const HapiSwaggeredUI = require('hapi-swaggered-ui');
const knexConfig = require('./knexfile.js')
const knex = require('knex')(knexConfig.development)
const Jwt = require('@hapi/jwt')

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
          response.output.headers['Access-Control-Allow-Origin'] = 'https://hapi.dev';
          response.output.headers['Access-Control-Allow-Header'] = '*';

        } else {
          // Non-error response, add CORS headers
          response.headers['Access-Control-Allow-Origin'] = 'https://hapi.dev';
          response.headers['Access-Control-Allow-Headers'] = '*';

      }
      return h.continue;
    });

    await server.register(Jwt)



    server.auth.strategy('my_jwt_strategy', 'jwt', {
      keys: 'some_shared_secret',
      verify: {
          aud: 'urn:audience:test',
          iss: 'urn:issuer:test',
          sub: false,
          nbf: true,
          exp: true,
          maxAgeSec: 14400, // 4 hours
          timeSkewSec: 15
      },
      validate: (artifacts, request, h) => {
        console.log('Validation: Start');
        console.log('Decoded JWT:', artifacts.decoded);

        // Your validation logic here...

        console.log('Validation: End');

        return { isValid: true }; // Replace with your actual validation result
      }
    
    });




    server.auth.default('my_jwt_strategy');

    server.route({
        method: 'POST',
        path: '/login',
        handler: async (request, h) => {
            // Replace this logic with actual user authentication
            const { username, password } = request.payload;
            if (username === 'exampleUser' && password === 'examplePassword') {
                // Generate JWT token upon successful authentication
                const token = Jwt.token.generate({ user: username }, 'some_shared_secret');
                return { token };
            } else {
                return h.response({ message: 'Invalid credentials' }).code(401);
            }
        },
        options: {
          auth: false
        }
    });

    server.route({
        method: 'POST',
        path: '/register',
        handler: async (request, h) => {
            console.log('requested !')
            // Replace this logic with actual user registration
            const { username, password } = request.payload;
            // Implement user registration logic here, such as saving user to database
            
            // Generate JWT token upon successful registration
            const token = Jwt.token.generate({ user: username }, 'some_shared_secret');
            console.log(token)
            return { token };
        },
        options: {
          auth: false,
          cors: {
            origin: ['*'],
            headers: ['*'],
            credentials: true
          }
        }
    });

    server.route({
      method: 'GET',
      path: '/',
      handler: (request, h) => {
          const headers = request.headers;
          console.log('Request Headers:', headers);
          return 'Hello, World!';
      }
    });



    await server.register([require('./posts/posts_list'), 
                          require('./posts/posts_insert')]);
    await server.register([
        Inert,
        Vision,
        {
          plugin: HapiSwaggered,
          options: {
            info: {
              title: 'Test API Documentation',
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
       

    await server.start();
    console.log('Server started on port 4545 !');
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();







