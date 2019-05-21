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
      if (contactAttached) return res.json({ success: true, data: contactAttached, newuser: false, message: 'Contact Attached!'});

      const contact = await user.setOrCreateContact(req.body);
      res.json({ success: true, data: contact, newuser: true, message: 'Contact created!'});

    } catch (err) {
      logger.error(err);
      console.log(err);
      res.json({ success: false, message: 'Internal error'}).status(500);
    }
  };

  static async detachContact(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.params, UserSchemas.userAndContact);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message:'User not found.'});

      await user.detachContact(req.params.contact_id);

      res.json({ success: true, message: 'Contact deleted!' , data: []});
    } catch (err) {
      logger.error(err);
      res.json({ success: false, message: 'Internal error'}).status(500);
    }
  };

//transfer
  static async transferMoney(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.params, UserSchemas.id);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      //verificar se o usuario existe
      const user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message:'User not found.'});

      //verifica se o contato existe
      const contact = await User.getContactById(req.body.contact_id);
      if (!contact) return res.status(404).json({ success: false, message:'Contact not found.'});

      const transfer = await user.transferMoney(req.body.contact_id, req.body.value);

      res.json({ success: true, message: 'Successful transfer!' , data: []});
    } catch (err) {
      logger.error(err);
      res.json({ success: false, message: 'Internal error'}).status(500);
    }
  };

  static async getTransfers(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.params, UserSchemas.id);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message:'User not found!'});

      res.json({ success: true, data: await user.getTransfers() });

    } catch (err) {
      logger.error(err);
      res.json({ success: false, message: 'Internal error'}).status(500);
    }
  };

}

module.exports = UserController;