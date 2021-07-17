
const Joi = require('joi');
const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        autopopulate:{"select" : "-password -isDeleted", maxDepth: 1}
    },
    image: {
        type: String,
        validate: {
            validator: function(value) {
              const urlPattern = /(http|https):\/\/(\w+:{0,1}\w*#)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%#!\-/]))?/;
              const urlRegExp = new RegExp(urlPattern);
              return value.match(urlRegExp);
            },
            message: props => `${props.value} is not a valid URL`
          }
    },
    content:{
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
});

const Update = mongoose.model('Update', updateSchema);

function validateUpdate(update){
    const schema = Joi.object({
        userId: Joi.objectId().required(),
        image: Joi.string(),
        content: Joi.string().required(),
        dateCreated: Joi.date(),
        isDeleted: Joi.boolean()

    });
    
    return schema.validate(update);
}

module.exports.Update = Update;
module.exports.validate = validateUpdate;