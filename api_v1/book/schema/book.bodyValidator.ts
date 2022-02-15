import Joi from 'joi';
import isObjectId from '../../../utils/joi.isObjectId';

export const createBookBodyValidator = Joi.object({
    title: Joi.string().required(),
    authors: Joi.array().items(Joi.custom(isObjectId)).required(),
    yearOfPublication: Joi.number().integer().strict().required(),
    languages: Joi.array().items(Joi.string()).required(),
    description: Joi.string()
});

export const updateBookBodyValidator = Joi.object({
    title: Joi.string(),
    authors: Joi.array().items(Joi.custom(isObjectId)),
    yearOfPublication: Joi.number().integer().strict(),
    languages: Joi.array().items(Joi.string()),
    description: Joi.string()
});
