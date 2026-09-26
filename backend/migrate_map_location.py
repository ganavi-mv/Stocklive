from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE stores ADD COLUMN IF NOT EXISTS map_location_url VARCHAR;"))
        conn.commit()
        print("Successfully added map_location_url column to stores table in PostgreSQL!")

if __name__ == "__main__":
    migrate()
