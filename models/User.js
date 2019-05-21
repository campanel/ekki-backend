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
        filter: query => query.select('user_contact.contact_id', 'name', 'document', 'cellphone'),
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

  static getContactByDocument(doc) {
    return this.query().select('id as contact_id', 'name', 'document', 'cellphone').where('document', doc).first();
  }

  static getLast() {
    return this.query().orderBy('id', 'desc').first();
  }

  static create(data) {
    return this.query()
    //.allowInsert('[name, document]')
    .insertGraph(data);
  }

  static async createContact(data) {
    let contact = {};
    const newContact =  await User.create(data);

    contact.contact_id = newContact.id;
    contact.name = newContact.name ? newContact.name: null; ;
    contact.document = newContact.document;
    contact.cellphone = newContact.cellphone ? newContact.cellphone: null;
      
    return contact;
  }

  static async getOrCreateContact(data) {
    let contact = await User.getContactByDocument(data.document);
    if(!contact) contact = await User.createContact(data);
    console.log(contact);
    return contact;
  }

  //funções não estaticas

  async update(data) {
    return await User.query()
    .patchAndFetchById(this.id, data);    
  }

  delete() {
    return User.query().deleteById(this.id);
  }

  async setOrCreateContact(data) {
    let contact = await User.getOrCreateContact(data);
    contact = await this.attachUniqueContact(contact);
    return contact;
  }

  async attachUniqueContact(contact) {
    const contacts = await this.getContacts();    
    const relate = await contacts.find(c => c.contact_id === parseInt(contact.contact_id));
    if(!relate) await this.$relatedQuery('contacts').relate(contact.contact_id);
    return contact;
  }

  async detachContact(contact_id) {
    const numUnrelatedRows = await this.$relatedQuery('contacts')
  .unrelate()
  .where('contact_id', contact_id);
    return true;
  }

  async contactAttached(data) {
    const contacts = await this.getContacts();
    const contact = await User.getContactByDocument(data.document);
    
    if(!contact) return false;
    const relate = await contacts.find(c => c.contact_id === parseInt(contact.contact_id));
    if(!relate) return false;
    return relate;
  }

  async getContacts() {
    const user = await User.query().findById(this.id).eager('contacts');
    const contacts = user.contacts.sort((a, b) => a.name.localeCompare(b.name));
    return await contacts;
  }
}

module.exports = User;