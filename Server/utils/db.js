const nano = require('couchdb-nano');
//const db = nano('http://localhost:5984'); // URL de CouchDB
const db = nano('http://admin:admin@localhost:5984');

module.exports = db;
