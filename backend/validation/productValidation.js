import Joi from "joi";

export const productSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(1).required(),
    price: Joi.number().positive().required(),
    tags: Joi.array().items(Joi.string()).min(1).required(),
});
