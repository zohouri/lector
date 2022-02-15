import Joi from 'joi';

export const createAuthorBodyValidator = Joi.object({
    name: Joi.string().required(),
    birthDate: Joi.date().required(),
    deathDate: Joi.date(),
    bio: Joi.string(),
    avatarURL: Joi.string()
});

export const updateAuthorBodyValidator = Joi.object({
    name: Joi.string(),
    birthDate: Joi.date(),
    deathDate: Joi.date(),
    bio: Joi.string(),
    avatarURL: Joi.string()
});
