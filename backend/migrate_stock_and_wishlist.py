from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        # Add stock_quantity column to products if not exists
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 10;"))
        
        # Create wishlists table if not exists
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS wishlists (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, product_id)
            );
        """))

        # Create stock_alerts table if not exists
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS stock_alerts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, product_id)
            );
        """))

        conn.commit()
        print("Successfully executed stock quantity, Wishlist, and Stock Alerts PostgreSQL migrations!")

if __name__ == "__main__":
    migrate()
