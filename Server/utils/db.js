const nano = require('couchdb-nano');
const db = nano('http://localhost:5984'); // URL de CouchDB

module.exports = db;
