const Joi = require('@hapi/joi');
const id = {
    id : Joi.number().integer().required(),
};

const user = {
    name : Joi.string().min(3).required(),
    document: Joi.string().required()
};

const deleteContact = {
    id : Joi.number().integer().required(),
    contact_id : Joi.number().integer().required(),
};

class Schema {
    static validate(obj, schema){
        return Joi.validate(obj, schema);
      }
  }
  
module.exports = {Schema, id, user, deleteContact};