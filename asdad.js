'use strict';

const Hapi = require('hapi');
const HapiAuth = require('hapi-auth-jwt2');
const JWT = require('jsonwebtoken');

let user = {
  id: 1,
  name: 'Chai Phonbopit'
};

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

const init = async () => {
  await server.register(HapiAuth);

  server.auth.strategy('jwt', 'jwt', {
    key: 'mysecretKey',
    validate: validate,
    verifyOptions: { algorithms: ['HS256'] }
  });

  server.auth.default('jwt');

  server.route({
    method: 'GET',
    path: '/register',
    config: {
      auth: false
    },
    handler: (request, h) => {

      let token = JWT.sign(user, 'mysecretKey', {
        expiresIn: '7d'
      });

      // Gen token
      return { token };
    }
  });

  server.route({
    method: 'GET',
    path: '/me',
    handler: (request, h) => {
      return request.auth.credentials;
    }
  });

  await server.start();
  console.log("Server is running");
};

const validate = (decoded, request, h) => {
//   if (decoded.name === 'Chai Phonbopit') {
//     return { isValid: true };
//   } else {
//     return { isValid: false };
//   }

    return {isvalide: true}
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
