var express = require('express');
const router = express.Router();
const UserController = require('../http/controllers/UserController');

router.get('/', UserController.list);

router.get('/:id', UserController.get);

router.post('/', UserController.create);

router.put('/:id', UserController.update);

router.delete('/:id', UserController.delete);

router.post('/:id/contact', UserController.createContact);

module.exports = router;
