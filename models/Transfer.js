const Knex = require('knex');
const connection = require('../knexfile');
const { Model } = require('objection');
const { raw } = require('objection');
const knexConnection = Knex(connection)
const logger = require('../config/logger');

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

  delete() {
    return Transfer.query().deleteById(this.id);
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

  //equalLastTransfer
  static async equalLastTransfer(user_id, contact_id, value, minute = 2) {
    const transfer = await Transfer.query()
    .where('user_id', user_id)
    .where('contact_id', contact_id)
    .where('value', value)
    .where('updated_at', '>=', raw(`NOW() - INTERVAL ? MINUTE`, [minute]))
    .orderBy('updated_at','desc')
    .first();
    //console.log(transfer);
    logger.debug(transfer);
    return transfer;
  }

//updateDateTranfer
  static async updateDateTranfer(id) {
    const transfer = await Transfer.query()
    .findById(id)
    .patch({
      updated_at: raw(`NOW()`)
    });
    //console.log(transfer);
    logger.debug(transfer);
    return transfer;
  }


}

module.exports = Transfer;