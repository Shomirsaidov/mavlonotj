const Validate = require('./validate');
const knex = require('knex');
const knexConfig = require('../../knexfile').development;
const knexInstance = knex(knexConfig);

exports.plugin = {
    name: 'Poem Delete Operation',
    version: '1.0.0',
    register: async (server, options) => {
        server.route([
            {
                path: '/poem/delete/{id}',
                method: 'DELETE',
                config: {
                    handler: async (request, h) => {
                        const { id } = request.params;
                        try {
                            const operation = await knexInstance('poems')
                                .where({ id })
                                .del();
                            return h.response(operation).code(200);
                        } catch (error) {
                            return h.response({ error: error.message }).code(500);
                        }
                    },
                    tags: ['api'],
                    description: 'Delete a poem by ID',
                    validate: Validate
                }
            }
        ]);
    }
};
