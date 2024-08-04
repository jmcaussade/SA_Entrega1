import couchdb

# Connect to CouchDB server with authentication
username = 'admin'  # Replace with your CouchDB username
password = 'admin'  # Replace with your CouchDB password
couch = couchdb.Server(f'http://{username}:{password}@127.0.0.1:5984/')

# Create or use an existing database
db_name = 'bookstore'
if db_name in couch:
    db = couch[db_name]
else:
    db = couch.create(db_name)

# Add an author
author = {
    "type": "author",
    "name": "Jane Doe",
    "date_of_birth": "1980-01-01",
    "country_of_origin": "USA",
    "description": "A well-known author."
}
db.save(author)

# Add a book
book = {
    "type": "book",
    "name": "Sample Book",
    "summary": "This is a sample book.",
    "date_of_publication": "2020-06-15",
    "number_of_sales": 1000
}
db.save(book)

# Add a review
review = {
    "type": "review",
    "book": "2",  # Replace with actual book ID
    "review": "This is a great book.",
    "score": 5,
    "number_of_upvotes": 100
}
db.save(review)

# Add sales by year
sale = {
    "type": "sale",
    "book": "2",  # Replace with actual book ID
    "year": 2023,
    "sales": 500
}
db.save(sale)
