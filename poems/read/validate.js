'use strict'

const Joi = require('@hapi/joi')

module.exports = {
    payload: Joi.object({
        id: Joi.number().required(),
    })
}