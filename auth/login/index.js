const Validate = require('./validate');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
require('dotenv').config()
const knex = require('knex');
const knexConfig = require('../../knexfile').development;
const knexInstance = knex(knexConfig);

exports.plugin = {
    name: 'Log in for user',
    version: '1.0.0',
    register: async (server, options) => {
        server.route([
            {
                path: '/auth/login',
                method: 'POST',
                config: {
                    handler: async (request, h) => {
                        try {
                            const { name, password } = request.payload;

                            const user = await knexInstance('users')
                                .where({ name })
                                .first();

                            if (!user) {
                                return h.response('Invalid username or password').code(401);
                            }

                            const isPasswordValid = await bcrypt.compare(password, user.password);
                            if (!isPasswordValid) {
                                return h.response('Invalid username or password').code(401);
                            }

                            const payload = { name: user.name, role: user.role }; 
                            const token = Jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '14d' }); 

                            return { token };
                        } catch (error) {
                            console.error('Error logging in:', error);
                            return h.response('Internal Server Error').code(500);
                        }
                    },
                    tags: ['api'],
                    description: 'Log in route',
                    validate: Validate,
                    auth: false
                }
            }
        ]);
    }
};
