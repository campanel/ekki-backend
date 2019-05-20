
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema
        .createTable('users', table => {
          table.increments('id').primary();
          table.string('name');
          table.string('document').unique();
          table.string('cellphone');
          table.integer('balance').defaultTo('1000');
          table.integer('limit').defaultTo('500');
          table.timestamps(true, true)
        })
        .createTable('user_contact', table => {
            table.increments('id').primary();
            table
              .integer('user_id')
              .unsigned()
              .references('id')
              .inTable('users')
              .onDelete('CASCADE')
              .index();
            table
              .integer('contact_id')
              .unsigned()
              .references('id')
              .inTable('users')
              .onDelete('CASCADE')
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
