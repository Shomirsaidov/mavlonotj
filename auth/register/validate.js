'use strict'

const Joi = require('@hapi/joi')

module.exports = {
    payload: Joi.object({
        name: Joi.string().required(),
        password: Joi.string().required(),
        role: Joi.string().required()
    })
}

// {"text": "sdf","author": "", "likes": 0, "date": "sfdads","tags": "ffsdf"}