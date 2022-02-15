import Joi from 'joi';

export const loginAdminBodyValidator = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

export const userSignupBodyValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    passwordConfirmation: Joi.string().required()
});

export const loginUserBodyValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});
