'use strict'

const Joi = require('@hapi/joi')

module.exports = {
    payload: Joi.object({
        text: Joi.string().required(),
        author: Joi.string().required(),
        likes: Joi.number(),
        date: Joi.string().required(),
        tags: Joi.string().required()
    })
}

// {"text": "sdf","author": "", "likes": 0, "date": "sfdads","tags": "ffsdf"}