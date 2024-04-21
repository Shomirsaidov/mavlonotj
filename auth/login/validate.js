'use strict'

const Joi = require('@hapi/joi')

module.exports = {
    payload: Joi.object({
        name: Joi.string().required(),
        password: Joi.string().required()
    })
}

