import Joi from 'joi';

export const changePasswordBodyValidator = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
    newPasswordConfirmation: Joi.string().required()
});
