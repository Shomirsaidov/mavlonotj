const Validate = require('./validate');
const bcrypt = require('bcrypt');
const knex = require('knex');
const knexConfig = require('../../knexfile').development;
const knexInstance = knex(knexConfig);
const Jwt = require('jsonwebtoken');
require('dotenv').config()

exports.plugin = {
    name: 'Creating a user',
    version: '1.0.0',
    register: async (server, options) => {
        server.route([
            {
                path: '/auth/register',
                method: 'POST',
                config: {
                    handler: async (request, h) => {
                        let token;

                        try {
                            const { name, password, role } = request.payload;

                            const existingUser = await knexInstance('users').where({ name }).first();
                            if (existingUser) {
                                return h.response('User already exists').code(400);
                            }

                            const hashedPassword = await bcrypt.hash(password, 10);

                            const payload = {
                                name,
                                role
                            };
                            token = Jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '14d' });

                            let finalPayload = request.payload
                            finalPayload.password = hashedPassword

                            await knexInstance('users').insert( finalPayload );
                        } catch (error) {
                            console.error('Error registering user:', error);
                            return h.response('Internal Server Error').code(500);
                        }

                        return token;
                    },
                    tags: ['api'],
                    description: 'Creating a user',
                    validate: Validate,
                    auth: false
                }
            }
        ]);
    }
};
