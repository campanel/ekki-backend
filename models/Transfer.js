const Knex = require('knex');
const connection = require('../knexfile');
const { Model } = require('objection');
const knexConnection = Knex(connection)

Model.knex(knexConnection)

class Transfer extends Model {
  static get tableName() {
    return 'transfers';
  }

  static get relationMappings() {
    return {

    };
  }

  static getAll() {
    return this.query();
  }

  static getById(id) {
    return this.query().findById(id);
  }

  static getLast() {
    return this.query().orderBy('id', 'desc').first();
  }

  //tranfer
  static async attachWithMoney(user_id, contact_id, value) {
    const transfer = await Transfer.query().insert({
      user_id: user_id,
      contact_id: contact_id,
      value : value 
    });
    
    return transfer;
  }
}

module.exports = Transfer;