const Knex = require('knex');
const connection = require('../knexfile');
const { Model } = require('objection');
const knexConnection = Knex(connection);
const Transfer = require('./Transfer');

global.transferCodes = {
  transferSuccessfully : 1,
  limitUsed : 2,
  transferUpdated : 3,
  errInsufficientFunds : 101,
  errTransfer : 102,
  errUserFunds : 103,
  errContactFunds : 104,
  errUpdateTransfer : 105,
};

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

      transfers: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        filter: query => query.select('transfers.id as transfer_id', 'transfers.contact_id', 'name', 'document', 'transfers.value', 'transfers.updated_at'),
        join: {
          from: 'users.id',
          through: {
            from: 'transfers.user_id',
            to: 'transfers.contact_id',
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

  static getContactById(id) {
    return this.query().select('id as contact_id', 'name', 'document', 'cellphone').where('id', id).first();
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
    return contact;
  }

  async update(data) {
    return await User.query()
    .patchAndFetchById(this.id, data);    
  }

  static async updateById(id, data) {
    return await User.query()
    .patchAndFetchById(id, data);    
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

  //sufficientFunds
  async sufficientFunds(value){
    if ((Number.parseFloat(this.balance) + Number.parseFloat(this.limit)) >= Number.parseFloat(value)) return true;
    return false; 
  }

  //sufficientBalance
  async sufficientBalance(value){
    if (Number.parseFloat(this.balance) >= Number.parseFloat(value)) return true;
    return false; 
  }

  async decreaseMoney(value) {
    const balance = Number.parseFloat(this.balance);
    const limit = Number.parseFloat(this.limit);
    const pay = Number.parseFloat(value);
    let newBalance = 0;
    let newLimit = 0;
    if(balance >= pay){
      newBalance = balance - pay;
      newLimit = limit;
    }else{
      newBalance = 0;
      newLimit = (balance + limit) - pay;  
    }

    const userupdated = await this.update({
      balance: newBalance,
      limit: newLimit
    });
    //console.log(transfer);
    //logger.debug(user);
    return userupdated;
  }

  async increaseMoney(value) {
    const balance = Number.parseFloat(this.balance);
    const limit = Number.parseFloat(this.limit);
    const pay = Number.parseFloat(value);
    const limitDefault = 500;
    let newBalance = 0;
    let newLimit = 0;
    if((balance + limit + pay) >= limitDefault){
      newBalance = (balance + limit + pay) - limitDefault;
      newLimit = limitDefault;
    }else{
      newBalance = 0;
      newLimit = (pay + limit);  
    }

    const userupdated = await this.update({
      balance: newBalance,
      limit: newLimit
    });
    //console.log(transfer);
    //logger.debug(user);
    return userupdated;
  }

  //transfers
  async transferMoney(contact_id, value) {
    let code = null;
    let message = null;
    let transfer = {};
    const oldBalance = this.balance;
    const oldLimit = this.balance;

    //Se for transferido em menos de 2 minutos, o mesmo valor, para o mesmo usuário,
    //cancelar a transação anterior e manter a última
    const equalLastTransfer =  await Transfer.equalLastTransfer(this.id, contact_id, value, 2);
    if (equalLastTransfer){
      code = global.transferCodes.transferUpdated;
      message = 'Transferência atualizada!';

      //Update apenas da data de atualização da transação
      const updateDateTranfer =  await Transfer.updateDateTranfer(equalLastTransfer.id);
      if (!updateDateTranfer){
        code = global.transferCodes.errUpdateTransfer;
        message = 'Erro ao atualizar a transferência!';
        return {code, message, transfer};
      }
      transfer = await Transfer.getById(equalLastTransfer.id);
      return {code, message, transfer};
    }
    
    //verificar total da conta (saldo + limite)
    const haveMoney =  await this.sufficientFunds(value);
    if (!haveMoney){
      code = global.transferCodes.errInsufficientFunds;
      message = 'Saldo insuficiente!';
      return {code, message, transfer};
    } 

    //verificar saldo, se valor maior que saldo, informar que sera utilizado limite
    const haveBalance =  await this.sufficientBalance(value);
    if (!haveBalance){
      code = global.transferCodes.limitUsed;
      message = 'O limite foi utilizado nesta transferência!';
    }

    //tranferencia
    transfer =  await Transfer.attachWithMoney(this.id, contact_id, value);
    if (!transfer){
      code = global.transferCodes.errTransfer;
      message = 'Erro na transferência!';
      return {code, message, transfer};
    }

    //atualizar saldo user
    const updateUserFunds =  await this.decreaseMoney(value);
    if (!updateUserFunds){
      //rolback
      await transfer.delete();
      code = global.transferCodes.errUserFunds;
      message = 'Erro ao atualizar seu saldo!';
      return {code, message, transfer};
    } 

    //atualizar valores do contato
    const userContact = await User.getById(contact_id);
    const updateContactFunds = await userContact.increaseMoney(value);
    if (!updateContactFunds){
      //rolback
      await transfer.delete();
      this.update( {balance:oldBalance, limit: oldLimit} );
      code = global.transferCodes.errContactFunds;
      message = 'Erro ao atualizar saldo do contato!';
      return {code, message, transfer};
    }

    if(code != global.transferCodes.limitUsed){
      code = global.transferCodes.transferSuccessfully;
      message = 'Transferência realizada com sucesso!';
    } 
    return {code, message, transfer};
  }

  async getTransfers() {
    const user = await User.query().findById(this.id).eager('transfers');
    const transfers = user.transfers.sort(function(a, b) {
      var dateA = new Date(b.updated_at), dateB = new Date(a.updated_at);
      return dateA - dateB;
  });
    return transfers;
  }
}

module.exports = User;