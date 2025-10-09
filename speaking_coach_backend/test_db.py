# test_db.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print("DB URL:", DATABASE_URL)

# Create engine
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        print("✅ Connected to:", result.fetchone())
except Exception as e:
    print("❌ Connection failed:", e)
