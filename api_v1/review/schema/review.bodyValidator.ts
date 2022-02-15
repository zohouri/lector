import Joi from 'joi';
import isObjectId from '../../../utils/joi.isObjectId';

export const createReviewBodyValidator = Joi.object({
    book: Joi.custom(isObjectId).required(),
    score: Joi.number().integer().min(1).max(5).required(),
    content: Joi.string().max(250)
});

export const updateReviewBodyValidator = Joi.object({
    score: Joi.number().integer().min(1).max(5),
    content: Joi.string().max(250)
});
