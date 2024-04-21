const Validate = require('./validate')
const knex = require('knex')
const knexConfig = require('../../knexfile').development
const knexInstance = knex(knexConfig)

exports.plugin = {
    name: 'Creating poem',
    version: '1.1.0',
    register: async (server, options) => {
        server.route([
            {
                path: '/poem/add',
                method: 'PUT',
                config: {
                    handler: async (request, h) => {
                        const operation = await knexInstance('poems').insert(request.payload)
                        return operation
                    },
                    tags: ['api'],
                    description: 'Creating a poem route',
                    validate: Validate
                },

            },

        ])
    }
}