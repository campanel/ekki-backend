const Knex = require('knex');
const connection = require('../knexfile');
const { Model } = require('objection');
const knexConnection = Knex(connection)

Model.knex(knexConnection)

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get relationMappings() {
    return {
      contacts: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'users.id',
          through: {
            from: 'user_contact.user_id',
            to: 'user_contact.contact_id'
          },
          to: 'users.id'
        }
      },
    };
  }

  static getAll() {
    return this.query();
  }

  static getById(id) {
    return this.query().findById(id);
  }

  static getByDocument(doc) {
    return this.query().where('document', doc).first();
  }

  static getLast() {
    return this.query().orderBy('id', 'desc').first();
  }

  static getByIdWithContacs(id) {
    return this.query().findById(id).eager('contacts');
  }

  static create(data) {
    return this.query()
    //.allowInsert('[name, document]')
    .insertGraph(data);
  }

  static async createContact(userId, data) {

    let contact = await this.createOrGetByDocument(data);
    return this.setContactByUserId(userId, contact);
  }

  static async createOrGetByDocument(data) {
    let user = await this.getByDocument(data.document);
    if(!user) user = await this.create(data);
    return user;
  }

  static async setContactByUserId(userId, contact) {
    const user = await this.getByIdWithContacs(userId);
    const relate = user.contacts.find(c => c.id === parseInt(contact.id));

    if(!relate) await user.$relatedQuery('contacts').relate(contact.id);

    return contact;
  }

  static update(id, data) {
    return this.query()
    .patchAndFetchById(id, data);    
  }

  static deleteById(userId) {
    return this.query().deleteById(userId);
  }
}

module.exports = User;