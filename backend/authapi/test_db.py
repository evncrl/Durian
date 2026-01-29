from db import users_collection

# Try to fetch the first user
result = users_collection.find_one()

if result:
    print("MongoDB connection works! First user:", result)
else:
    print("MongoDB connection works! But the users collection is empty.")
