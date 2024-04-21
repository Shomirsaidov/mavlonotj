const Validate = require('./validate');
const knex = require('knex');
const knexConfig = require('../../knexfile').development;
const knexInstance = knex(knexConfig);

exports.plugin = {
    name: 'Poem Update Operation',
    version: '1.0.0',
    register: async (server, options) => {
        server.route([
            {
                path: '/poem/edit/{id}',
                method: 'PATCH',
                config: {
                    handler: async (request, h) => {
                        const { id } = request.params;
                        try {
                            const operation = await knexInstance('poems')
                                .where({ id })
                                .update(request.payload);
                            return h.response(operation).code(200);
                        } catch (error) {
                            return h.response({ error: error.message }).code(500);
                        }
                    },
                    tags: ['api'],
                    description: 'Update a poem by ID',
                    validate: Validate
                }
            }
        ]);
    }
};
