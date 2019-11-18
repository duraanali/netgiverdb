
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('assets').del()
    .then(function () {
      // Inserts seed entries
      return knex('assets').insert([
        {
          id: 1,
          name: 'chezdsSSasdasdeto',
          barcode: 6416,
          check_in_status: 0,
          img_id: "2",
          user_id: 1,
        }
      ]);
    });
};