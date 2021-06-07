const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

// Prevent text that include html values
const sanitizeHtmlExtension = (joi)=>{
    return {
        type: "string",
        base: joi.string(),
        messages: {
            "string.escapeHTML": "{{#label}} can't include HTML!!"
        },
        rules:{
            escapeHTML:{
                validate(value, helpers){
                    const sanitizedValue = sanitizeHtml(value,{
                        allowedTags: [],
                        allowedAttributes: []
                    })
                    if(value !== sanitizedValue){
                        return helpers.error("string.escapeHTML",{value})
                    }

                }
            }
        }
    }
}
const Joi = BaseJoi.extend(sanitizeHtmlExtension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().min(0).required(),
        description: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewsSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        body: Joi.string().required().escapeHTML()
    }).required()
})



