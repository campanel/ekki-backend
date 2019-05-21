
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema
        .createTable('transfers', table => {
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
            table.integer('value')
            table.timestamps(true, true)
          })
      ])
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('transfers')
    ])
};
