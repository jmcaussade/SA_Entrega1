const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://myapp.localhost/api/search-books',  // Use your custom domain
});

module.exports = client;
