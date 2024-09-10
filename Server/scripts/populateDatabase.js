const nano = require('nano')('http://admin:admin@miapp.localhost:5984'); // Reemplaza admin:admin con tu usuario y contraseña
const { faker } = require('@faker-js/faker'); // Usa @faker-js/faker

const dbName = 'bookstore';
let db;

async function setupDatabase() {
  try {
    // Crear o usar la base de datos existente
    const dbList = await nano.db.list();
    if (!dbList.includes(dbName)) {
      await nano.db.create(dbName);
    }
    db = nano.use(dbName);
    console.log(`Connected to database: ${dbName}`);

    // Generar autores
    const authorIds = [];
    for (let i = 1; i <= 50; i++) {
      const author = {
        type: 'author',
        name: faker.person.fullName(), // Actualizado
        date_of_birth: faker.date.past(50).toISOString().split('T')[0],
        country_of_origin: faker.location.country(), // Actualizado
        description: faker.lorem.sentence()
      };
      const result = await db.insert(author);
      authorIds.push(result.id);
    }
    console.log('Authors created successfully');

    // Generar libros con autores aleatorios
    const bookIds = [];
    for (let i = 1; i <= 300; i++) {
      const book = {
        type: 'book',
        name: faker.commerce.productName(),
        summary: faker.lorem.paragraph(),
        date_of_publication: faker.date.past(10).toISOString().split('T')[0],
        number_of_sales: faker.datatype.number({ min: 100, max: 10000 }),
        author: faker.helpers.arrayElement(authorIds) // Actualizado
      };
      const result = await db.insert(book);
      bookIds.push(result.id);
    }
    console.log('Books created successfully');

    // Generar reseñas
    for (const bookId of bookIds) {
      const numReviews = faker.datatype.number({ min: 1, max: 10 });
      for (let i = 1; i <= numReviews; i++) {
        const review = {
          type: 'review',
          book: bookId,
          review: faker.lorem.sentence(),
          score: faker.datatype.number({ min: 1, max: 5 }),
          number_of_upvotes: faker.datatype.number({ min: 0, max: 100 })
        };
        await db.insert(review);
      }
    }
    console.log('Reviews created successfully');

    // Generar ventas por año
    const years = [2019, 2020, 2021, 2022, 2023];  // 5 años de ventas
    for (const bookId of bookIds) {
      for (const year of years) {
        const sale = {
          type: 'sale',
          book: bookId,
          year: year,
          sales: faker.datatype.number({ min: 50, max: 500 })
        };
        await db.insert(sale);
      }
    }
    console.log('Sales created successfully');

  } catch (error) {
    console.error('Error populating database:', error);
  }
}

setupDatabase();
