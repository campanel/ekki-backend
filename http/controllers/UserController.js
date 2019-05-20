const User = require('../../models/User');
const UserSchemas = require('../request/UserSchemas');

class UserController {
  
  static async list(req, res) {
    try {
      const users = await User.getAll();
      res.json({ success: true, data: users});
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err}).status(500);
    }
    
  };

  static async get(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.params, UserSchemas.id);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const user = await User.getByIdWithContacs(req.params.id);

      if (!user) return res.status(404).json({ success: false, message:'User not found!'});

      res.json({ success: true, data: user });
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err }).status(500);
    }
  };
  
  static async create(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.body, UserSchemas.user);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const user = await User.create(req.body);
      res.json({ success: true, data: user, message: 'User created!'});
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err}).status(500);
    }
  };

  static async createContact(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.body, UserSchemas.user);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const user = await User.createContact(req.params.id, req.body);
      res.json({ success: true, data: user, message: 'Contact created!'});
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err}).status(500);
    }
  };

  static async update(req, res) {
    try {

      const { error } = UserSchemas.Schema.validate(req.params, UserSchemas.id);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const { errorB } = UserSchemas.Schema.validate(req.body, UserSchemas.user);
      if (errorB) return res.status(400).json({ success: false, message: error.details[0].message});

      let user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message:'Object not found.'});
      console.log(user.id);
      console.log(req.body);
      user = await User.update(user.id, req.body);
      res.json({ success: true, data: user, message: 'User updated!' });
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err}).status(500);
    }

  };

  static async delete(req, res) {
    try {
      const { error } = UserSchemas.Schema.validate(req.params, UserSchemas.id);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message});

      const user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message:'User not found.'});

      await User.deleteById(user.id);

      res.json({ success: true, message: 'User deleted!' , data: []});
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: err }).status(500);
    }
  };

}

module.exports = UserController;
