const db = require('../../data/dbConfig');

module.exports = {

    insert

};


function insert(auth) {
    return db("authSMS")
        .insert(auth, "id")
        .then(([id]) => getById(id));
}
