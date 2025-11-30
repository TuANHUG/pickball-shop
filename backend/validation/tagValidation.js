import Joi from "joi";

export const tagSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    tag_group_id: Joi.string().required(),
    description: Joi.string().max(500).optional().allow(""),
});
