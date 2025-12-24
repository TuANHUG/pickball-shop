import Joi from "joi";

export const productSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(1).required(),
    price: Joi.number().positive().required(),
    discount: Joi.number().min(0).max(100).default(0),
    quantity: Joi.number().integer().min(0).required(),
    status: Joi.string().valid("active", "inactive").default("active"),
    tags: Joi.array().items(Joi.string()).min(1).required(),
});
