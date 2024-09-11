const client = require('../utils/searchEngine');  // Importamos el cliente de Elasticsearch

const searchBooks = async (req, res) => {
  const { query, page = 1 } = req.query;
  const limit = 10;
  const from = (page - 1) * limit;

  try {
    // Realizamos la búsqueda en Elasticsearch
    const result = await client.search({
      index: 'books',  // El índice donde están los libros
      body: {
        query: {
          multi_match: {
            query: query,  // La palabra clave que estamos buscando
            fields: ['title', 'description'],  // Campos a buscar (título y descripción)
          },
        },
        from: from,  // Empezamos desde este resultado
        size: limit,  // Número de resultados por página
      },
    });

    // Obtenemos los documentos encontrados
    const books = result.hits.hits.map(hit => hit._source);

    // Total de páginas (basado en la cantidad de resultados)
    const totalPages = Math.ceil(result.hits.total.value / limit);

    res.json({ books, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = { searchBooks };