
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {name: 'Adiles Araujo', document: '00432132112', cellphone: '5191654800'},
        {name: 'Cléber Campanel', document: '20432132112', cellphone: '5191654801'},
        {name: 'Ana Luiza', document: '10432132112', cellphone: '51916548002'}
      ]);
    });
};
