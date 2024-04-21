const Validate = require('./validate')
const knex = require('knex')
const knexConfig = require('../../knexfile').development
const knexInstance = knex(knexConfig)

exports.plugin = {
    name: 'Poem getting route',
    version: '1.1.0',
    register: async (server, options) => {
        server.route([
            {
                path: '/poem',
                method: 'POST',
                config: {
                    handler: async (request, h) => {
                        const poem_data = await knexInstance('poems').where('id', request.payload.id)
                        return poem_data
                    },
                    tags: ['api'],
                    description: 'Just a test route !',
                    validate: Validate
                },

            },

        ])
    }
}