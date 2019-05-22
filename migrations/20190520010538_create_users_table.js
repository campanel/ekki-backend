
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema
        .createTable('users', table => {
          table.increments('id').primary();
          table.string('name');
          table.string('document').unique();
          table.string('cellphone');
          table.string('balance').defaultTo('1000');
          table.string('limit').defaultTo('500');
          table.timestamps(true, true)
        })
        .createTable('user_contact', table => {
            table.increments('id').primary();
            table
              .integer('user_id')
              .unsigned()
              .references('id')
              .inTable('users')
              .index();
            table
              .integer('contact_id')
              .unsigned()
              .references('id')
              .inTable('users')
              .index();
            table.timestamps(true, true)
          })
      ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('user_contact')
        .dropTable('users')
    ])
};
