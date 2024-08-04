import couchdb
import random
from faker import Faker

# Connect to CouchDB server with authentication
username = 'admin'  # Replace with your CouchDB username
password = 'admin'  # Replace with your CouchDB password
couch = couchdb.Server(f'http://{username}:{password}@127.0.0.1:5984/')

# Create or use existing database
db_name = 'bookstore'
if db_name in couch:
    db = couch[db_name]
else:
    db = couch.create(db_name)

# Generate authors
author_ids = []
for i in range(1, 51):
    author = {
        "type": "author",
        "name": f"Author{i}",
        "date_of_birth": f"1970-01-{random.randint(1, 28):02d}",
        "country_of_origin": f"Country{i}",
        "description": f"Description for Author{i}."
    }
    doc_id, _ = db.save(author)
    author_ids.append(doc_id)

print("Authors created successfully")

# Generate books with random authors
book_ids = []
for i in range(1, 301):
    book = {
        "type": "book",
        "name": f"Book{i}",
        "summary": f"Summary for Book{i}.",
        "date_of_publication": f"2020-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
        "number_of_sales": random.randint(100, 10000),
        "author": random.choice(author_ids)  # Assign a random author to the book
    }
    doc_id, _ = db.save(book)
    book_ids.append(doc_id)

print("Books created successfully")

# Generate reviews
for book_id in book_ids:
    num_reviews = random.randint(1, 10)
    for i in range(1, num_reviews + 1):
        review = {
            "type": "review",
            "book": book_id,
            "review": f"Review{i} for {book_id}.",
            "score": random.randint(1, 5),
            "number_of_upvotes": random.randint(0, 100)
        }
        db.save(review)

print("Reviews created successfully")

# Generate sales by year
years = range(2019, 2024)  # 5 years of sales
for book_id in book_ids:
    for year in years:
        sale = {
            "type": "sale",
            "book": book_id,
            "year": year,
            "sales": random.randint(50, 500)
        }
        db.save(sale)

print("Sales created successfully")
