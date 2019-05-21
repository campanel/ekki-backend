const User = require('../../models/User');
const UserSchemas = require('../request/UserSchemas');
const logger = require('../../config/logger');

class UserController {
  
  static async list(req, res) {
    try {
      const users = await User.getAll();
      res.json({ success: true, data: users});
    } catch (err) {
      logger.error(err);
      res.json({ success: false, message: 'Internal error'}).status(500);
    }
  };

  static async get(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.params, UserSchemas.id);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const user = await User.getById(req.params.id);

      if (!user) return res.status(404).json({ success: false, message:'User not found!'});

      res.json({ success: true, data: user });
    } catch (err) {
      logger.error(err);
      res.json({ success: false, message: 'Internal error'}).status(500);
    }
  };
  
  static async create(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.body, UserSchemas.user);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const user = await User.create(req.body);
      res.json({ success: true, data: user, message: 'User created!'});

    } catch (err) {
      logger.error(err);
      res.json({ success: false, message: 'Internal error'}).status(500);
    }
  };

  static async update(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.params, UserSchemas.id);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const { errorB } = UserSchemas.Schema.validate(req.body, UserSchemas.user);
      if (errorB) return res.status(400).json({ success: false, message: error.details[0].message});

      let user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message:'User not found.'});
    
      user = await user.update(req.body);
      res.json({ success: true, data: user, message: 'User updated!' });
    } catch (err) {
      logger.error(err);
      res.json({ success: false, message: 'Internal error'}).status(500);
    }

  };

  static async delete(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.params, UserSchemas.id);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message:'User not found.'});

      await user.delete(user);

      res.json({ success: true, message: 'User deleted!' , data: []});
    } catch (err) {
      logger.error(err);
      res.json({ success: false, message: 'Internal error'}).status(500);
    }
  };

  static async getContacts(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.params, UserSchemas.id);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message:'User not found!'});

      res.json({ success: true, data: await user.getContacts() });

    } catch (err) {
      logger.error(err);
      res.json({ success: false, message: 'Internal error'}).status(500);
    }
  };

  static async setOrCreateContact(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.body, UserSchemas.user);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message:'User not found!'});

      //verificar se usuario ja foi add as contatos
      let contactAttached = await user.contactAttached(req.body);
      if (contactAttached) return res.json({ success: true, data: contactAttached, message: 'Contact Attached!'});

      const contact = await user.setOrCreateContact(req.body);
      res.json({ success: true, data: contact, message: 'Contact created!'});

    } catch (err) {
      logger.error(err);
      res.json({ success: false, message: 'Internal error'}).status(500);
    }
  };

}

module.exports = UserController;