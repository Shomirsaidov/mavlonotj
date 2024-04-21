const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const JwtAuth = require('hapi-auth-jwt2');
const JwtSecret = 'your-secret-key'; // Replace with your own secret key
const User = require('./models/User'); // Assuming you have a User model

const server = Hapi.server({
    port: 4545,
    host: 'localhost'
});

const validate = async (decoded, request) => {
    // Check if the token is valid and user is authorized
    // You can perform database lookup, etc. here
    return { isValid: true };
};

const init = async () => {
    await server.register(JwtAuth);

    server.auth.strategy('jwt', 'jwt', {
        keys: JwtSecret,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: 14400 // 4 hours
        },
        validate: validate
    });

    server.auth.default('jwt');

    // Registration Route
    server.route({
        method: 'POST',
        path: '/register',
        handler: async (request, h) => {
            try {
                // Extract user registration data from the request payload
                const { username, password } = request.payload;
                
                // Check if the username already exists
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    return h.response('Username already exists').code(400);
                }
                
                // Create a new user
                const newUser = new User({ username, password });
                await newUser.save();
                
                // Generate JWT token for the newly registered user
                const token = Jwt.sign({ username }, JwtSecret);
                
                return { token };
            } catch (error) {
                console.error('Error registering user:', error);
                return h.response('Internal Server Error').code(500);
            }
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();